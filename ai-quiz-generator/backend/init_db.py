"""
Database initialization script
Run this script to create the database and tables
"""
import os
from sqlalchemy import create_engine, text
from database import Base, engine, create_tables
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the quiz_generator database if it doesn't exist"""
    try:
        # Get database URL without database name for initial connection
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and "mysql" in db_url:
            # Extract connection details without database name
            base_url = db_url.rsplit('/', 1)[0]  # Remove database name
            temp_engine = create_engine(f"{base_url}/mysql")  # Connect to default mysql db
            
            with temp_engine.connect() as conn:
                # Create database if it doesn't exist
                conn.execute(text("CREATE DATABASE IF NOT EXISTS quiz_generator"))
                conn.commit()
                print("✅ Database 'quiz_generator' created successfully!")
                
        # Create all tables using the main engine
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        print("💡 Make sure MySQL is running and credentials are correct in .env file")

if __name__ == "__main__":
    create_database()