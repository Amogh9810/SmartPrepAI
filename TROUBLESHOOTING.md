# SmartPrep AI - Troubleshooting Guide

## Common Issues & Solutions

### Schedule Generation

#### Issue: "Backend service unavailable" error
**Cause:** FastAPI backend is not running on localhost:8000
**Solution:**
1. Start the backend: `cd backend && python -m uvicorn main:app --reload`
2. Verify it's running at `http://localhost:8000/api/health`
3. Check console logs for startup errors

#### Issue: No topics appear in dropdown
**Cause:** Database has no topics yet
**Solution:**
1. Go to Subjects page
2. Create a subject
3. Upload a syllabus to extract topics
4. Return to Schedule page and try again

#### Issue: "Schedule generated successfully" but no items show up
**Cause:** Possible database insert error
**Solution:**
1. Check browser DevTools Network tab for full API response
2. Check Supabase dashboard - verify schedules table exists
3. Run: `SELECT * FROM schedules LIMIT 10;` in Supabase SQL editor
4. Check for RLS (Row Level Security) policy issues

---

### Quiz Taking

#### Issue: "No questions available for this topic"
**Cause:** Topic has no questions in the database
**Solution:**
1. Go to Subjects page
2. Click on a subject with topics
3. Manually add questions to the topic (or implement admin dashboard)
4. Sample question format:
   ```
   Question: "What is the capital of France?"
   Answer: "Paris"
   Difficulty: "easy"
   ```

#### Issue: Quiz page shows loading forever
**Cause:** Async issue or database query problem
**Solution:**
1. Check browser console for errors
2. Open DevTools Network tab - see if `/api/quiz/generate` is called
3. Check Supabase connection in `lib/supabase/client.ts`
4. Verify questions table exists and has data

#### Issue: Timer not working
**Cause:** Quiz not properly started or JavaScript error
**Solution:**
1. Reload the page
2. Check browser console for errors
3. Verify `useEffect` hooks are running correctly

#### Issue: "Failed to submit quiz" error
**Cause:** API error or database write failure
**Solution:**
1. Check browser DevTools Network tab for `/api/quiz/submit` response
2. Verify quiz_results table exists in Supabase
3. Check RLS policies on quiz_results table
4. Try submitting 1-2 answers and resubmit

#### Issue: Quiz results show 0% even though I answered correctly
**Cause:** Case sensitivity in answer matching or exact text requirements
**Solution:**
1. Remember: answers are case-insensitive but require exact text match
2. No extra spaces or punctuation allowed
3. Example: "Paris" = "paris" = "PARIS" ✓ but "Paris, France" ✗
4. Check the exact answer text in database

---

### Environment Variables

#### Issue: "Cannot find NEXT_PUBLIC_BACKEND_URL"
**Cause:** Environment variable not set (but it's optional)
**Solution:**
1. Optional - will default to `http://localhost:8000`
2. To set it: create `.env.local` file:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
3. For production: set to your deployed backend URL

#### Issue: Backend connection fails in production
**Cause:** Wrong backend URL for production
**Solution:**
1. Set `NEXT_PUBLIC_BACKEND_URL` to production backend
2. Verify CORS is enabled on backend for your domain
3. Check backend is running and accessible from internet

---

### Database Issues

#### Issue: "quiz_results table doesn't exist"
**Cause:** Migration not run or Supabase not connected
**Solution:**
1. Go to Supabase dashboard
2. Create table `quiz_results` with columns:
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - topic_id (uuid, foreign key)
   - score (integer)
   - total_questions (integer)
   - time_spent_seconds (integer)
   - completed_at (timestamp with timezone)

#### Issue: "Row-level security (RLS) violation"
**Cause:** Database policies blocking user access
**Solution:**
1. Go to Supabase RLS policies
2. Enable RLS on tables if not enabled
3. For quizzes, allow users to read/write own records:
   ```sql
   CREATE POLICY "Users can read own quiz results"
   ON quiz_results
   FOR SELECT USING (auth.uid() = user_id);
   ```

---

### Performance Issues

#### Quiz takes long time to load
**Cause:** Too many questions or slow network
**Solution:**
1. Limit questions per quiz (max 50 recommended)
2. Check network speed in DevTools
3. Verify database indexes on topic_id in questions table

#### Schedule generation is slow
**Cause:** Computing SM-2 for many topics
**Solution:**
1. Normal for 50+ topics (spaced repetition generates 5 sessions per topic)
2. For 100 topics = 500 schedule items (may take 2-3 seconds)
3. Consider pagination or background jobs for very large datasets

---

### Backend Issues

#### Issue: FastAPI won't start
**Cause:** Missing dependencies or Python version issue
**Solution:**
```bash
# Install dependencies
pip install -r requirements.txt

# Verify Python version (needs 3.8+)
python --version

# Try running with specific settings
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Issue: OCR model fails to load (easyocr)
**Cause:** First run downloads large model (~100MB)
**Solution:**
1. First run may take 2-5 minutes
2. Model is cached, subsequent runs are instant
3. Verify you have ~500MB free disk space
4. Check internet connection during model download

#### Issue: spaCy model not found
**Cause:** Model not downloaded
**Solution:**
```bash
# Download the model manually
python -m spacy download en_core_web_sm
```

---

### Development vs Production

#### Running locally
```bash
# Terminal 1: Frontend
npm run dev  # Runs on http://localhost:3000

# Terminal 2: Backend
cd backend && python -m uvicorn main:app --reload  # Runs on http://localhost:8000
```

#### Running on Vercel
1. Set environment variables in Vercel dashboard
2. Backend should be deployed separately (Heroku, Railway, AWS, etc.)
3. Set `NEXT_PUBLIC_BACKEND_URL` to production backend

---

## Debug Checklist

Before reporting an issue, verify:

- [ ] Backend is running: `curl http://localhost:8000/api/health`
- [ ] Supabase connection works: Can login and see subjects
- [ ] Database tables exist: Check Supabase dashboard
- [ ] Environment variables are set: `.env.local` file created
- [ ] Network requests show in DevTools Network tab
- [ ] No errors in browser console (F12 → Console tab)
- [ ] No errors in backend terminal
- [ ] Cleared browser cache (Ctrl+Shift+Delete)

---

## Getting Logs

### Frontend Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red) or warnings (yellow)
4. Reproduce the issue to see logs

### Backend Logs
1. Watch terminal where you ran `uvicorn`
2. Look for error stacktraces
3. Errors often show database or validation issues

### Network Logs
1. Open DevTools → Network tab
2. Perform action (generate schedule, submit quiz)
3. Look for requests to `/api/*` endpoints
4. Click on request → Response tab to see error details

---

## Getting Help

1. Check this troubleshooting guide first
2. Search browser console for error messages
3. Check network requests for API errors
4. Review database schema in Supabase
5. Test backend health: `curl http://localhost:8000/api/health`
6. Check IMPLEMENTATION_NOTES.md for feature details
