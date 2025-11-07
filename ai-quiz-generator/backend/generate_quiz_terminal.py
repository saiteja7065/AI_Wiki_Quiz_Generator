"""
Terminal-based Quiz Generator
Generate quizzes directly in the terminal for testing
"""
import sys
import json
from datetime import datetime
from scraper import scrape_wikipedia
from llm_quiz_generator import get_quiz_generator
from database import SessionLocal, Quiz, create_tables
from models import QuizOutput

def print_separator():
    """Print a visual separator"""
    print("=" * 80)

def print_quiz_question(question, index):
    """Print a formatted quiz question"""
    print(f"\n📝 Question {index + 1}: {question['question']}")
    print(f"   Difficulty: {question['difficulty'].upper()}")
    
    for i, option in enumerate(question['options']):
        print(f"   {chr(65 + i)}. {option}")
    
    print(f"   ✅ Answer: {question['answer']}")
    print(f"   💡 Explanation: {question['explanation']}")

def generate_quiz_terminal():
    """Generate a quiz in the terminal"""
    print_separator()
    print("🤖 AI Wiki Quiz Generator - Terminal Mode")
    print("Real-time quiz generation from Wikipedia articles")
    print_separator()
    
    # Get Wikipedia URL from user
    while True:
        url = input("\n📎 Enter Wikipedia article URL: ").strip()
        
        if not url:
            print("❌ Please enter a valid URL")
            continue
            
        if "wikipedia.org/wiki/" not in url:
            print("❌ Please enter a valid Wikipedia URL")
            continue
            
        break
    
    print(f"\n🔍 Processing: {url}")
    
    try:
        # Step 1: Scrape Wikipedia article
        print("📄 Scraping Wikipedia article...")
        clean_text, article_title = scrape_wikipedia(url)
        print(f"✅ Scraped: '{article_title}' ({len(clean_text):,} characters)")
        
        # Step 2: Generate quiz using AI
        print("🧠 Generating quiz with AI (this may take 10-30 seconds)...")
        quiz_generator = get_quiz_generator()
        quiz_data = quiz_generator.generate_quiz(clean_text, article_title)
        print(f"✅ Generated quiz with {len(quiz_data['quiz'])} questions")
        
        # Step 3: Validate data
        validated_quiz = QuizOutput(**quiz_data)
        print("✅ Quiz data validated")
        
        # Step 4: Display the quiz
        print_separator()
        print(f"🎯 QUIZ: {article_title}")
        print_separator()
        
        print(f"📋 Summary: {quiz_data['summary']}")
        
        print(f"\n🏷️ Key Entities:")
        for category, entities in quiz_data['key_entities'].items():
            if entities:
                print(f"   {category.title()}: {', '.join(entities[:5])}")
        
        print(f"\n📚 Sections: {', '.join(quiz_data['sections'])}")
        
        print(f"\n🎲 Quiz Questions ({len(quiz_data['quiz'])} total):")
        for i, question in enumerate(quiz_data['quiz']):
            print_quiz_question(question, i)
        
        print(f"\n🔗 Related Topics: {', '.join(quiz_data['related_topics'])}")
        
        # Step 5: Ask if user wants to save to database
        save_choice = input(f"\n💾 Save this quiz to database? (y/n): ").strip().lower()
        
        if save_choice in ['y', 'yes']:
            try:
                # Create tables if they don't exist
                create_tables()
                
                # Save to database
                db = SessionLocal()
                quiz_record = Quiz(
                    url=url,
                    title=article_title,
                    scraped_content=clean_text,
                    full_quiz_data=validated_quiz.model_dump_json()
                )
                
                db.add(quiz_record)
                db.commit()
                db.refresh(quiz_record)
                db.close()
                
                print(f"✅ Quiz saved to database with ID: {quiz_record.id}")
                
            except Exception as e:
                print(f"❌ Failed to save to database: {e}")
        
        print_separator()
        print("🎉 Quiz generation completed successfully!")
        print("💡 You can also access the API at: http://localhost:8000/docs")
        print_separator()
        
    except KeyboardInterrupt:
        print("\n👋 Quiz generation cancelled by user")
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error generating quiz: {e}")
        print("💡 Make sure your credentials are configured correctly")
        print("🔧 Run: python verify_credentials.py")

def show_quiz_history():
    """Show quiz history from database"""
    try:
        db = SessionLocal()
        quizzes = db.query(Quiz).order_by(Quiz.date_generated.desc()).limit(10).all()
        
        if not quizzes:
            print("📭 No quizzes found in database")
            return
        
        print_separator()
        print("📚 Recent Quiz History (Last 10)")
        print_separator()
        
        for quiz in quizzes:
            print(f"🆔 ID: {quiz.id}")
            print(f"📝 Title: {quiz.title}")
            print(f"🔗 URL: {quiz.url}")
            print(f"📅 Generated: {quiz.date_generated}")
            print("-" * 40)
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error fetching history: {e}")

def main():
    """Main terminal interface"""
    while True:
        print("\n🤖 AI Wiki Quiz Generator - Terminal Mode")
        print("1. Generate new quiz")
        print("2. Show quiz history")
        print("3. Exit")
        
        choice = input("\nSelect option (1-3): ").strip()
        
        if choice == '1':
            generate_quiz_terminal()
        elif choice == '2':
            show_quiz_history()
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1, 2, or 3.")

if __name__ == "__main__":
    main()