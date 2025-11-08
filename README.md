# 🧠 AI Quiz Generator

Transform Wikipedia articles into interactive, AI-powered quizzes with a stunning cyberpunk interface.

![AI Quiz Generator](https://img.shields.io/badge/AI-Powered-blueviolet)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.121-009688)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **AI-Powered Quiz Generation** - Uses Google Gemini 2.0 Flash to create intelligent quizzes
- 📚 **Wikipedia Integration** - Scrapes and processes any Wikipedia article
- 🎨 **Cyberpunk UI** - Unique glassmorphism design with neon effects
- 💾 **Quiz History** - Save and review all generated quizzes
- 📊 **Interactive Results** - Real-time scoring with detailed explanations
- 🌐 **Full-Stack Application** - React frontend + FastAPI backend
- 🗄️ **Database Support** - PostgreSQL/MySQL/SQLite compatible

## 🚀 Live Demo

- **Frontend:** [https://ai-quiz-generator.vercel.app](https://ai-quiz-generator.vercel.app)
- **Backend API:** [https://ai-quiz-generator-backend.onrender.com](https://ai-quiz-generator-backend.onrender.com)
- **API Docs:** [https://ai-quiz-generator-backend.onrender.com/docs](https://ai-quiz-generator-backend.onrender.com/docs)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling with custom cyberpunk theme
- **Vercel** - Hosting

### Backend
- **Python 3.12** - Programming language
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Google Gemini AI** - LLM for quiz generation
- **BeautifulSoup4** - Web scraping
- **Pydantic** - Data validation
- **Render** - Hosting

### Database
- **PostgreSQL** (Production - Neon)
- **MySQL** (Alternative)
- **SQLite** (Development)

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))
- PostgreSQL/MySQL (for production)

## 🏃 Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-quiz-generator.git
   cd ai-quiz-generator/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

5. **Run the server**
   ```bash
   python main.py
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Render):**
- Push to GitHub
- Connect repository on Render
- Add environment variables
- Deploy automatically

## 🎯 Usage

1. **Generate Quiz**
   - Enter any Wikipedia article URL
   - Click "Generate Quiz with AI"
   - Wait for AI to process (30-60 seconds)
   - Answer the questions

2. **View History**
   - Click "History" tab
   - See all previously generated quizzes
   - Click "View" to review any quiz

3. **Take Quiz**
   - Select answers for each question
   - Click "Submit Quiz"
   - View your score and explanations

## 🏗️ Project Structure

```
ai-quiz-generator/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── scraper.py           # Wikipedia scraper
│   ├── llm_quiz_generator.py # AI quiz generation
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── tabs/            # Tab components
│   │   ├── services/        # API service
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Tailwind styles
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   └── vercel.json          # Vercel configuration
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
└── README.md                # This file
```

## 🔧 Configuration

### Backend Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@host:port/db
ENVIRONMENT=development
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## 📊 API Endpoints

### Generate Quiz
```http
POST /api/generate-quiz
Content-Type: application/json

{
  "url": "https://en.wikipedia.org/wiki/Python_(programming_language)"
}
```

### Get History
```http
GET /api/history
```

### Get Quiz by ID
```http
GET /api/quiz/{quiz_id}
```

### Submit Answers
```http
POST /api/submit-answers
Content-Type: application/json

{
  "quiz_id": 1,
  "answers": {
    "0": "Option A",
    "1": "Option B"
  }
}
```

## 🎨 Features Showcase

### AI-Powered Generation
- Analyzes Wikipedia articles using Google Gemini AI
- Generates 5-10 contextual questions
- Creates multiple-choice options
- Provides detailed explanations

### Cyberpunk UI
- Glassmorphism effects
- Animated gradient backgrounds
- Neon glow effects
- Smooth transitions
- Responsive design

### Quiz Management
- Save quiz history
- Review past quizzes
- Track answers
- View explanations

## 🐛 Troubleshooting

### Backend Issues

**Cold Start Delay (Render)**
- First request may take 30+ seconds
- Use UptimeRobot to keep backend alive

**Database Connection Error**
- Verify DATABASE_URL is correct
- Ensure database is accessible
- Check SSL mode for PostgreSQL

### Frontend Issues

**CORS Error**
- Verify backend CORS configuration
- Check VITE_API_URL is correct
- Ensure backend is running

**Build Errors**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for quiz generation
- Wikipedia for article content
- FastAPI for the amazing web framework
- React and Vite for the frontend tools
- Tailwind CSS for styling utilities

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/YOUR_USERNAME/ai-quiz-generator](https://github.com/YOUR_USERNAME/ai-quiz-generator)

---

**Made with ❤️ and AI**
