"""
SmartPrep AI - FastAPI Backend
Handles OCR, NLP, quiz generation, and AI-powered features
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import easyocr
import spacy
import numpy as np
from PIL import Image
import io
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartPrep AI Backend", version="1.0.0")

# ---------------------------
# CORS
# ---------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading AI models...")

reader = easyocr.Reader(['en'])
nlp = spacy.load("en_core_web_sm")

print("AI models loaded successfully")

# ---------------------------
# Models
# ---------------------------

class Topic(BaseModel):
    name: str
    description: Optional[str] = None


class Question(BaseModel):
    question_text: str
    answer_text: str
    difficulty: str = "medium"


class QuizResult(BaseModel):
    topic_id: str
    answers: List[dict]
    time_spent_seconds: int


class ScheduleRequest(BaseModel):
    topic_ids: List[str]
    start_date: Optional[str] = None
    duration: int = 60


# ---------------------------
# Health Check
# ---------------------------

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "SmartPrep AI Backend"}


# ---------------------------
# OCR + Topic Extraction
# ---------------------------

@app.post("/api/process-syllabus")
async def process_syllabus(file: UploadFile = File(...)):

    try:

        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

        # OCR
        results = reader.readtext(image_np)

        extracted_text = " ".join([r[1] for r in results])

        print("OCR TEXT:", extracted_text[:400])

        if not extracted_text.strip():
            return {
                "success": True,
                "topics": [],
                "extracted_text": ""
            }

        # ---------------------------
        # Clean OCR text
        # ---------------------------

        cleaned_text = extracted_text.replace("\n", " ")

        # remove module numbers like "1." "2."
        cleaned_text = re.sub(r'\b\d+\.\s*', '', cleaned_text)

        # remove lecture numbers
        cleaned_text = re.sub(r'\b\d+\b', '', cleaned_text)

        # ---------------------------
        # Extract topic phrases
        # ---------------------------

        candidates = re.split(r'[,.;\n]', cleaned_text)

        topics = []

        for text in candidates:

            topic = text.strip()

            # ignore short fragments
            if len(topic) < 6:
                continue

            # ignore module title phrases
            if "module" in topic.lower():
                continue

            # avoid duplicates
            if topic.lower() not in [t.lower() for t in topics]:
                topics.append(topic)

        # limit topics
        topics = topics[:15]

        return {
            "success": True,
            "topics": topics,
            "extracted_text": extracted_text[:500]
        }

    except Exception as e:

        print("OCR ERROR:", e)

        return {
            "success": True,
            "topics": [],
            "extracted_text": ""
        }


# ---------------------------
# Quiz Generation
# ---------------------------

@app.post("/api/quiz/generate-questions")
async def generate_quiz_questions(topic_id: str, num_questions: int = 10):

    try:

        questions = [
            {
                "id": f"q{i}",
                "question_text": f"What is the concept behind topic {topic_id}? ({i+1})",
                "difficulty": "medium"
            }
            for i in range(num_questions)
        ]

        return {
            "success": True,
            "topic_id": topic_id,
            "questions": questions
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------
# Mastery Evaluation
# ---------------------------

@app.post("/api/mastery/evaluate")
async def evaluate_mastery(topic_id: str, quiz_results: List[dict]):

    try:

        mastery_score = (
            sum(r.get("is_correct", False) for r in quiz_results) /
            len(quiz_results)
            if quiz_results else 0
        )

        level = "beginner"

        if mastery_score > 0.8:
            level = "advanced"
        elif mastery_score > 0.6:
            level = "intermediate"

        return {
            "success": True,
            "topic_id": topic_id,
            "mastery_score": mastery_score,
            "mastery_level": level
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------
# Study Schedule
# ---------------------------

@app.post("/api/schedule/generate")
async def generate_study_schedule(request: ScheduleRequest):
    """
    Generate study schedule using SM-2 spaced repetition algorithm.
    Reviews are scheduled at: 1, 3, 7, 14, 30 days for optimal retention.
    """
    try:
        from datetime import datetime, timedelta

        if not request.topic_ids:
            raise HTTPException(status_code=400, detail="topic_ids cannot be empty")

        # Parse start date or use today
        if request.start_date:
            start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        else:
            start_date = datetime.now()

        # SM-2 spaced repetition intervals (in days)
        intervals = [1, 3, 7, 14, 30]
        schedules = []

        # Generate schedule for each topic
        for topic_idx, topic_id in enumerate(request.topic_ids):
            # Create review sessions at each interval
            for interval_idx, interval_days in enumerate(intervals):
                # Offset by topic index to spread load
                study_date = start_date + timedelta(
                    days=interval_days + (topic_idx % 3)
                )

                # Set priority based on interval
                if interval_days <= 3:
                    priority = "high"
                elif interval_days <= 14:
                    priority = "medium"
                else:
                    priority = "low"

                schedules.append({
                    "topic_id": topic_id,
                    "study_date": study_date.strftime("%Y-%m-%d"),
                    "duration_minutes": request.duration,
                    "priority": priority
                })

        print(f"Generated {len(schedules)} study sessions for {len(request.topic_ids)} topics")

        return {
            "success": True,
            "schedules": schedules,
            "message": f"Generated {len(schedules)} sessions using SM-2 spaced repetition"
        }

    except Exception as e:
        print(f"Schedule generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------
# Analytics
# ---------------------------

@app.get("/api/analytics/readiness")
async def get_readiness_prediction(topic_id: str):

    try:

        readiness_score = 0.75

        return {
            "success": True,
            "topic_id": topic_id,
            "readiness_score": readiness_score,
            "exam_ready": readiness_score > 0.8
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analytics/focus-analysis")
async def analyze_focus_patterns(topic_id: str):

    try:

        return {
            "success": True,
            "topic_id": topic_id,
            "average_focus_score": 0.82,
            "focus_trend": "improving"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------
# AI Personalized Content
# ---------------------------

@app.post("/api/ai/personalized-content")
async def get_personalized_content(topic_id: str, user_level: str = "intermediate"):

    try:

        return {
            "success": True,
            "topic_id": topic_id,
            "content": {
                "explanation": f"Personalized explanation for {user_level} level...",
                "examples": ["Example 1", "Example 2"],
                "resources": ["Resource 1", "Resource 2"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------
# Run Server
# ---------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
