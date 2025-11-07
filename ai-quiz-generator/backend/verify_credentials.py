"""
Credential Verification Script
Tests all required credentials and API connections for real-time operation
"""
import os
import sys
from dotenv import load_dotenv
import requests
from sqlalchemy import create_engine, text
import json

# Load environment variables
load_dotenv()

def check_environment_file():
    """Check if .env file exists and has required variables"""
    print("🔍 Checking Environment Configuration...")
    
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("💡 Create .env file in the backend directory")
        return False
    
    # Check required environment variables
    required_vars = ['GEMINI_API_KEY', 'DATABASE_URL']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value or value in ['YOUR_API_KEY_HERE', 'YOUR_ACTUAL_GEMINI_API_KEY_HERE']:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing or placeholder values for: {', '.join(missing_vars)}")
        print("💡 Please update .env file with actual credentials")
        return False
    
    print("✅ Environment file configured")
    return True

def test_gemini_api():
    """Test Gemini API connection"""
    print("\n🔍 Testing Gemini API Connection...")
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key in ['YOUR_API_KEY_HERE', 'YOUR_ACTUAL_GEMINI_API_KEY_HERE']:
        print("❌ Gemini API key not configured")
        print("💡 Get your API key from: https://makersuite.google.com/app/apikey")
        return False
    
    try:
        # Removed langchain import - using direct Google AI SDK
        
        # Initialize Gemini model
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Test connection with simple request
        response = model.generate_content("Hello, this is a connection test. Please respond with 'Connection successful'.")
        
        if response and response.text and "successful" in response.text.lower():
            print("✅ Gemini API connection successful")
            print(f"📝 Response: {response.text[:100]}...")
            return True
        else:
            print("⚠️ Gemini API responded but with unexpected content")
            print(f"📝 Response: {response.text if response else 'No response'}")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API connection failed: {e}")
        print("💡 Check your API key and internet connection")
        return False

def test_database_connection():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not configured")
        return False
    
    try:
        # Create engine and test connection
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            
            if test_value == 1:
                print("✅ Database connection successful")
                
                # Show database type
                if "mysql" in database_url:
                    print("📊 Database type: MySQL")
                elif "postgresql" in database_url:
                    print("📊 Database type: PostgreSQL")
                elif "sqlite" in database_url:
                    print("📊 Database type: SQLite")
                    print("⚠️ SQLite is not recommended for production")
                
                return True
            else:
                print("❌ Database test query failed")
                return False
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Check your database credentials and ensure the database server is running")
        return False

def test_wikipedia_scraping():
    """Test Wikipedia scraping functionality"""
    print("\n🔍 Testing Wikipedia Scraping...")
    
    try:
        from scraper import scrape_wikipedia
        
        # Test with a simple Wikipedia article
        test_url = "https://en.wikipedia.org/wiki/Python_(programming_language)"
        clean_text, title = scrape_wikipedia(test_url)
        
        if clean_text and title and len(clean_text) > 1000:
            print("✅ Wikipedia scraping successful")
            print(f"📝 Article: {title}")
            print(f"📊 Content length: {len(clean_text)} characters")
            return True
        else:
            print("❌ Wikipedia scraping failed - insufficient content")
            return False
            
    except Exception as e:
        print(f"❌ Wikipedia scraping failed: {e}")
        print("💡 Check your internet connection")
        return False

def test_full_pipeline():
    """Test the complete pipeline: Scraping + LLM + Database"""
    print("\n🔍 Testing Full Pipeline (Scraping → LLM → Database)...")
    
    try:
        from scraper import scrape_wikipedia
        from llm_quiz_generator import get_quiz_generator
        from database import SessionLocal, Quiz, create_tables
        from models import QuizOutput
        
        # Step 1: Create database tables
        create_tables()
        print("✅ Database tables ready")
        
        # Step 2: Scrape a short article for testing
        test_url = "https://en.wikipedia.org/wiki/Artificial_intelligence"
        clean_text, title = scrape_wikipedia(test_url)
        
        # Truncate for faster testing
        clean_text = clean_text[:3000] + "..." if len(clean_text) > 3000 else clean_text
        print(f"✅ Scraped article: {title}")
        
        # Step 3: Generate quiz using LLM
        quiz_generator = get_quiz_generator()
        quiz_data = quiz_generator.generate_quiz(clean_text, title)
        print(f"✅ Generated quiz with {len(quiz_data['quiz'])} questions")
        
        # Step 4: Validate with Pydantic
        validated_quiz = QuizOutput(**quiz_data)
        print("✅ Quiz data validated")
        
        # Step 5: Store in database
        db = SessionLocal()
        quiz_record = Quiz(
            url=test_url,
            title=title,
            scraped_content=clean_text,
            full_quiz_data=validated_quiz.model_dump_json()
        )
        
        db.add(quiz_record)
        db.commit()
        db.refresh(quiz_record)
        print(f"✅ Quiz saved to database with ID: {quiz_record.id}")
        
        # Step 6: Retrieve and verify
        stored_quiz = db.query(Quiz).filter(Quiz.id == quiz_record.id).first()
        retrieved_data = json.loads(stored_quiz.full_quiz_data)
        reconstructed_quiz = QuizOutput(**retrieved_data)
        
        print("✅ Quiz retrieved and deserialized successfully")
        print(f"📊 Final verification: {len(reconstructed_quiz.quiz)} questions stored")
        
        # Cleanup
        db.delete(stored_quiz)
        db.commit()
        db.close()
        print("✅ Test data cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Full pipeline test failed: {e}")
        print("💡 Check all previous tests passed before running full pipeline")
        return False

def main():
    """Run all credential and functionality tests"""
    print("🚀 AI Wiki Quiz Generator - Credential Verification")
    print("=" * 60)
    print("This script verifies all credentials and connections for real-time operation")
    print("No mock data or mock integrations - testing actual services")
    print("=" * 60)
    
    tests = [
        ("Environment Configuration", check_environment_file),
        ("Gemini API Connection", test_gemini_api),
        ("Database Connection", test_database_connection),
        ("Wikipedia Scraping", test_wikipedia_scraping),
        ("Full Pipeline", test_full_pipeline)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append(result)
            
            if not result:
                print(f"\n⚠️ {test_name} failed - stopping here")
                print("💡 Please fix the above issue before continuing")
                break
                
        except KeyboardInterrupt:
            print("\n👋 Test interrupted by user")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Unexpected error in {test_name}: {e}")
            results.append(False)
            break
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("\n" + "=" * 60)
    print(f"📊 VERIFICATION RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Your application is ready for real-time operation")
        print("\n🚀 Next steps:")
        print("   1. Start server: python start_server.py")
        print("   2. Test API: python test_fastapi_endpoints.py")
        print("   3. Access API docs: http://localhost:8000/docs")
    else:
        print("❌ Some tests failed")
        print("💡 Please check the SETUP_CREDENTIALS.md file for detailed instructions")
        print("🔗 Get Gemini API key: https://makersuite.google.com/app/apikey")
    
    print("=" * 60)

if __name__ == "__main__":
    main()