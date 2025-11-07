from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.mysql import LONGTEXT
from datetime import datetime
import os

# Database URL - Using MySQL
# Format: mysql+pymysql://username:password@host:port/database_name
# For local development, you can also use SQLite as fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz_history.db")

# Create SQLAlchemy engine with MySQL-specific settings
if "mysql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        echo=False           # Set to True for SQL debugging
    )
else:
    engine = create_engine(DATABASE_URL)

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