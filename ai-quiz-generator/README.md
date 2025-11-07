# AI Quiz Generator

Generate interactive quizzes from Wikipedia articles using AI.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini to generate quiz questions
- 📚 **Wikipedia Integration**: Scrapes content from any Wikipedia article
- 💾 **Quiz History**: Saves all generated quizzes to MySQL database
- 🎯 **Interactive Quizzes**: Test your knowledge with multiple-choice questions
- 📊 **Score Tracking**: Get immediate feedback on your performance
- 💡 **Explanations**: Learn from detailed explanations for each question

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Google Gemini AI** - Quiz generation
- **MySQL** - Database storage
- **BeautifulSoup4** - Wikipedia scraping
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Yarn** - Package manager

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL database
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create .env file with:
# GEMINI_API_KEY=your_gemini_api_key
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/quiz_generator

# Run migration (if needed)
python migrate_database.py

# Start server
python main.py
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

Frontend runs on: http://localhost:5173

## Usage

1. **Generate Quiz**
   - Enter a Wikipedia URL
   - Click "Generate Quiz"
   - Wait for AI to create questions
   - Take the interactive quiz
   - Submit to see your score

2. **View History**
   - Click "History" tab
   - See all generated quizzes
   - Click "Details" to review any quiz

## API Endpoints

- `POST /api/generate-quiz` - Generate quiz from Wikipedia URL
- `GET /api/history` - Get all quiz history
- `GET /api/quiz/{id}` - Get specific quiz by ID
- `GET /health` - Health check
- `GET /docs` - API documentation

## Project Structure

```
ai-quiz-generator/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database models
│   ├── scraper.py           # Wikipedia scraper
│   ├── llm_quiz_generator.py # AI quiz generation
│   ├── models.py            # Pydantic models
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service
│   │   └── utils/           # Utilities
│   └── package.json         # Node dependencies
│
└── README.md
```

## Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/quiz_generator
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000
```

## Database Schema

```sql
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(200) NOT NULL,
    date_generated DATETIME NOT NULL,
    scraped_content LONGTEXT,
    full_quiz_data LONGTEXT NOT NULL
);
```

## Example Wikipedia URLs

- https://en.wikipedia.org/wiki/Artificial_intelligence
- https://en.wikipedia.org/wiki/Python_(programming_language)
- https://en.wikipedia.org/wiki/Machine_learning
- https://en.wikipedia.org/wiki/React_(JavaScript_library)

## Features in Detail

### Interactive Quiz Mode
- Click to select answers
- Progress tracking
- Submit button
- Score display with feedback
- Correct/wrong indicators
- Detailed explanations
- Try again functionality

### Study Mode (History)
- All correct answers visible
- Immediate access to explanations
- No interaction needed
- Perfect for reviewing

## Troubleshooting

### Backend Issues
- **Port 5000 in use**: Change port in `main.py`
- **Database connection error**: Check DATABASE_URL in `.env`
- **Gemini API error**: Verify API key in `.env`

### Frontend Issues
- **Port 5173 in use**: Vite will use next available port
- **API connection error**: Ensure backend is running
- **Build errors**: Try `yarn install --force`

## License

MIT

## Author

Built with ❤️ for learning and education
