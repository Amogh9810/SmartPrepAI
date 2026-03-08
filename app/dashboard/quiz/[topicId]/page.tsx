'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.topicId as string

  const [user, setUser] = useState<any>(null)
  const [topic, setTopic] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted) return

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime!) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [quizStarted, quizCompleted, startTime])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      loadQuizData(supabase)
    }

    checkAuth()
  }, [router, topicId])

  const loadQuizData = async (supabase: any) => {
    try {
      // Fetch topic info
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single()

      if (topicData) {
        setTopic(topicData)
      }

      // Fetch questions for this topic
      const { data: questionsData } = await supabase
        .from('questions')
        .select('id, question_text, answer_text, difficulty')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData)
        // Initialize answers array
        setAnswers(questionsData.map((q) => ({ questionId: q.id, userAnswer: '' })))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading quiz:', error)
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setStartTime(Date.now())
  }

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex].userAnswer = answer
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          answers,
          timeSpentSeconds: timeElapsed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error submitting quiz: ${data.error}`)
        setSubmitting(false)
        return
      }

      setResults(data)
      setQuizCompleted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto">
          <Link href="/dashboard/quiz">
            <Button variant="outline" size="icon" className="mb-6">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No questions available for this topic yet. Please add questions first.
            </p>
            <Link href="/dashboard/subjects">
              <Button>Go to Subjects</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto">
          <Link href="/dashboard/quiz">
            <Button variant="outline" size="icon" className="mb-6">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <Card className="p-12 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {topic?.name || 'Quiz'}
            </h1>
            <div className="space-y-4 mb-8">
              <p className="text-lg text-muted-foreground">
                Get ready to test your knowledge!
              </p>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">{questions.length}</p>
                  <p>Questions</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">~{questions.length * 1.5}</p>
                  <p>Minutes</p>
                </div>
              </div>
            </div>
            <Button onClick={handleStartQuiz} size="lg">
              Start Quiz
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (quizCompleted && results) {
    const percentage = results.percentage
    const isPass = percentage >= 60

    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <div className="mb-8">
              {isPass ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quiz Complete!
            </h1>

            <div className="space-y-6 my-8">
              <div>
                <p className="text-5xl font-bold text-foreground">
                  {percentage}%
                </p>
                <p className="text-muted-foreground mt-2">
                  {results.score} out of {results.total} correct
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-lg font-semibold text-foreground mb-2">
                  Feedback
                </p>
                <p className="text-muted-foreground">{results.feedback}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Time spent: {Math.floor(timeElapsed / 60)} min {timeElapsed % 60} sec</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setQuizStarted(false)
                  setQuizCompleted(false)
                  setCurrentQuestionIndex(0)
                  setTimeElapsed(0)
                  setAnswers(
                    questions.map((q) => ({ questionId: q.id, userAnswer: '' }))
                  )
                }}
              >
                Retake Quiz
              </Button>
              <Button onClick={() => router.push('/dashboard/quiz')}>
                Back to Quiz Selection
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]?.userAnswer || ''
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/quiz">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}</span>
            </div>
          </div>

          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3">
            {/* Text input for answer */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Your Answer
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Difficulty: <span className="capitalize">{currentQuestion.difficulty}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Preview */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm font-medium text-foreground mb-4">Quick Navigation</p>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[index]?.userAnswer
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <span className="inline-block w-3 h-3 bg-green-600 rounded mr-2"></span>
            Answered
            <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-2 ml-4"></span>
            Current
            <span className="inline-block w-3 h-3 bg-muted rounded mr-2 ml-4"></span>
            Not answered
          </p>
        </div>
      </div>
    </div>
  )
}
