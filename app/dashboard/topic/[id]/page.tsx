'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, ArrowLeft, Trash2, BookOpen, Play } from 'lucide-react'
import Link from 'next/link'

export default function TopicDetailPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [topic, setTopic] = useState<any>(null)
  const [subject, setSubject] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ text: '', answer: '' })

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
      loadData(supabase, topicId)
    }

    checkAuth()
  }, [topicId, router])

  const loadData = async (supabase: any, id: string) => {
    const { data: topicData } = await supabase
      .from('topics')
      .select('*, subjects(*)')
      .eq('id', id)
      .single()

    if (topicData) {
      setTopic(topicData)
      setSubject(topicData.subjects)
    }

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', id)
      .order('created_at', { ascending: false })

    setQuestions(questionsData || [])
    setLoading(false)
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim() || !newQuestion.answer.trim()) return

    const supabase = createClient()
    const { error } = await supabase.from('questions').insert({
      topic_id: topicId,
      question_text: newQuestion.text,
      answer_text: newQuestion.answer,
      difficulty: 'medium',
    })

    if (!error) {
      setNewQuestion({ text: '', answer: '' })
      setShowAddQuestion(false)
      loadData(supabase, topicId)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    const supabase = createClient()
    await supabase.from('questions').delete().eq('id', questionId)
    loadData(supabase, topicId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/subject/${subject?.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              {topic?.name || 'Topic'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {subject?.name || 'Subject'}
            </p>
          </div>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Start Quiz
          </Button>
        </div>

        {/* Questions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              Questions ({questions.length})
            </h2>
            <Button
              onClick={() => setShowAddQuestion(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* Add Question Form */}
          {showAddQuestion && (
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question
                  </label>
                  <textarea
                    placeholder="Enter the question"
                    value={newQuestion.text}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, text: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Answer
                  </label>
                  <textarea
                    placeholder="Enter the answer"
                    value={newQuestion.answer}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, answer: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddQuestion} className="flex-1">
                    Add Question
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddQuestion(false)
                      setNewQuestion({ text: '', answer: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No questions yet. Add one to create a quiz!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="p-6">
                  <div className="mb-4">
                    <p className="font-semibold text-foreground mb-2">
                      {question.question_text}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      <strong>Answer:</strong> {question.answer_text}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
