/**
 * Validates if a URL is a valid Wikipedia URL
 * @param {string} url - URL to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateWikipediaUrl = (url) => {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  try {
    const urlObj = new URL(url);
    
    // Check if it's a Wikipedia domain
    const isWikipedia = urlObj.hostname.includes('wikipedia.org');
    
    if (!isWikipedia) {
      return {
        isValid: false,
        error: 'Please enter a valid Wikipedia URL (e.g., https://en.wikipedia.org/wiki/...)',
      };
    }

    // Check if it's a wiki article (contains /wiki/)
    if (!urlObj.pathname.includes('/wiki/')) {
      return {
        isValid: false,
        error: 'Please enter a Wikipedia article URL (must contain /wiki/)',
      };
    }

    return {
      isValid: true,
      error: null,
    };
  } catch (e) {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
    };
  }
};
