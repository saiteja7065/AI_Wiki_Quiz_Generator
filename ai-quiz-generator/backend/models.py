"""
Pydantic Schemas for LLM output (QuizOutput)
Defines the strict JSON structure the LLM must return
"""
from pydantic import BaseModel, Field
from typing import List, Dict
from enum import Enum

class DifficultyLevel(str, Enum):
    """Difficulty levels for quiz questions"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuizQuestion(BaseModel):
    """Individual quiz question structure"""
    question: str = Field(..., description="The quiz question text")
    options: List[str] = Field(..., min_items=4, max_items=4, description="Four answer options (A-D)")
    answer: str = Field(..., description="The correct answer from the options")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level: easy, medium, or hard")
    explanation: str = Field(..., description="Short explanation of the correct answer")

class KeyEntities(BaseModel):
    """Key entities extracted from the article"""
    people: List[str] = Field(default_factory=list, description="Important people mentioned in the article")
    organizations: List[str] = Field(default_factory=list, description="Organizations, institutions, companies mentioned")
    locations: List[str] = Field(default_factory=list, description="Geographic locations, countries, cities mentioned")

class QuizOutput(BaseModel):
    """
    Complete quiz output structure that the LLM must return
    This matches the Sample API Output Structure from the assignment document
    """
    summary: str = Field(..., description="Brief summary of the Wikipedia article (2-3 sentences)")
    key_entities: KeyEntities = Field(..., description="Important entities extracted from the article")
    sections: List[str] = Field(..., description="Main sections/topics covered in the article")
    quiz: List[QuizQuestion] = Field(..., min_items=5, max_items=10, description="5-10 quiz questions based on the article")
    related_topics: List[str] = Field(..., description="Suggested related Wikipedia topics for further reading")

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "summary": "Alan Turing was a British mathematician and computer scientist who made fundamental contributions to computer science and artificial intelligence.",
                "key_entities": {
                    "people": ["Alan Turing", "Alonzo Church", "Christopher Morcom"],
                    "organizations": ["University of Cambridge", "Bletchley Park", "National Physical Laboratory"],
                    "locations": ["United Kingdom", "Cambridge", "Manchester"]
                },
                "sections": ["Early life", "Education", "World War II", "Computer science", "Legacy"],
                "quiz": [
                    {
                        "question": "Where did Alan Turing study?",
                        "options": [
                            "Harvard University",
                            "Cambridge University", 
                            "Oxford University",
                            "Princeton University"
                        ],
                        "answer": "Cambridge University",
                        "difficulty": "easy",
                        "explanation": "Turing studied at King's College, Cambridge, where he graduated with first-class honours in mathematics."
                    }
                ],
                "related_topics": ["Cryptography", "Enigma machine", "Computer science history", "Artificial intelligence"]
            }
        }