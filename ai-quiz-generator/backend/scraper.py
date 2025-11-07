"""
Wikipedia Scraper Module
Functions for fetching and cleaning Wikipedia HTML content
"""
import requests
from bs4 import BeautifulSoup
import re
from typing import Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_wikipedia(url: str) -> Tuple[str, str]:
    """
    Scrape Wikipedia article content and return clean text with title.
    
    Args:
        url (str): Wikipedia article URL
        
    Returns:
        Tuple[str, str]: (clean_text, article_title)
        
    Raises:
        Exception: If scraping fails or URL is invalid
    """
    try:
        # Validate Wikipedia URL
        if not _is_valid_wikipedia_url(url):
            raise ValueError("Invalid Wikipedia URL provided")
        
        # Set headers to mimic a real browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Fetch the webpage content
        logger.info(f"Fetching content from: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract article title
        title = _extract_title(soup)
        
        # Extract and clean main content
        clean_text = _extract_and_clean_content(soup)
        
        if not clean_text.strip():
            raise ValueError("No content could be extracted from the article")
        
        logger.info(f"Successfully scraped article: '{title}' ({len(clean_text)} characters)")
        return clean_text, title
        
    except requests.RequestException as e:
        logger.error(f"Network error while fetching {url}: {e}")
        raise Exception(f"Failed to fetch Wikipedia page: {e}")
    except Exception as e:
        logger.error(f"Error scraping Wikipedia: {e}")
        raise Exception(f"Scraping failed: {e}")

def _is_valid_wikipedia_url(url: str) -> bool:
    """
    Validate if the URL is a valid Wikipedia article URL.
    
    Args:
        url (str): URL to validate
        
    Returns:
        bool: True if valid Wikipedia URL
    """
    wikipedia_patterns = [
        r'https?://[a-z]{2,3}\.wikipedia\.org/wiki/.+',
        r'https?://wikipedia\.org/wiki/.+',
        r'https?://en\.wikipedia\.org/wiki/.+'
    ]
    
    return any(re.match(pattern, url) for pattern in wikipedia_patterns)

def _extract_title(soup: BeautifulSoup) -> str:
    """
    Extract article title from Wikipedia page.
    
    Args:
        soup (BeautifulSoup): Parsed HTML content
        
    Returns:
        str: Article title
    """
    # Try multiple selectors for title
    title_selectors = [
        'h1.firstHeading',
        'h1#firstHeading', 
        '.mw-page-title-main',
        'h1'
    ]
    
    for selector in title_selectors:
        title_element = soup.select_one(selector)
        if title_element:
            title = title_element.get_text().strip()
            # Remove any disambiguation text in parentheses
            title = re.sub(r'\s*\([^)]*\)$', '', title)
            return title
    
    # Fallback to page title
    title_tag = soup.find('title')
    if title_tag:
        title = title_tag.get_text().strip()
        # Remove " - Wikipedia" suffix
        title = re.sub(r'\s*-\s*Wikipedia.*$', '', title)
        return title
    
    return "Unknown Article"

def _extract_and_clean_content(soup: BeautifulSoup) -> str:
    """
    Extract and clean the main article content from Wikipedia page.
    
    Args:
        soup (BeautifulSoup): Parsed HTML content
        
    Returns:
        str: Clean article text
    """
    # Find the main content area using known Wikipedia CSS classes/IDs
    content_selectors = [
        '#mw-content-text .mw-parser-output',
        '#mw-content-text',
        '.mw-parser-output',
        '#content .mw-body-content'
    ]
    
    main_content = None
    for selector in content_selectors:
        main_content = soup.select_one(selector)
        if main_content:
            break
    
    if not main_content:
        # Fallback to body content
        main_content = soup.find('body')
    
    if not main_content:
        raise ValueError("Could not find main content area")
    
    # Remove unwanted elements
    _remove_unwanted_elements(main_content)
    
    # Extract text and clean it
    text = main_content.get_text()
    clean_text = _clean_text(text)
    
    return clean_text

def _remove_unwanted_elements(content: BeautifulSoup) -> None:
    """
    Remove unwanted HTML elements from the content.
    
    Args:
        content (BeautifulSoup): Content to clean
    """
    # Elements to remove completely
    unwanted_selectors = [
        'sup',  # Reference links
        '.reference',  # Reference sections
        '.navbox',  # Navigation boxes
        '.infobox',  # Info boxes (optional, contains useful info)
        '.hatnote',  # Hat notes
        '.dablink',  # Disambiguation links
        '.metadata',  # Metadata
        '.printfooter',  # Print footer
        '.catlinks',  # Category links
        '#toc',  # Table of contents
        '.toc',  # Table of contents
        'table.wikitable',  # Most tables (keep some for data)
        '.sidebar',  # Sidebars
        '.vertical-navbox',  # Vertical navigation
        'script',  # JavaScript
        'style',  # CSS
        '.mw-editsection',  # Edit section links
        '.thumbcaption .magnify',  # Image magnify links
    ]
    
    for selector in unwanted_selectors:
        for element in content.select(selector):
            element.decompose()
    
    # Remove most tables but keep some data tables
    for table in content.find_all('table'):
        # Keep tables that might contain useful data
        if not (table.get('class') and 
                any(cls in ['infobox', 'navbox', 'sidebar'] 
                    for cls in table.get('class', []))):
            # Remove complex tables, keep simple ones
            if len(table.find_all('table')) > 0:  # Nested tables
                table.decompose()
            elif len(table.find_all('tr')) > 20:  # Very large tables
                table.decompose()

def _clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace and unwanted characters.
    
    Args:
        text (str): Raw text to clean
        
    Returns:
        str: Cleaned text
    """
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Remove citation markers like [1], [citation needed], etc.
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\[citation needed\]', '', text)
    text = re.sub(r'\[clarification needed\]', '', text)
    text = re.sub(r'\[when\?\]', '', text)
    text = re.sub(r'\[who\?\]', '', text)
    
    # Remove edit links
    text = re.sub(r'\[edit\]', '', text)
    
    # Remove coordinate references
    text = re.sub(r'Coordinates:\s*\d+°[^.]*\.', '', text)
    
    # Remove multiple spaces
    text = re.sub(r'\s{2,}', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Ensure minimum content length
    if len(text) < 100:
        raise ValueError("Article content too short after cleaning")
    
    return text

def test_scraper(url: str = "https://en.wikipedia.org/wiki/Alan_Turing") -> None:
    """
    Test the scraper with a sample Wikipedia URL.
    
    Args:
        url (str): Wikipedia URL to test
    """
    try:
        clean_text, title = scrape_wikipedia(url)
        print(f"✅ Successfully scraped: {title}")
        print(f"📄 Content length: {len(clean_text)} characters")
        print(f"📝 First 200 characters: {clean_text[:200]}...")
        
    except Exception as e:
        print(f"❌ Scraping failed: {e}")

if __name__ == "__main__":
    # Test the scraper
    test_scraper()