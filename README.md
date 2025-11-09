AI Wiki Quiz Generator
A full-stack application that leverages AI to transform Wikipedia articles into structured, engaging quizzes using FastAPI backend and React frontend.

🎯 Features
Quiz Generation: Automatically generate 5-10 questions from any Wikipedia article
Interactive Testing: Take quizzes with immediate feedback and scoring
Quiz History: View and retake previously generated quizzes
Answer Tracking: System remembers your answers for review
AI-Powered: Uses Google Gemini LLM via LangChain for intelligent question generation
📋 Requirements
Python 3.10+
Node.js 16+ and npm/yarn
Google Gemini API Key (free tier)
SQLite (included with Python)
🚀 Quick Start
Backend Setup
Navigate to backend folder

cd ai-quiz-generator/backend
Create virtual environment

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
Install dependencies

pip install -r requirements.txt
Configure API Key

Create .env file in backend folder:

GEMINI_API_KEY=your_api_key_here
Get your free API key: https://makersuite.google.com/app/apikey

Start backend server

python main.py
Server runs on: http://localhost:8000

Frontend Setup
Navigate to frontend folder

cd ai-quiz-generator/frontend
Install dependencies

npm install
Start development server

npm run dev
Frontend runs on: http://localhost:5173

📁 Project Structure
ai-quiz-generator/
├── backend/
│   ├── venv/                       # Python Virtual Environment
│   ├── database.py                 # SQLAlchemy setup and Quiz model
│   ├── models.py                   # Pydantic Schemas for LLM output
│   ├── scraper.py                  # Wikipedia scraping functions
│   ├── llm_quiz_generator.py       # LangChain setup and quiz generation
│   ├── main.py                     # FastAPI application and endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # API keys (create this)
│   └── quiz_history.db             # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── QuizDisplay.jsx     # Quiz rendering component
│   │   │   └── HistoryTable.jsx    # History table component
│   │   ├── services/
│   │   │   └── api.js              # API communication functions
│   │   ├── tabs/
│   │   │   ├── GenerateQuizTab.jsx # Quiz generation tab
│   │   │   └── HistoryTab.jsx      # History viewing tab
│   │   ├── App.jsx                 # Main React component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.js
│
├── sample_data/
│   ├── test_urls.txt               # Example Wikipedia URLs
│   └── sample_api_output.json      # Sample API response
│
├── README.md                       # This file
└── SETUP_INSTRUCTIONS.md           # Detailed setup guide
🔌 API Endpoints
1. Generate Quiz
POST /api/generate-quiz
Request Body:
{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}
Response: Complete quiz data with questions, answers, explanations, and metadata
2. Get Quiz History
GET /api/history
Response: List of all generated quizzes with id, url, title, and date
3. Get Quiz by ID
GET /api/quiz/{quiz_id}
Response: Full quiz data including user's previous answers (if any)
4. Submit Answers
POST /api/submit-answers
Request Body:
{
  "quiz_id": 1,
  "answers": {
    "0": "Cambridge University",
    "1": "Breaking the Enigma code"
  }
}
Response: Success confirmation
🧪 Testing
Test URLs
Try these Wikipedia articles:

https://en.wikipedia.org/wiki/Alan_Turing
https://en.wikipedia.org/wiki/Artificial_intelligence
https://en.wikipedia.org/wiki/Python_(programming_language)
https://en.wikipedia.org/wiki/Machine_learning
https://en.wikipedia.org/wiki/World_War_II
Testing Steps
Generate a Quiz

Open the application
Enter a Wikipedia URL
Click "Generate Quiz"
Wait for AI to process (10-30 seconds)
Take the Quiz

Read each question
Select your answers
Click "Submit Quiz" when all questions are answered
View your score, percentage, and grade
View History

Switch to "History" tab
See all previously generated quizzes
Click "Details" to view any quiz
Your previous answers will be shown (if you took the quiz)
🎨 Features Implemented
Core Features
✅ Wikipedia article scraping with BeautifulSoup
✅ AI-powered quiz generation using Google Gemini
✅ Structured JSON output with Pydantic validation
✅ SQLite database for persistence
✅ FastAPI backend with CORS support
✅ React frontend with Tailwind CSS
✅ Interactive quiz taking mode
✅ Quiz history with details view
✅ Answer tracking and review
Bonus Features
✅ "Take Quiz" mode with user scoring
✅ URL validation and error handling
✅ Store scraped raw content in database
✅ Answer persistence for quiz review
✅ Responsive UI design
✅ Loading states and error messages
🛠️ Technologies Used
Backend
FastAPI: Modern Python web framework
SQLAlchemy: SQL toolkit and ORM
BeautifulSoup4: HTML parsing and web scraping
LangChain: LLM application framework
Google Gemini: Large Language Model
Pydantic: Data validation
Python-dotenv: Environment variable management
Frontend
React: UI library
Vite: Build tool and dev server
Tailwind CSS: Utility-first CSS framework
Fetch API: HTTP requests
📝 LangChain Prompt Template
The application uses a carefully crafted prompt template to ensure high-quality quiz generation:

QUIZ_GENERATION_PROMPT = """
You are an expert educational content creator. Generate a comprehensive quiz based on the following Wikipedia article.

Article Title: {title}
Article Content: {content}

Generate a quiz with 5-10 questions that:
1. Cover different sections and aspects of the article
2. Include a mix of difficulty levels (easy, medium, hard)
3. Have clear, unambiguous questions
4. Provide 4 options for each question
5. Include detailed explanations for correct answers
6. Are factually accurate and grounded in the article content

{format_instructions}
"""
🐛 Troubleshooting
Backend Issues
Server won't start: Ensure virtual environment is activated and dependencies are installed
API key error: Verify GEMINI_API_KEY is set correctly in .env file
Database error: Delete quiz_history.db and restart server to recreate
Frontend Issues
Can't connect to backend: Ensure backend is running on port 8000
CORS errors: Check CORS middleware configuration in main.py
Build errors: Delete node_modules and run npm install again
Quiz Generation Issues
Timeout errors: Wikipedia article may be too long, try a shorter article
Invalid JSON: LLM may have failed, try regenerating
No questions generated: Check backend logs for LLM errors
📄 License
This project is created for educational purposes as part of the DeepKlarity Technologies assignment.

👥 Author
Created as part of the AI Wiki Quiz Generator assignment.

🙏 Acknowledgments
Google Gemini for providing free tier LLM access
Wikipedia for open knowledge
FastAPI and React communities for excellent documentation
