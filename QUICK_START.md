# SmartPrep AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- Python 3.8+ installed
- Supabase project created
- Git cloned and dependencies installed

### Step 1: Start the Backend (2 min)
```bash
# Terminal 1
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

You should see:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start the Frontend (1 min)
```bash
# Terminal 2
npm install  # if not already done
npm run dev
```

Visit: `http://localhost:3000`

### Step 3: Create Test Data (2 min)

#### Create Subject
1. Go to Dashboard → Subjects
2. Click "Add Subject"
3. Enter name: "Physics"
4. Click Save

#### Create Topics
1. Click on "Physics" subject
2. Click "Add Topic"
3. Add topics:
   - "Mechanics"
   - "Thermodynamics"
4. Click Save

#### Add Questions (Important!)
Manually add questions to topics for quiz to work:

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Open `questions` table
3. Click "Insert" and add:
```
topic_id: [mechanics_topic_id]
question_text: "What is Newton's first law of motion?"
answer_text: "Objects in motion stay in motion unless acted upon by a force"
difficulty: "medium"
```

Add 5-10 questions to make testing worthwhile.

---

## 📅 Test Schedule Generation

1. Go to **Dashboard → Schedule**
2. Click **"Generate Schedule"** button
3. Verify:
   - ✅ Schedule items appear
   - ✅ Dates follow pattern: 1, 3, 7, 14, 30 days apart
   - ✅ Priorities: high (first 2), medium (next 2), low (last)

**Example Output:**
```
Mechanics - 2024-03-11 - High priority - 60 min
Mechanics - 2024-03-13 - High priority - 60 min
Mechanics - 2024-03-19 - Medium priority - 60 min
Mechanics - 2024-03-31 - Medium priority - 60 min
Mechanics - 2024-04-10 - Low priority - 60 min
...
```

---

## 🧪 Test Quiz Feature

1. Go to **Dashboard → Quiz**
2. Select subject: **"Physics"**
3. Select topic: **"Mechanics"**
4. Click **"Start Quiz"**

### On Quiz Page
- ✅ See all questions displayed
- ✅ Timer counts up
- ✅ Answer questions in textarea
- ✅ Navigate using Previous/Next buttons
- ✅ Use question grid for quick jump
- ✅ Click "Submit Quiz" on last question

### After Submit
- ✅ See score (e.g., "7 out of 10")
- ✅ See percentage (70%)
- ✅ See feedback based on score
- ✅ Can click "Retake Quiz" to try again

---

## 🔧 Common Issues

### "Backend service unavailable" error
```bash
# Verify backend is running
curl http://localhost:8000/api/health

# Should return:
# {"status":"healthy","service":"SmartPrep AI Backend"}
```

### "No questions available for this topic"
**Solution:** Add questions to the topic via Supabase:
1. Open Supabase Dashboard
2. Go to `questions` table
3. Add at least 5 questions with correct topic_id

### Quiz page shows loading forever
1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify database connection in Supabase

---

## 📊 Verify Features Work

### Quiz Feature Checklist
- [ ] Can select subject
- [ ] Can select topic from subject
- [ ] Start quiz button navigates (not alert)
- [ ] Quiz page loads with questions
- [ ] Timer works (counts seconds)
- [ ] Can type answers in textarea
- [ ] Previous/Next buttons navigate
- [ ] Question grid shows answered/current status
- [ ] Submit button shows on last question
- [ ] Results page shows score and feedback
- [ ] Can retake quiz

### Schedule Feature Checklist
- [ ] Can click "Generate Schedule"
- [ ] Loading shows briefly
- [ ] Schedule items appear
- [ ] Dates are realistic (future dates)
- [ ] Priorities assigned correctly
- [ ] Can mark items complete
- [ ] Can click "Mark Complete" button
- [ ] Completed items show checkmark

---

## 📝 Environment Setup (Optional)

If backend is on different URL:

1. Create `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000
```

2. Restart frontend: `npm run dev`

---

## 🎯 Next Steps

1. **Test both features** following guides above
2. **Add more questions** to make testing realistic
3. **Check database** in Supabase to verify data is saved
4. **Review code** in:
   - `/app/dashboard/quiz/[topicId]/page.tsx` (quiz interface)
   - `/backend/main.py` (SM-2 algorithm)
   - `/app/api/schedule/generate/route.ts` (schedule generation)

5. **Read full docs:**
   - `IMPLEMENTATION_NOTES.md` - Technical details
   - `FEATURE_IMPLEMENTATION_SUMMARY.md` - Complete overview
   - `TROUBLESHOOTING.md` - Issues and solutions

---

## 💡 Tips

- Use **multiple topics** to see SM-2 spacing with offsets
- Add **10+ questions** per topic for realistic quiz
- Try **different difficulties** (easy, medium, hard)
- Check **database tables** in Supabase to verify data
- **Retake quizzes** to test multiple attempts
- **Mark complete** on schedules to test workflow

---

## 🐛 Debug Mode

To see detailed logs:

### Frontend Console
```javascript
// In browser console (F12)
localStorage.debug = '*';
location.reload();
```

### Backend Logs
Watch the terminal where backend is running - errors appear in real-time

### Network Inspector
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (quiz submit, schedule generate)
4. Click request to see full response

---

## ✅ Success Indicators

You'll know it's working when:

**Quiz Feature:**
- ✅ Quiz page loads with questions
- ✅ Timer counts up correctly
- ✅ Can answer and navigate
- ✅ Results show correct score
- ✅ Feedback matches percentage

**Schedule Feature:**
- ✅ Schedule items appear after generation
- ✅ Dates follow 1, 3, 7, 14, 30 day pattern
- ✅ Priorities assigned correctly
- ✅ Can mark items complete

---

## 🆘 Need Help?

1. Check `TROUBLESHOOTING.md` for common issues
2. Read `IMPLEMENTATION_NOTES.md` for technical details
3. Verify backend is running: `curl http://localhost:8000/api/health`
4. Check browser console for JavaScript errors (F12)
5. Check Supabase dashboard for data issues

---

**Ready to test?** Follow the steps above and enjoy! 🎉
