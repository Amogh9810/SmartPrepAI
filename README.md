# SmartPrep AI - Intelligent Study Companion

An AI-powered study platform that helps students master subjects through adaptive quiz generation, intelligent syllabus processing, and personalized learning paths.

## 🚀 Features

- **OCR Syllabus Processing**: Upload images or PDFs of your syllabus and let AI automatically extract topics
- **Adaptive Quiz Generation**: Get AI-generated quizzes tailored to your learning level and knowledge gaps
- **Smart Scheduling**: Personalized study schedules optimized using spaced repetition algorithms
- **Progress Analytics**: Track your learning journey with detailed performance analytics
- **Focus Analysis**: AI-powered insights into your study patterns and optimization recommendations
- **Mastery Evaluation**: Real-time assessment of your understanding level with personalized recommendations

## 📋 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **Shadcn/UI** - High-quality component library
- **Supabase** - PostgreSQL database and authentication

### Backend
- **FastAPI** - High-performance Python web framework
- **EasyOCR** - Optical character recognition
- **spaCy** - Natural language processing
- **scikit-learn** - Machine learning models
- **Uvicorn** - ASGI server

### Database & Auth
- **Supabase PostgreSQL** - Relational database with RLS
- **Supabase Auth** - Secure authentication system

## 📦 Project Structure

```
smartprep-ai/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── quiz/               # Quiz endpoints
│   │   ├── subjects/           # Subject management
│   │   ├── topics/             # Topic management
│   │   ├── study-sessions/     # Study tracking
│   │   └── syllabus/           # Syllabus upload
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # Dashboard pages
│   │   ├── subject/            # Subject details
│   │   ├── topic/              # Topic details
│   │   ├── quiz/               # Quiz interface
│   │   ├── schedule/           # Study schedule
│   │   ├── analytics/          # Performance analytics
│   │   └── settings/           # User settings
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── ui/                      # Shadcn UI components
│   └── dashboard/               # Dashboard components
├── lib/                         # Utilities
│   └── supabase/               # Supabase client setup
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # API endpoints
│   └── pyproject.toml          # Python dependencies
├── scripts/                     # Database setup scripts
├── SUPABASE_SETUP.md           # Database schema setup guide
└── package.json                # Node.js dependencies
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account (free at supabase.com)

### Frontend Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Set up environment variables**
Create a `.env.local` file in the root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Database Setup**
Follow the SQL commands in `SUPABASE_SETUP.md` to create tables and RLS policies in Supabase.

4. **Run the development server**
```bash
pnpm dev
```
Visit http://localhost:3000

### Backend Setup

1. **Install Python dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
```

2. **Set up environment variables**
Create a `.env` file in the backend directory:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_api_key
```

3. **Run the backend server**
```bash
cd backend
python -m uvicorn main:app --reload
```
Visit http://localhost:8000 (API docs at http://localhost:8000/docs)

## 🗄️ Database Schema

The application uses 7 core tables with Row Level Security:

- **user_profiles** - User account information
- **subjects** - Study subjects created by users
- **topics** - Topics within each subject
- **questions** - Quiz questions for each topic
- **quiz_results** - User's quiz performance history
- **study_sessions** - Study session tracking
- **schedules** - Personalized study schedules

All tables have RLS policies to ensure data isolation between users.

## 🔑 Key Endpoints

### Frontend API Routes (Next.js)
- `POST /api/subjects` - Create/list subjects
- `POST /api/topics` - Create/list topics
- `POST /api/quiz/generate` - Generate quiz for a topic
- `POST /api/quiz/submit` - Submit quiz answers
- `POST /api/study-sessions` - Create study session
- `POST /api/schedule/generate` - Generate study schedule
- `POST /api/syllabus/upload` - Upload and process syllabus

### Backend API Endpoints (FastAPI)
- `GET /api/health` - Health check
- `POST /api/ocr/process` - OCR image processing
- `POST /api/nlp/extract-topics` - Extract topics from text
- `POST /api/quiz/generate-questions` - AI quiz generation
- `POST /api/mastery/evaluate` - Evaluate mastery level
- `POST /api/schedule/generate` - Generate optimized schedule
- `GET /api/analytics/readiness` - Exam readiness prediction
- `GET /api/analytics/focus-analysis` - Focus pattern analysis

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Secure Authentication** - Supabase Auth with email verification
- **Password Hashing** - Industry-standard bcrypt
- **HTTP-only Cookies** - Secure session management
- **Input Validation** - Pydantic models for API validation
- **CORS Protection** - Controlled cross-origin requests

## 📈 ML/AI Features

### Planned Implementations

1. **OCR (Optical Character Recognition)**
   - Technology: EasyOCR
   - Extract text from syllabus images/PDFs

2. **NLP (Natural Language Processing)**
   - Technology: spaCy
   - Automatic topic extraction and categorization

3. **Quiz Generation**
   - Technology: GPT or fine-tuned LLM
   - Context-aware question creation

4. **Mastery Evaluation**
   - Technology: Bayesian inference
   - Real-time competency assessment

5. **Spaced Repetition**
   - Technology: SM-2 algorithm
   - Optimal review scheduling

6. **Readiness Prediction**
   - Technology: Gradient boosting (XGBoost)
   - Exam preparation assessment

7. **Focus Analysis**
   - Technology: Time series analysis
   - Study pattern optimization

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Backend (Python)
Deploy on:
- Vercel Functions (Python support)
- Railway
- Render
- DigitalOcean
- AWS Elastic Beanstalk

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Shadcn UI Components](https://ui.shadcn.com)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the team.

---

**Happy Learning! 🎓**

SmartPrep AI - Making education smarter, one quiz at a time.
