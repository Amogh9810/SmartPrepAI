# SmartPrep AI - Testing & Feature Verification Guide

This guide helps you systematically test all features of SmartPrep AI to ensure everything works correctly.

## Pre-Testing Checklist

Before testing, ensure:

```bash
# Terminal 1: Backend Running
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python -m uvicorn main:app --reload
# Expected: "Uvicorn running on http://127.0.0.1:8000"

# Terminal 2: Frontend Running
cd /path/to/smartprep-ai
npm run dev
# Expected: "> Ready in 2.1s"
```

Visit:
- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs

---

## Test Suite 1: Authentication

### Test 1.1: User Sign-Up
**Steps:**
1. Go to http://localhost:3000
2. Click "Get Started" → "Sign up"
3. Enter email: `test@example.com`
4. Enter password: `Test123!@#`
5. Confirm password: `Test123!@#`
6. Click "Sign up"

**Expected:**
- ✓ Should redirect to "Sign-up success" page
- ✓ User profile created in Supabase
- ✓ Confirmation email sent (check Supabase auth settings)

---

### Test 1.2: User Login
**Steps:**
1. Visit http://localhost:3000
2. Click "Login"
3. Enter email: `test@example.com`
4. Enter password: `Test123!@#`
5. Click "Login"

**Expected:**
- ✓ Should redirect to dashboard
- ✓ User profile loads correctly
- ✓ Session persists on page refresh

---

### Test 1.3: Route Protection
**Steps:**
1. Open incognito/private window
2. Try to access http://localhost:3000/dashboard directly

**Expected:**
- ✓ Should redirect to login page
- ✓ Unauthenticated users cannot access protected routes

---

## Test Suite 2: Subject Management

### Test 2.1: Create Subject
**Steps:**
1. Log in to dashboard
2. Go to "Subjects" page
3. Enter "Biology" in the "Add New Subject" field
4. Click "Add Subject"

**Expected:**
- ✓ Subject appears in the grid
- ✓ Subject saved to database
- ✓ Can create multiple subjects

---

### Test 2.2: View Subject Details
**Steps:**
1. Click on "Biology" subject card

**Expected:**
- ✓ Navigates to subject detail page
- ✓ Shows subject name
- ✓ Shows empty topics list (if new subject)

---

### Test 2.3: Delete Subject
**Steps:**
1. From subjects list, click trash icon on a subject

**Expected:**
- ✓ Subject and all related data deleted
- ✓ Subject removed from grid
- ✓ No error messages

---

## Test Suite 3: Topic Management

### Test 3.1: Add Topic Manually
**Steps:**
1. Go to subject detail page
2. Click "Add Topic" button
3. Enter "Cell Biology"
4. Click "Add"

**Expected:**
- ✓ Topic appears in the grid
- ✓ Topic linked to subject
- ✓ Mastery score shows 0% (new topic)

---

### Test 3.2: View Topic Details
**Steps:**
1. Click on "Cell Biology" topic

**Expected:**
- ✓ Shows topic name and subject
- ✓ Shows questions count
- ✓ Shows "Start Quiz" button
- ✓ Has "Add Question" button

---

### Test 3.3: Delete Topic
**Steps:**
1. From topic detail page, click "..." menu
2. Select "Delete Topic"

**Expected:**
- ✓ Topic deleted from database
- ✓ Associated questions deleted
- ✓ Redirects back to subject page

---

## Test Suite 4: Syllabus Upload (OCR)

### Test 4.1: Upload Image File
**Steps:**
1. Go to Dashboard → Upload Syllabus
2. Select a subject
3. Upload an image containing text (screenshot of syllabus, textbook page, etc.)
4. Click "Upload & Process"

**Expected:**
- ✓ Shows "Uploading..." status
- ✓ OCR processes the image
- ✓ Topics extracted and displayed
- ✓ Redirects to dashboard after success
- ✓ New topics visible in subject

**Debugging if it fails:**
```bash
# Check backend logs
# Should see: "Processing image: filename.jpg"
# Should see: "Extracted X topics"

# Check browser console for errors
# Should show 200 response from /api/syllabus/upload
```

---

### Test 4.2: Upload PDF
**Steps:**
1. Same as above, but upload a PDF file

**Expected:**
- ✓ PDF converted to image
- ✓ Text extracted via OCR
- ✓ Topics created

---

### Test 4.3: Invalid File
**Steps:**
1. Try to upload a non-image file (e.g., .txt file)

**Expected:**
- ✓ Shows error message
- ✓ Graceful error handling
- ✓ Allows retry

---

## Test Suite 5: Questions & Quiz

### Test 5.1: Add Question Manually
**Steps:**
1. Go to topic detail page
2. Click "Add Question"
3. Enter:
   - Question: "What is photosynthesis?"
   - Answer: "Process of converting light energy into chemical energy"
4. Click "Add Question"

**Expected:**
- ✓ Question appears in list
- ✓ Question saved to database
- ✓ Can add multiple questions

---

### Test 5.2: View Questions
**Steps:**
1. In topic detail, scroll to questions section

**Expected:**
- ✓ All questions listed
- ✓ Shows question and answer
- ✓ Shows question count

---

### Test 5.3: Take Quiz
**Steps:**
1. Go to "Quiz" page
2. Select subject and topic
3. Click "Start Quiz"

**Expected:**
- ✓ Navigates to quiz interface
- ✓ Shows current question
- ✓ Shows progress bar
- ✓ Can answer questions

---

### Test 5.4: Answer Questions
**Steps:**
1. While taking quiz, type an answer in the text area
2. Click "Next" to go to next question
3. Click "Previous" to review previous answers
4. On last question, click "Submit Quiz"

**Expected:**
- ✓ Answers are saved
- ✓ Navigation works both ways
- ✓ Quiz submits successfully
- ✓ Shows results page with score and percentage

**Result Page Should Show:**
- ✓ Score: X out of Y
- ✓ Percentage: X%
- ✓ Feedback message (Excellent, Good, etc.)
- ✓ Quiz result saved to database

---

### Test 5.5: Quiz Scoring
**Steps:**
1. Take quiz with known answers
2. Check results

**Expected:**
- ✓ Correct answers counted correctly
- ✓ Case-insensitive matching works
- ✓ Score calculated as: (correct / total) * 100
- ✓ Result saved to quiz_results table

---

## Test Suite 6: Schedule Generation

### Test 6.1: Generate Schedule
**Steps:**
1. Go to Dashboard → Schedule
2. Click "Generate Schedule"

**Expected:**
- ✓ Shows loading state
- ✓ Backend calls spaced repetition algorithm
- ✓ Schedule created with multiple sessions
- ✓ Sessions spread over 30 days
- ✓ Different priorities assigned

---

### Test 6.2: View Schedule
**Steps:**
1. Schedule page shows all sessions
2. Each session shows:
   - Topic name
   - Subject name
   - Study date
   - Duration
   - Priority badge

**Expected:**
- ✓ All sessions visible
- ✓ Sorted by date
- ✓ Proper date formatting

---

### Test 6.3: Mark Schedule Complete
**Steps:**
1. Click "Mark Complete" on a schedule item

**Expected:**
- ✓ Item marked with checkmark
- ✓ Item appears faded/disabled
- ✓ Status saved to database

---

## Test Suite 7: Analytics

### Test 7.1: View Analytics Dashboard
**Steps:**
1. Go to Dashboard → Analytics
2. Scroll through page

**Expected:**
- ✓ Shows 4 metric cards:
  - Total Quizzes
  - Average Score
  - Topics Completed
  - Study Time (hours)
- ✓ All values calculated correctly
- ✓ No errors in console

---

### Test 7.2: Performance Charts
**Steps:**
1. After taking multiple quizzes, check analytics
2. Look for bar charts

**Expected:**
- ✓ "Performance by Topic" chart shows scores
- ✓ "Study Time by Topic" chart shows time spent
- ✓ Charts render without errors

---

### Test 7.3: Recent Quiz History
**Steps:**
1. Scroll down to "Recent Quiz Results"

**Expected:**
- ✓ Shows list of recent quizzes
- ✓ Shows topic name
- ✓ Shows date taken
- ✓ Shows score percentage
- ✓ Most recent first

---

## Test Suite 8: Settings

### Test 8.1: View Profile
**Steps:**
1. Go to Dashboard → Settings

**Expected:**
- ✓ Shows email (disabled)
- ✓ Shows first name field (editable)
- ✓ Shows last name field (editable)

---

### Test 8.2: Update Profile
**Steps:**
1. Edit first name and last name
2. Click "Save Changes"

**Expected:**
- ✓ Shows "Saving..." state
- ✓ Changes saved to database
- ✓ Success confirmation

---

### Test 8.3: Logout
**Steps:**
1. Click "Logout" button

**Expected:**
- ✓ Session cleared
- ✓ Redirects to home page
- ✓ Cannot access dashboard without re-login

---

## Test Suite 9: Error Handling

### Test 9.1: Network Error During Quiz Submit
**Steps:**
1. Start a quiz
2. While answering, disconnect internet
3. Try to submit

**Expected:**
- ✓ Shows error message
- ✓ Allows retry
- ✓ No data corruption

---

### Test 9.2: Missing Backend
**Steps:**
1. Stop backend server
2. Try to upload syllabus

**Expected:**
- ✓ Shows error: "Backend service unavailable"
- ✓ Helpful error message
- ✓ User knows to restart backend

---

### Test 9.3: Database Errors
**Steps:**
1. Try to create subject with empty name

**Expected:**
- ✓ Shows validation error
- ✓ Prevents submission
- ✓ User gets helpful feedback

---

## Test Suite 10: Performance

### Test 10.1: Page Load Speed
**Steps:**
1. Open DevTools → Network tab
2. Go to dashboard
3. Check load time

**Expected:**
- ✓ Dashboard loads in < 2 seconds
- ✓ No console errors
- ✓ All assets cached properly

---

### Test 10.2: Large Dataset
**Steps:**
1. Create 10+ subjects
2. Add 50+ topics
3. Add 100+ questions
4. Navigate between pages

**Expected:**
- ✓ UI remains responsive
- ✓ No significant slowdowns
- ✓ Pagination works if needed

---

## Bug Report Template

If you find a bug, document it:

```
**Title:** Brief description
**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots/Video:**
Attach if helpful

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Backend: Running/Not Running

**Console Errors:**
Paste any errors from browser console
```

---

## Continuous Integration Checklist

After making changes, verify:

- [ ] All tests pass
- [ ] No console errors in frontend
- [ ] Backend logs show no errors
- [ ] Database integrity maintained
- [ ] Authentication works
- [ ] Protected routes enforced
- [ ] Error messages are helpful
- [ ] No broken links
- [ ] Responsive on mobile

---

## Feature Completion Status

### Phase 1: Core Features
- [x] User Authentication (Sign-up, Login)
- [x] Subject Management (CRUD)
- [x] Topic Management (CRUD)
- [x] Question Management (CRUD)
- [x] Quiz Taking Interface
- [x] Quiz Scoring
- [x] Results Display

### Phase 2: Advanced Features
- [x] OCR Syllabus Upload
- [x] Topic Extraction (NLP)
- [x] Schedule Generation
- [x] Progress Tracking
- [x] Analytics Dashboard
- [x] Mastery Scoring

### Phase 3: Future Features
- [ ] AI Question Generation (GPT integration)
- [ ] Improved NLP (spaCy)
- [ ] Smart Recommendations
- [ ] Mobile App
- [ ] Push Notifications
- [ ] Study Groups

---

## Support & Debugging

For issues:

1. **Check browser console:** F12 → Console tab
2. **Check backend logs:** Terminal where uvicorn is running
3. **Check database:** Supabase dashboard
4. **Clear cache:** Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
5. **Restart services:** Stop and restart frontend/backend

Good luck with testing! 🚀
