# SmartPrep AI - Quick Reference Guide

Fast answers for common questions and tasks.

---

## 🚀 Getting Started (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials

# 3. Start frontend
npm run dev

# 4. In another terminal, start backend
cd backend
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -e .
python -m uvicorn main:app --reload
```

Visit: http://localhost:3000

---

## 🔧 Common Commands

### Frontend

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check code quality
npm run format           # Format code with prettier
```

### Backend

```bash
cd backend
python -m venv venv     # Create virtual environment
source venv/bin/activate  # Activate (Mac/Linux)
pip install -e .        # Install dependencies
python -m uvicorn main:app --reload  # Start server
```

---

## 📝 Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_ENV=development
```

**Get Supabase URL & Key:**
1. Go to supabase.com
2. Login/Create account
3. Create project
4. Copy URL and anon key from Settings → API

---

## 🐛 Troubleshooting

### "Cannot find module 'recharts'"
```bash
npm install recharts
```

### "Backend connection refused"
- Check backend is running on port 8000
- Verify NEXT_PUBLIC_BACKEND_URL in .env.local

### "ModuleNotFoundError: easyocr"
```bash
cd backend
pip install easyocr spacy
python -m spacy download en_core_web_sm
```

### "Supabase authentication failed"
- Verify URL doesn't have trailing slash
- Check anon key is correct
- Ensure network connectivity

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### "Port 8000 already in use"
```bash
python -m uvicorn main:app --port 8001
# Then update NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

---

## 📚 Documentation Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| SETUP_INSTRUCTIONS.md | Complete setup guide | 20 min |
| TESTING_GUIDE.md | How to test all features | 30 min |
| BUG_FIXES_REPORT.md | What was fixed | 15 min |
| PROJECT_SUMMARY.md | Project overview | 10 min |
| CHANGES_SUMMARY.md | All changes made | 10 min |

---

## 🎯 Feature Quick Start

### 1. Sign Up
1. Go to http://localhost:3000
2. Click "Get Started"
3. Enter email and password
4. Click "Sign up"

### 2. Create Subject
1. Go to Dashboard → Subjects
2. Enter subject name
3. Click "Add Subject"

### 3. Upload Syllabus (OCR)
1. Go to Dashboard → Upload Syllabus
2. Select subject
3. Upload image/PDF
4. Topics auto-created

### 4. Take Quiz
1. Go to Dashboard → Quiz
2. Select subject and topic
3. Click "Start Quiz"
4. Answer questions
5. Submit to see results

### 5. View Schedule
1. Go to Dashboard → Schedule
2. Click "Generate Schedule"
3. See personalized study plan

### 6. Check Analytics
1. Go to Dashboard → Analytics
2. View charts and metrics
3. See quiz history

---

## 🔐 Security Tips

1. **Never commit .env.local** - Already in .gitignore
2. **Keep keys private** - Don't share Supabase keys
3. **Update BACKEND_URL** - Change for production
4. **Use HTTPS** - In production only
5. **Enable RLS** - Already done, verify in Supabase

---

## 📊 API Endpoints

### Frontend Routes

```
GET  /                        # Home page
GET  /auth/login              # Login page
GET  /auth/signup             # Sign up page
GET  /dashboard               # Dashboard
GET  /dashboard/subjects      # Subjects list
GET  /dashboard/subject/:id   # Subject detail
GET  /dashboard/topic/:id     # Topic detail
GET  /dashboard/quiz          # Quiz selection
GET  /dashboard/quiz/:topicId # Take quiz
GET  /dashboard/schedule      # Study schedule
GET  /dashboard/analytics     # Analytics
GET  /dashboard/settings      # Settings
```

### Backend Endpoints

```
POST /api/process-syllabus         # OCR processing
POST /api/quiz/generate-questions  # Generate questions
POST /api/schedule/generate        # Generate schedule
POST /api/quiz/submit              # Submit quiz
```

---

## 📱 Directory Structure

```
smartprep-ai/
├── app/
│   ├── api/                # API routes
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Dashboard pages
│   └── page.tsx            # Home
├── components/             # React components
├── lib/                    # Utilities
├── backend/                # Python FastAPI
│   ├── main.py            # Main app
│   └── venv/              # Virtual environment
├── public/                 # Static files
└── [Documentation].md      # Guides
```

---

## 💾 Database Tables

| Table | Purpose |
|-------|---------|
| auth.users | User accounts (Supabase) |
| user_profiles | Profile info |
| subjects | Subject courses |
| topics | Topics within subjects |
| questions | Quiz questions |
| quiz_results | Quiz scores |
| study_sessions | Study tracking |

---

## 🎨 UI Framework

**Components:** Shadcn/UI  
**Styling:** Tailwind CSS v4  
**Icons:** Lucide React  
**Charts:** Recharts

---

## 🧪 Testing Checklist

- [ ] Can sign up with new email
- [ ] Can log in with credentials
- [ ] Can create subject
- [ ] Can upload syllabus (OCR)
- [ ] Can add topics
- [ ] Can add questions
- [ ] Can take quiz
- [ ] Can see results
- [ ] Can generate schedule
- [ ] Can view analytics

See TESTING_GUIDE.md for detailed tests.

---

## 🚢 Deployment Quick Steps

### To Vercel (Frontend)

```bash
vercel
# Add environment variables in Vercel dashboard
# Redeploy
```

### To Railway (Backend)

```bash
# Connect GitHub
# Deploy automatically on push
# Add environment variables if needed
```

---

## 🆘 Getting Help

1. **Setup Issues** → SETUP_INSTRUCTIONS.md
2. **Testing Issues** → TESTING_GUIDE.md
3. **Bug Questions** → BUG_FIXES_REPORT.md
4. **Feature Questions** → PROJECT_SUMMARY.md
5. **Technical Details** → CHANGES_SUMMARY.md

---

## ⚡ Performance Tips

- Clear browser cache: Ctrl+Shift+Delete
- Disable extensions: May interfere
- Close unused tabs: Save memory
- Update Node.js: Use latest LTS
- Update Python: Use 3.9+

---

## 📞 Key Contacts

- **Supabase Support:** supabase.com/support
- **Next.js Docs:** nextjs.org
- **FastAPI Docs:** fastapi.tiangolo.com
- **GitHub Issues:** [Your repo]/issues

---

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/learn
- **Supabase:** https://supabase.com/docs
- **FastAPI:** https://fastapi.tiangolo.com
- **Tailwind:** https://tailwindcss.com/docs
- **React:** https://react.dev

---

## ✅ Pre-Production Checklist

- [ ] All environment variables set
- [ ] Backend running without errors
- [ ] Frontend compiles without errors
- [ ] All tests passing
- [ ] No console errors
- [ ] Analytics displaying correctly
- [ ] Schedule generating properly
- [ ] OCR working with images
- [ ] Quiz scoring accurately
- [ ] Database queries optimized

---

## 📈 Next Actions

1. **Complete Setup:** Follow SETUP_INSTRUCTIONS.md
2. **Run Tests:** Use TESTING_GUIDE.md
3. **Review Changes:** Check CHANGES_SUMMARY.md
4. **Deploy:** Follow deployment section
5. **Monitor:** Check logs daily first week

---

## Version & Status

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** March 2026  

---

## Quick Facts

- **Language:** TypeScript + Python
- **Framework:** Next.js + FastAPI
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Hosting:** Vercel + Railway
- **AI:** EasyOCR + spaCy
- **UI:** Shadcn/UI + Tailwind
- **Charts:** Recharts

---

**Start here → SETUP_INSTRUCTIONS.md** 🚀

---

Last Updated: March 2026
