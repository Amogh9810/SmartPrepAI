'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  question_text: string
  answer_text: string
  difficulty: string
}

interface Answer {
  questionId: string
  userAnswer: string
}

export default function QuizInterfacePage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.topicId as string

  const [user, setUser] = useState<any>(null)
  const [topic, setTopic] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

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
      loadQuizData(supabase, topicId)
    }

    checkAuth()
  }, [topicId, router])

  const loadQuizData = async (supabase: any, id: string) => {
    try {
      // Load topic
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single()

      setTopic(topicData)

      // Load questions
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading questions:', error)
        return
      }

      if (!questionsData || questionsData.length === 0) {
        setLoading(false)
        return
      }

      setQuestions(questionsData)
      setAnswers(questionsData.map((q) => ({ questionId: q.id, userAnswer: '' })))
      setLoading(false)
    } catch (error) {
      console.error('Error loading quiz data:', error)
      setLoading(false)
    }
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Save current answer
      const updatedAnswers = [...answers]
      updatedAnswers[currentQuestionIndex].userAnswer = currentAnswer
      setAnswers(updatedAnswers)

      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer(answers[currentQuestionIndex + 1]?.userAnswer || '')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer
      const updatedAnswers = [...answers]
      updatedAnswers[currentQuestionIndex].userAnswer = currentAnswer
      setAnswers(updatedAnswers)

      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer(answers[currentQuestionIndex - 1]?.userAnswer || '')
    }
  }

  const handleSubmitQuiz = async () => {
    // Save current answer before submitting
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestionIndex].userAnswer = currentAnswer
    setAnswers(updatedAnswers)

    setSubmitting(true)

    try {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000)

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          answers: updatedAnswers,
          timeSpentSeconds: timeSpent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Topic not found</p>
          <Link href="/dashboard/quiz">
            <Button>Back to Quiz Selection</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No questions available for this topic
          </p>
          <Link href="/dashboard/quiz">
            <Button>Back to Quiz Selection</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 max-w-2xl mx-auto">
          <Link href="/dashboard/quiz">
            <Button variant="outline" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Quiz
            </Button>
          </Link>

          <Card className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>

            <div className="bg-muted/50 rounded-lg p-6 my-6">
              <p className="text-5xl font-bold text-foreground mb-2">
                {results.percentage}%
              </p>
              <p className="text-muted-foreground">
                {results.score} out of {results.total} correct
              </p>
            </div>

            <p className="text-lg text-foreground mb-4">{results.feedback}</p>

            <div className="space-y-3">
              <Link href="/dashboard/quiz" className="block">
                <Button className="w-full">Take Another Quiz</Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/quiz">
            <Button variant="outline" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Exit Quiz
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {topic.name}
          </h1>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {currentQuestion.question_text}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {currentQuestion.difficulty}
              </span>
            </div>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Your Answer
            </label>
            <textarea
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={handleAnswerChange}
              className="w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Your answer will be compared to the correct answer
            </p>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex-1"
          >
            Next
          </Button>

          {currentQuestionIndex === questions.length - 1 && (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
