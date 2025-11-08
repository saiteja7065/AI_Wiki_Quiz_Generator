from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.mysql import LONGTEXT
from datetime import datetime
import os
import sys

# Database URL - Using MySQL/PostgreSQL/SQLite
# Format: 
#   PostgreSQL: postgresql://username:password@host:port/database_name
#   MySQL: mysql+pymysql://username:password@host:port/database_name
#   SQLite: sqlite:///./quiz_history.db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz_history.db")

# Validate DATABASE_URL
if not DATABASE_URL or DATABASE_URL.strip() == "":
    print("ERROR: DATABASE_URL environment variable is not set!")
    print("Please set DATABASE_URL in your Render environment variables.")
    print("Example: postgresql://user:pass@host:port/db")
    sys.exit(1)

# Log database type (without exposing credentials)
db_type = DATABASE_URL.split("://")[0] if "://" in DATABASE_URL else "unknown"
print(f"Connecting to {db_type} database...")

# Create SQLAlchemy engine with appropriate settings
try:
    if "mysql" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=300,    # Recycle connections every 5 minutes
            echo=False           # Set to True for SQL debugging
        )
    elif "postgresql" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False
        )
    else:
        engine = create_engine(DATABASE_URL)
    print(f"Database engine created successfully for {db_type}")
except Exception as e:
    print(f"ERROR: Failed to create database engine: {e}")
    print(f"DATABASE_URL format: {db_type}://...")
    sys.exit(1)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Quiz Model
class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    url = Column(String(500), nullable=False, index=True)  # Index for faster lookups
    title = Column(String(200), nullable=False)
    date_generated = Column(DateTime, default=datetime.utcnow, nullable=False)
    # Use LONGTEXT for MySQL to handle large Wikipedia articles (up to 4GB)
    # Falls back to Text for SQLite
    scraped_content = Column(LONGTEXT if "mysql" in DATABASE_URL else Text, nullable=True)
    full_quiz_data = Column(LONGTEXT if "mysql" in DATABASE_URL else Text, nullable=False)
    # Store user's answers as JSON string (e.g., {"0": "Option A", "1": "Option B"})
    user_answers = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}', url='{self.url}')>"

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()