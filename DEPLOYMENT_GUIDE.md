# 🚀 AI Quiz Generator - Complete Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon PostgreSQL)](#step-1-database-setup)
3. [Backend Deployment (Render)](#step-2-backend-deployment)
4. [Frontend Deployment (Vercel)](#step-3-frontend-deployment)
5. [Testing & Verification](#step-4-testing)
6. [Troubleshooting](#troubleshooting)
7. [Optional: Custom Domain](#optional-custom-domain)

---

## Prerequisites

### What You Need:
- ✅ GitHub account
- ✅ Vercel account (sign up with GitHub)
- ✅ Render account (sign up with GitHub)
- ✅ Neon account (sign up with GitHub)
- ✅ Your Gemini API key
- ✅ Git installed on your computer

### Estimated Time:
- **Total:** 30-45 minutes
- Database: 5 minutes
- Backend: 15 minutes
- Frontend: 10 minutes
- Testing: 5 minutes

---

## STEP 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Neon

### 1.2 Create Database Project
1. Click **"Create a project"**
2. Project settings:
   - **Name:** `ai-quiz-generator`
   - **Region:** Choose closest to you (e.g., US East, EU West)
   - **PostgreSQL version:** 16 (latest)
3. Click **"Create project"**

### 1.3 Get Connection String
1. After creation, you'll see the dashboard
2. Click **"Connection string"** tab
3. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **SAVE THIS** - you'll need it for backend deployment

### 1.4 Create Database Table
1. Click **"SQL Editor"** in Neon dashboard
2. Run this SQL to create the table:
   ```sql
   CREATE TABLE quizzes (
       id SERIAL PRIMARY KEY,
       url VARCHAR(500) NOT NULL,
       title VARCHAR(200) NOT NULL,
       date_generated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
       scraped_content TEXT,
       full_quiz_data TEXT NOT NULL,
       user_answers TEXT
   );
   
   CREATE INDEX idx_quizzes_url ON quizzes(url);
   CREATE INDEX idx_quizzes_date ON quizzes(date_generated);
   ```
3. Click **"Run"**
4. You should see: `CREATE TABLE` and `CREATE INDEX` success messages

✅ **Database setup complete!**

---

## STEP 2: Backend Deployment (Render)

### 2.1 Prepare Backend for Deployment

#### Update requirements.txt
Already done! Your `requirements.txt` includes all dependencies.

#### Update database.py for PostgreSQL
Already configured! The code supports both MySQL and PostgreSQL.

### 2.2 Create GitHub Repository

1. **Initialize Git** (if not already done):
   ```bash
   cd "E:\NXTWave Placement Projects\AI Quiz Generator"
   git init
   ```

2. **Create .gitignore** (if not exists):
   ```bash
   # Already created, but verify it includes:
   # venv/
   # __pycache__/
   # .env
   # *.pyc
   # node_modules/
   # .DS_Store
   ```

3. **Commit your code**:
   ```bash
   git add .
   git commit -m "Initial commit - AI Quiz Generator"
   ```

4. **Create GitHub repository**:
   - Go to https://github.com/new
   - Repository name: `ai-quiz-generator`
   - Make it **Public** (required for free Render)
   - Don't initialize with README (you already have code)
   - Click **"Create repository"**

5. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-quiz-generator.git
   git branch -M main
   git push -u origin main
   ```

### 2.3 Deploy to Render

1. **Go to Render**:
   - Visit https://render.com
   - Click **"Get Started"** or **"Sign Up"**
   - Choose **"Continue with GitHub"**
   - Authorize Render

2. **Create New Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Click **"Connect a repository"**
   - Find and select `ai-quiz-generator`
   - Click **"Connect"**

3. **Configure Web Service**:
   ```
   Name: ai-quiz-generator-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: ai-quiz-generator/backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   ```
   GEMINI_API_KEY = your_actual_gemini_api_key_here
   DATABASE_URL = your_neon_connection_string_here
   ENVIRONMENT = production
   ```
   
   Example:
   ```
   GEMINI_API_KEY = AIzaSyDrTUxIFH8PPJLHWLm5XlVYv3FOXIB_hVA
   DATABASE_URL = postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ENVIRONMENT = production
   ```

5. **Create Web Service**:
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for deployment
   - Watch the logs for any errors

6. **Verify Backend**:
   - Once deployed, you'll get a URL like: `https://ai-quiz-generator-backend.onrender.com`
   - Click on it and add `/health` to test: `https://ai-quiz-generator-backend.onrender.com/health`
   - You should see: `{"status":"healthy","database":"connected","llm":"ready"}`

✅ **Backend deployed!** Copy your backend URL for the next step.

---

## STEP 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend for Deployment

#### Create environment variable file:
```bash
cd ai-quiz-generator/frontend
```

Create `.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Replace `your-backend-url.onrender.com` with your actual Render URL from Step 2.6.

### 3.2 Update API Service (if needed)

The `api.js` already uses `import.meta.env.VITE_API_URL`, so it will automatically use the production URL.

### 3.3 Create vercel.json

Already created! But verify it exists in `ai-quiz-generator/frontend/vercel.json`

### 3.4 Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - Choose **"Continue with GitHub"**
   - Authorize in browser

3. **Deploy**:
   ```bash
   cd ai-quiz-generator/frontend
   vercel
   ```
   
   Answer the prompts:
   ```
   ? Set up and deploy "frontend"? Y
   ? Which scope? Your username
   ? Link to existing project? N
   ? What's your project's name? ai-quiz-generator
   ? In which directory is your code located? ./
   ? Want to override the settings? N
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

5. **Add Environment Variable**:
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter your backend URL: `https://your-backend-url.onrender.com`

6. **Redeploy with environment variable**:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Click **"Sign Up"** or **"Login"**
   - Choose **"Continue with GitHub"**

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Click **"Import"** next to your `ai-quiz-generator` repo
   - If not visible, click **"Adjust GitHub App Permissions"**

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: ai-quiz-generator/frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   - Click **"Environment Variables"**
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.onrender.com
     Environment: Production
     ```

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - You'll get a URL like: `https://ai-quiz-generator.vercel.app`

✅ **Frontend deployed!**

---

## STEP 4: Testing & Verification

### 4.1 Test Backend

1. **Health Check**:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Expected: `{"status":"healthy",...}`

2. **API Documentation**:
   ```
   https://your-backend-url.onrender.com/docs
   ```
   You should see FastAPI Swagger UI

3. **Test History Endpoint**:
   ```
   https://your-backend-url.onrender.com/api/history
   ```
   Expected: `[]` (empty array if no quizzes yet)

### 4.2 Test Frontend

1. **Open your Vercel URL**:
   ```
   https://ai-quiz-generator.vercel.app
   ```

2. **Test Generate Quiz**:
   - Click **"Generate Quiz"** tab
   - Enter: `https://en.wikipedia.org/wiki/Python_(programming_language)`
   - Click **"Generate Quiz with AI"**
   - Wait 30-60 seconds (first request may be slow due to cold start)
   - You should see the quiz!

3. **Test History**:
   - Click **"History"** tab
   - You should see your generated quiz
   - Click **"View"** to see details

### 4.3 Check Browser Console

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for any errors (should be none)
4. Check **Network** tab to see API calls

✅ **Everything working!**

---

## Troubleshooting

### Issue 1: Backend Cold Start (30s delay)

**Problem:** First request takes 30+ seconds
**Cause:** Render free tier spins down after 15 min inactivity
**Solution:** Use UptimeRobot to keep it alive

1. Go to https://uptimerobot.com (free)
2. Sign up
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend-url.onrender.com/health`
   - Interval: 5 minutes
4. This pings your backend every 5 minutes, keeping it awake

### Issue 2: CORS Error

**Problem:** `Access-Control-Allow-Origin` error
**Cause:** Frontend URL not in backend CORS list

**Solution:**
1. Go to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Add new variable:
   ```
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```
5. Update `main.py` CORS to use this variable (I'll create this file)

### Issue 3: Database Connection Error

**Problem:** `Connection refused` or `Authentication failed`
**Cause:** Wrong DATABASE_URL

**Solution:**
1. Go to Neon dashboard
2. Copy connection string again
3. Make sure it includes `?sslmode=require`
4. Update in Render environment variables
5. Redeploy backend

### Issue 4: Gemini API Error

**Problem:** `API key not found` or `Invalid API key`
**Cause:** Wrong or missing GEMINI_API_KEY

**Solution:**
1. Verify your API key at https://makersuite.google.com/app/apikey
2. Update in Render environment variables
3. Make sure there are no extra spaces
4. Redeploy backend

### Issue 5: Build Failed on Render

**Problem:** Build fails with dependency errors
**Cause:** Missing dependencies or Python version mismatch

**Solution:**
1. Check Render logs for specific error
2. Verify `requirements.txt` is complete
3. Add `runtime.txt` with Python version:
   ```
   python-3.12.0
   ```

### Issue 6: Frontend Shows "Failed to fetch"

**Problem:** Frontend can't connect to backend
**Cause:** Wrong API URL or backend is down

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Make sure backend URL is correct (no trailing slash)
3. Test backend health endpoint directly
4. Check browser console for exact error

---

## Optional: Custom Domain

### For Frontend (Vercel):

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **"Add"**
5. Enter your domain (e.g., `quizgen.yourdomain.com`)
6. Follow DNS instructions
7. Wait for DNS propagation (5-30 minutes)

### For Backend (Render):

1. Go to Render dashboard
2. Select your backend service
3. Go to **Settings** → **Custom Domain**
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `api.yourdomain.com`)
6. Add CNAME record to your DNS:
   ```
   CNAME api.yourdomain.com → your-app.onrender.com
   ```

---

## 📊 Deployment Checklist

### Pre-Deployment:
- [ ] Code pushed to GitHub
- [ ] `.env` files not committed (in `.gitignore`)
- [ ] All dependencies in `requirements.txt`
- [ ] Frontend builds locally (`npm run build`)

### Database:
- [ ] Neon account created
- [ ] Database project created
- [ ] Tables created via SQL Editor
- [ ] Connection string saved

### Backend:
- [ ] Render account created
- [ ] Web service created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Health endpoint working

### Frontend:
- [ ] Vercel account created
- [ ] Project imported
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Can access the site

### Testing:
- [ ] Backend health check passes
- [ ] Can generate quiz
- [ ] Can view history
- [ ] Can view quiz details
- [ ] No console errors

---

## 🎉 Success!

Your AI Quiz Generator is now live!

**Your URLs:**
- Frontend: `https://ai-quiz-generator.vercel.app`
- Backend: `https://ai-quiz-generator-backend.onrender.com`
- API Docs: `https://ai-quiz-generator-backend.onrender.com/docs`

**Share your project:**
- Add the URLs to your GitHub README
- Share on LinkedIn/Twitter
- Add to your portfolio

---

## 📝 Maintenance

### Monitoring:
- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Monitor Neon database usage

### Updates:
1. Make changes locally
2. Test locally
3. Commit and push to GitHub
4. Render auto-deploys backend
5. Vercel auto-deploys frontend

### Database Backup:
1. Go to Neon dashboard
2. Click **"Backups"**
3. Download backup if needed

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | Forever | 100GB bandwidth/month |
| Render | Forever | 750 hours/month, cold starts |
| Neon | Forever | 3GB storage, 1 project |
| **Total** | **$0/month** | Sufficient for portfolio projects |

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Check Render/Vercel logs
3. Test each component separately
4. Verify environment variables

---

**Good luck with your deployment! 🚀**
