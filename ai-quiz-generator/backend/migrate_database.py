"""
Database Migration Script
Converts TEXT columns to LONGTEXT for MySQL to handle large Wikipedia articles
"""
import os
from sqlalchemy import create_engine, text
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_to_longtext():
    """Migrate TEXT columns to LONGTEXT for MySQL databases"""
    
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz_history.db")
    
    # Only run migration for MySQL databases
    if "mysql" not in DATABASE_URL:
        logger.info("Not a MySQL database, skipping migration")
        return
    
    logger.info("Starting database migration...")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Alter scraped_content column to LONGTEXT
            logger.info("Altering scraped_content column to LONGTEXT...")
            connection.execute(text(
                "ALTER TABLE quizzes MODIFY COLUMN scraped_content LONGTEXT"
            ))
            connection.commit()
            logger.info("✓ scraped_content column migrated")
            
            # Alter full_quiz_data column to LONGTEXT
            logger.info("Altering full_quiz_data column to LONGTEXT...")
            connection.execute(text(
                "ALTER TABLE quizzes MODIFY COLUMN full_quiz_data LONGTEXT NOT NULL"
            ))
            connection.commit()
            logger.info("✓ full_quiz_data column migrated")
            
        logger.info("✅ Migration completed successfully!")
        logger.info("Database can now handle large Wikipedia articles (up to 4GB)")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_to_longtext()
