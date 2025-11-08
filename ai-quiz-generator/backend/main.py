"""
FastAPI application and API endpoints
Main backend server for AI Wiki Quiz Generator
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import logging
from datetime import datetime

# Import our modules
from database import get_db, Quiz, create_tables
from scraper import scrape_wikipedia
from llm_quiz_generator import get_quiz_generator
from models import QuizOutput

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Wiki Quiz Generator",
    description="Generate AI-powered quizzes from Wikipedia articles",
    version="1.0.0"
)

# Set up CORS middleware to allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic models for request/response
class GenerateQuizRequest(BaseModel):
    """Request model for generate_quiz endpoint"""
    url: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://en.wikipedia.org/wiki/Alan_Turing"
            }
        }

class QuizHistoryResponse(BaseModel):
    """Response model for quiz history"""
    id: int
    url: str
    title: str
    date_generated: datetime

class QuizDetailResponse(BaseModel):
    """Response model for detailed quiz data"""
    id: int
    url: str
    title: str
    date_generated: datetime
    summary: str
    key_entities: Dict[str, List[str]]
    sections: List[str]
    quiz: List[Dict[str, Any]]
    related_topics: List[str]
    user_answers: Optional[Dict[str, str]] = None

class SubmitAnswersRequest(BaseModel):
    """Request model for submitting quiz answers"""
    quiz_id: int
    answers: Dict[str, str]  # {"0": "Option A", "1": "Option B", ...}
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_id": 1,
                "answers": {
                    "0": "Guido van Rossum",
                    "1": "1991"
                }
            }
        }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables and verify credentials on startup"""
    try:
        # Initialize database tables
        create_tables()
        logger.info("Database tables initialized")
        
        # Verify Gemini API key is configured
        import os
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key in ["YOUR_API_KEY_HERE", "YOUR_ACTUAL_GEMINI_API_KEY_HERE"]:
            logger.error("GEMINI_API_KEY not configured! Quiz generation will not work.")
            logger.error("Get your API key from: https://makersuite.google.com/app/apikey")
        else:
            logger.info("Gemini API key configured")
            
        # Test LLM connection (optional, don't fail startup if it fails)
        try:
            quiz_generator = get_quiz_generator()
            if quiz_generator.test_connection():
                logger.info("Gemini API connection verified")
            else:
                logger.warning("Gemini API connection test failed - check your API key")
        except Exception as e:
            logger.warning(f"Could not verify Gemini API connection: {e}")
            
    except Exception as e:
        logger.error(f"Startup initialization failed: {e}")
        # Don't fail startup, but log the error

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Wiki Quiz Generator API", "status": "running"}

# Endpoint 1: /api/generate-quiz (POST)
@app.post("/api/generate-quiz", response_model=QuizDetailResponse)
async def generate_quiz(request: GenerateQuizRequest, db: Session = Depends(get_db)):
    """
    Generate a quiz from a Wikipedia article URL
    
    - Accepts a JSON body with the url
    - Calls scrape_wikipedia
    - Calls the LLM generation chain
    - Saves the data (serializing the quiz JSON to a string) into the database
    - Returns the full JSON data of the generated quiz
    """
    try:
        logger.info(f"Generating quiz for URL: {request.url}")
        
        # Step 1: Scrape Wikipedia article
        try:
            clean_text, article_title = scrape_wikipedia(request.url)
            logger.info(f"Successfully scraped article: '{article_title}' ({len(clean_text)} characters)")
        except Exception as e:
            logger.error(f"Scraping failed for {request.url}: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to scrape Wikipedia article: {str(e)}")
        
        # Step 2: Generate quiz using LLM
        try:
            quiz_generator = get_quiz_generator()
            quiz_data = quiz_generator.generate_quiz(clean_text, article_title)
            logger.info(f"Successfully generated quiz with {len(quiz_data['quiz'])} questions")
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
        
        # Step 3: Validate quiz data with Pydantic
        try:
            validated_quiz = QuizOutput(**quiz_data)
        except Exception as e:
            logger.error(f"Quiz validation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Generated quiz data is invalid: {str(e)}")
        
        # Step 4: Save to database (serializing the quiz JSON to a string)
        try:
            quiz_record = Quiz(
                url=request.url,
                title=article_title,
                scraped_content=clean_text,  # Store scraped content for bonus
                full_quiz_data=validated_quiz.model_dump_json()  # Serialize to JSON string
            )
            
            db.add(quiz_record)
            db.commit()
            db.refresh(quiz_record)
            
            logger.info(f"Quiz saved to database with ID: {quiz_record.id}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Database save failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save quiz to database: {str(e)}")
        
        # Step 5: Return the full JSON data of the generated quiz
        response_data = {
            "id": quiz_record.id,
            "url": quiz_record.url,
            "title": quiz_record.title,
            "date_generated": quiz_record.date_generated,
            **quiz_data  # Include all quiz data (summary, key_entities, sections, quiz, related_topics)
        }
        
        return response_data
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Endpoint 2: /api/history (GET)
@app.get("/api/history", response_model=List[QuizHistoryResponse])
async def get_quiz_history(db: Session = Depends(get_db)):
    """
    Get history of all generated quizzes
    
    - Queries the database for a list of all saved quizzes
    - Returns a simple list of objects containing id, url, title, and date_generated
    """
    try:
        logger.info("Fetching quiz history")
        
        # Query database for all quizzes, ordered by most recent first
        quizzes = db.query(Quiz).order_by(Quiz.date_generated.desc()).all()
        
        # Return simple list with id, url, title, and date_generated
        history = [
            {
                "id": quiz.id,
                "url": quiz.url,
                "title": quiz.title,
                "date_generated": quiz.date_generated
            }
            for quiz in quizzes
        ]
        
        logger.info(f"Retrieved {len(history)} quizzes from history")
        return history
        
    except Exception as e:
        logger.error(f"Error fetching quiz history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz history: {str(e)}")

# Endpoint 3: /api/quiz/{quiz_id} (GET)
@app.get("/api/quiz/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz_by_id(quiz_id: int, db: Session = Depends(get_db)):
    """
    Get a specific quiz by ID
    
    - Fetches a specific quiz record by id
    - CRUCIAL: Deserialize the full_quiz_data text field back into a Python dictionary/JSON object before returning it in the response
    """
    try:
        logger.info(f"Fetching quiz with ID: {quiz_id}")
        
        # Fetch quiz record by ID
        quiz_record = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        
        if not quiz_record:
            logger.warning(f"Quiz with ID {quiz_id} not found")
            raise HTTPException(status_code=404, detail=f"Quiz with ID {quiz_id} not found")
        
        # CRUCIAL: Deserialize the full_quiz_data text field back into a Python dictionary/JSON object
        try:
            quiz_data = json.loads(quiz_record.full_quiz_data)
            logger.info(f"Successfully deserialized quiz data for ID {quiz_id}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize quiz data for ID {quiz_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Quiz data is corrupted for ID {quiz_id}")
        
        # Validate deserialized data
        try:
            validated_quiz = QuizOutput(**quiz_data)
        except Exception as e:
            logger.error(f"Quiz data validation failed for ID {quiz_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Quiz data is invalid for ID {quiz_id}")
        
        # Deserialize user answers if they exist
        user_answers = None
        if quiz_record.user_answers:
            try:
                user_answers = json.loads(quiz_record.user_answers)
            except json.JSONDecodeError:
                logger.warning(f"Failed to deserialize user answers for quiz {quiz_id}")
        
        # Return complete quiz data
        response_data = {
            "id": quiz_record.id,
            "url": quiz_record.url,
            "title": quiz_record.title,
            "date_generated": quiz_record.date_generated,
            "user_answers": user_answers,
            **quiz_data  # Include deserialized quiz data
        }
        
        logger.info(f"Successfully retrieved quiz {quiz_id} with {len(quiz_data['quiz'])} questions")
        return response_data
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching quiz {quiz_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Additional utility endpoints

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test database connection
        db = next(get_db())
        db.execute("SELECT 1")
        db.close()
        
        # Test LLM connection (if API key is set)
        try:
            quiz_generator = get_quiz_generator()
            llm_status = "ready" if quiz_generator.test_connection() else "api_key_needed"
        except Exception:
            llm_status = "api_key_needed"
        
        return {
            "status": "healthy",
            "database": "connected",
            "llm": llm_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get basic statistics about generated quizzes"""
    try:
        total_quizzes = db.query(Quiz).count()
        
        return {
            "total_quizzes": total_quizzes,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Endpoint 4: /api/submit-answers (POST)
@app.post("/api/submit-answers")
async def submit_answers(request: SubmitAnswersRequest, db: Session = Depends(get_db)):
    """
    Save user's answers for a quiz
    
    - Accepts quiz_id and answers dictionary
    - Updates the quiz record with user's answers
    - Returns success status
    """
    try:
        logger.info(f"Saving answers for quiz ID: {request.quiz_id}")
        
        # Fetch quiz record by ID
        quiz_record = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
        
        if not quiz_record:
            logger.warning(f"Quiz with ID {request.quiz_id} not found")
            raise HTTPException(status_code=404, detail=f"Quiz with ID {request.quiz_id} not found")
        
        # Save user answers as JSON string
        quiz_record.user_answers = json.dumps(request.answers)
        db.commit()
        
        logger.info(f"Successfully saved answers for quiz {request.quiz_id}")
        
        return {
            "success": True,
            "message": "Answers saved successfully",
            "quiz_id": request.quiz_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving answers for quiz {request.quiz_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save answers: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )