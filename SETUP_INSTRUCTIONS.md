# SmartPrep AI - Complete Setup Guide

This document provides step-by-step instructions to set up and run SmartPrep AI locally.

## Prerequisites

- Node.js 18+ 
- Python 3.9+
- Supabase account (free at supabase.com)
- Git

## Frontend Setup (Next.js)

### 1. Install Dependencies

```bash
cd /path/to/smartprep-ai
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Environment
NEXT_PUBLIC_ENV=development
```

**To find your Supabase credentials:**
1. Go to https://supabase.com
2. Sign in or create an account
3. Create a new project
4. Copy the project URL and anon key from Settings → API

### 3. Set Up Database Schema

1. Go to Supabase SQL Editor
2. Copy all SQL commands from `SUPABASE_SETUP.md`
3. Run each SQL command in order to create tables and RLS policies

### 4. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

---

## Backend Setup (FastAPI)

### 1. Set Up Python Environment

```bash
cd backend
python -m venv venv
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -e .
```

This will install all dependencies listed in `backend/pyproject.toml`:
- FastAPI
- Uvicorn
- EasyOCR
- spaCy
- Pydantic
- python-dotenv

### 3. Download Required AI Models

When you first run the backend, it will automatically download:
- **EasyOCR**: English language model (~140 MB)
- **spaCy**: en_core_web_sm model (~40 MB)

These are cached locally and downloaded only once.

### 4. Configure Environment Variables (Optional)

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

Note: The backend doesn't strictly require these for basic functionality, but you may need them for future AI features.

### 5. Run the Backend Server

```bash
cd backend
python -m uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Full Application Flow

### 1. **Create a User Account**
- Visit http://localhost:3000
- Click "Get Started" or "Sign up"
- Create an account with email and password

### 2. **Create a Subject**
- Go to Dashboard → Subjects
- Click "Add Subject"
- Enter a subject name (e.g., "Biology")

### 3. **Upload Syllabus (OCR)**
- Go to Dashboard → Upload Syllabus
- Select the subject
- Upload an image or PDF with course content
- The backend will extract topics using OCR and NLP

### 4. **View Topics**
- Go to Dashboard → Subjects → [Your Subject]
- See automatically extracted topics
- Or manually add topics

### 5. **Add Questions**
- Click on a topic
- Click "Add Question"
- Enter question and answer
- Questions can be manually added or auto-generated

### 6. **Take a Quiz**
- Go to Dashboard → Quiz
- Select a subject and topic
- Click "Start Quiz"
- Answer questions and submit
- View your score and feedback

### 7. **View Schedule**
- Go to Dashboard → Schedule
- Click "Generate Schedule"
- Review your personalized study schedule

### 8. **Check Analytics**
- Go to Dashboard → Analytics
- View charts showing:
  - Performance by topic
  - Study time trends
  - Quiz history
  - Mastery scores

---

## Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**Missing environment variables:**
- Verify `.env.local` exists and has all required variables
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

**Supabase connection error:**
- Verify URL doesn't have trailing slash
- Check network connectivity
- Ensure RLS policies are set up correctly

### Backend Issues

**Backend won't start:**
```bash
# Make sure you're in the backend directory
cd backend

# Ensure Python 3.9+ is installed
python --version

# Reinstall dependencies
pip install -e .
```

**OCR not working:**
- First run downloads the EasyOCR model (~140 MB)
- This only happens once
- Ensure you have stable internet during first run

**Port 8000 already in use:**
```bash
python -m uvicorn main:app --reload --port 8001
# Then update NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

**ModuleNotFoundError for easyocr, spacy, etc:**
```bash
pip install easyocr spacy pydantic fastapi uvicorn python-dotenv
python -m spacy download en_core_web_sm
```

### Database Issues

**"relation does not exist" error:**
- RLS policies not created yet
- Run all SQL commands from SUPABASE_SETUP.md in order

**Can't sign up:**
- Check that user_profiles table trigger is created
- Verify auth.users table exists in Supabase

**Quiz questions not showing:**
- Ensure questions table is created
- Verify RLS policies allow reading questions

---

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | FastAPI backend URL |
| `NEXT_PUBLIC_ENV` | No | Environment (development/production) |

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | No | Supabase URL for future auth |
| `SUPABASE_KEY` | No | Supabase key for future features |

---

## Development Tips

### Working on Frontend

1. The frontend uses Next.js App Router with TypeScript
2. Components are in `/components`
3. API routes are in `/app/api`
4. Dashboard pages are in `/app/dashboard`
5. Styling uses Tailwind CSS v4 + Shadcn/UI

### Working on Backend

1. Main endpoints are in `/backend/main.py`
2. Add new endpoints as `@app.post()` or `@app.get()` decorators
3. Use Pydantic models for request/response validation
4. Test endpoints at `http://localhost:8000/docs`

### Database Queries

Example Supabase query from frontend:

```typescript
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .eq('subject_id', subjectId)
  .order('created_at', { ascending: false })
```

---

## Performance Tips

1. **OCR Processing**: First run downloads models (~200 MB total)
2. **Database**: Ensure indexes on frequently queried columns
3. **Frontend**: Use client components for interactivity, server components for data fetching
4. **Quiz Loading**: Pre-load questions when topic is selected

---

## Next Steps

After setup, you can:

1. **Customize OCR**: Modify language settings in `backend/main.py`
2. **Add AI Features**: Integrate GPT API for auto-generating questions
3. **Improve Scheduling**: Implement SM-2 spaced repetition algorithm
4. **Add Push Notifications**: Integrate for study reminders
5. **Deploy**: Use Vercel for frontend, Railway/Render for backend

---

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review error messages in console
3. Check Supabase logs
4. Check backend server logs
5. Open an issue on GitHub

Good luck with SmartPrep AI! 🎓
