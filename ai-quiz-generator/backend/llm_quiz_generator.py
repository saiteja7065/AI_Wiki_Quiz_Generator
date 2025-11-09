"""
LangChain setup, prompt templates, and chain logic
LLM Integration using Gemini model for quiz generation
"""
import os
from typing import Dict, Any
import json
from models import QuizOutput
from dotenv import load_dotenv
import logging
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuizGenerator:
    """
    LLM-powered quiz generator using Gemini via LangChain
    """
    
    def __init__(self):
        """Initialize the Gemini model via LangChain"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key or self.api_key == "YOUR_API_KEY_HERE":
            raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file.")
        
        # Initialize Gemini model via LangChain
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=self.api_key,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        
        logger.info("QuizGenerator initialized successfully with Gemini model via LangChain")
    
    def _create_prompt(self, article_text: str, article_title: str) -> str:
        """
        Create detailed prompt for quiz generation
        """
        return f"""
You are an expert educational content creator. Analyze this Wikipedia article and create a comprehensive quiz.

ARTICLE TITLE: {article_title}

ARTICLE TEXT:
{article_text}

Create a JSON response with this EXACT structure:
{{
  "summary": "Brief 2-3 sentence summary of the article",
  "key_entities": {{
    "people": ["list of important people mentioned"],
    "organizations": ["list of organizations, institutions, companies"],
    "locations": ["list of countries, cities, geographic locations"]
  }},
  "sections": ["list of 3-7 main topics/sections covered"],
  "quiz": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct option from the list above",
      "difficulty": "easy|medium|hard",
      "explanation": "Brief explanation of why this is correct"
    }}
  ],
  "related_topics": ["list of 3-6 related Wikipedia topics"]
}}

REQUIREMENTS:
- Generate 5-10 quiz questions
- Each question must have exactly 4 options
- Mix of difficulty levels (easy, medium, hard)
- All information must be from the article
- Questions should be educational and clear
- Provide accurate explanations

Return ONLY the JSON, no other text.
"""
    
    def generate_quiz(self, article_text: str, article_title: str) -> Dict[str, Any]:
        """
        Generate quiz from article text using Gemini
        
        Args:
            article_text (str): Clean Wikipedia article text
            article_title (str): Article title for context
            
        Returns:
            Dict[str, Any]: Generated quiz data matching QuizOutput schema
            
        Raises:
            Exception: If quiz generation fails
        """
        try:
            logger.info(f"Generating quiz for article: '{article_title}' ({len(article_text)} characters)")
            
            # Truncate article if too long (to fit within token limits)
            max_chars = 15000  # Approximate token limit consideration
            if len(article_text) > max_chars:
                article_text = article_text[:max_chars] + "..."
                logger.warning(f"Article truncated to {max_chars} characters due to length")
            
            # Create prompt
            prompt = self._create_prompt(article_text, article_title)
            
            # Generate content using Gemini via LangChain
            response = self.model.invoke(prompt)
            
            # Extract text from response
            response_text = response.content.strip()
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError as e:
                # Try to extract JSON from response if it has extra text
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError(f"Could not parse JSON from response: {e}")
            
            # Validate the result
            if not isinstance(result, dict):
                raise ValueError("LLM did not return a valid dictionary")
            
            # Ensure we have the required fields
            required_fields = ["summary", "key_entities", "sections", "quiz", "related_topics"]
            missing_fields = [field for field in required_fields if field not in result]
            if missing_fields:
                raise ValueError(f"Missing required fields in LLM output: {missing_fields}")
            
            # Validate quiz questions count
            quiz_questions = result.get("quiz", [])
            if not (5 <= len(quiz_questions) <= 10):
                logger.warning(f"Quiz has {len(quiz_questions)} questions, expected 5-10")
            
            logger.info(f"Successfully generated quiz with {len(quiz_questions)} questions")
            return result
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            raise Exception(f"Failed to generate quiz: {str(e)}")
    
    def test_connection(self) -> bool:
        """
        Test the connection to Gemini API
        
        Returns:
            bool: True if connection successful
        """
        try:
            test_response = self.model.invoke("Test connection. Respond with 'OK'.")
            if test_response and test_response.content:
                logger.info("✅ Gemini API connection test successful")
                return True
            else:
                logger.error("❌ Gemini API returned empty response")
                return False
        except Exception as e:
            logger.error(f"❌ Gemini API connection test failed: {e}")
            return False

# Global instance for use in FastAPI endpoints
quiz_generator = None

def get_quiz_generator() -> QuizGenerator:
    """
    Get or create the global quiz generator instance
    
    Returns:
        QuizGenerator: Initialized quiz generator
    """
    global quiz_generator
    if quiz_generator is None:
        quiz_generator = QuizGenerator()
    return quiz_generator

def test_quiz_generation():
    """
    Test quiz generation with sample text
    """
    sample_text = """
    Alan Turing was an English mathematician, computer scientist, logician, cryptanalyst, 
    philosopher, and theoretical biologist. Turing was highly influential in the development 
    of theoretical computer science, providing a formalisation of the concepts of algorithm 
    and computation with the Turing machine. He is widely considered to be the father of 
    theoretical computer science and artificial intelligence.
    """
    
    try:
        generator = get_quiz_generator()
        
        # Test API connection
        if not generator.test_connection():
            print("❌ API connection failed")
            return
        
        # Generate test quiz
        result = generator.generate_quiz(sample_text, "Alan Turing")
        
        print("✅ Quiz generation test successful!")
        print(f"📊 Generated {len(result['quiz'])} questions")
        print(f"📝 Summary: {result['summary'][:100]}...")
        
        return result
        
    except Exception as e:
        print(f"❌ Quiz generation test failed: {e}")
        return None

if __name__ == "__main__":
    # Test the quiz generator
    test_quiz_generation()
