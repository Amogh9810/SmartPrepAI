-- SmartPrep AI Database Schema
-- Run this migration to set up all tables for SmartPrep AI

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  learning_style TEXT,
  target_time_hours_per_week INT DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "profiles_select_own" ON public.user_profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_insert_own" ON public.user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_update_own" ON public.user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  syllabus_content TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "subjects_select_own" ON public.subjects 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "subjects_insert_own" ON public.subjects 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "subjects_update_own" ON public.subjects 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "subjects_delete_own" ON public.subjects 
  FOR DELETE USING (auth.uid() = user_id);

-- 3. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subtopics TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_hours FLOAT DEFAULT 10.0,
  importance_score FLOAT DEFAULT 0.5,
  mastery_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "topics_select_own_subjects" ON public.topics 
  FOR SELECT USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE auth.uid() = user_id
    )
  );
CREATE POLICY IF NOT EXISTS "topics_insert_own_subjects" ON public.topics 
  FOR INSERT WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects WHERE auth.uid() = user_id
    )
  );
CREATE POLICY IF NOT EXISTS "topics_update_own_subjects" ON public.topics 
  FOR UPDATE USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE auth.uid() = user_id
    )
  );
CREATE POLICY IF NOT EXISTS "topics_delete_own_subjects" ON public.topics 
  FOR DELETE USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE auth.uid() = user_id
    )
  );

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq', 'short_answer', 'essay', 'fill_blank')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "questions_select_own_topics" ON public.questions 
  FOR SELECT USING (
    topic_id IN (
      SELECT id FROM public.topics 
      WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE auth.uid() = user_id
      )
    )
  );
CREATE POLICY IF NOT EXISTS "questions_insert_own_topics" ON public.questions 
  FOR INSERT WITH CHECK (
    topic_id IN (
      SELECT id FROM public.topics 
      WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE auth.uid() = user_id
      )
    )
  );
CREATE POLICY IF NOT EXISTS "questions_update_own_topics" ON public.questions 
  FOR UPDATE USING (
    topic_id IN (
      SELECT id FROM public.topics 
      WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE auth.uid() = user_id
      )
    )
  );
CREATE POLICY IF NOT EXISTS "questions_delete_own_topics" ON public.questions 
  FOR DELETE USING (
    topic_id IN (
      SELECT id FROM public.topics 
      WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE auth.uid() = user_id
      )
    )
  );

-- 5. QUIZ RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  duration_seconds INT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responses JSONB
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "quiz_results_select_own" ON public.quiz_results 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "quiz_results_insert_own" ON public.quiz_results 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "quiz_results_update_own" ON public.quiz_results 
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  focus_score FLOAT DEFAULT 0.5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "study_sessions_select_own" ON public.study_sessions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "study_sessions_insert_own" ON public.study_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "study_sessions_update_own" ON public.study_sessions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "study_sessions_delete_own" ON public.study_sessions 
  FOR DELETE USING (auth.uid() = user_id);

-- 7. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  schedule_data JSONB NOT NULL,
  readiness_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "schedules_select_own" ON public.schedules 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "schedules_insert_own" ON public.schedules 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "schedules_update_own" ON public.schedules 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "schedules_delete_own" ON public.schedules 
  FOR DELETE USING (auth.uid() = user_id);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS subjects_user_id_idx ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS topics_subject_id_idx ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS questions_topic_id_idx ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS quiz_results_topic_id_idx ON public.quiz_results(topic_id);
CREATE INDEX IF NOT EXISTS quiz_results_attempted_at_idx ON public.quiz_results(attempted_at);
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_start_time_idx ON public.study_sessions(start_time);
CREATE INDEX IF NOT EXISTS schedules_user_id_idx ON public.schedules(user_id);
