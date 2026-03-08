'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default function QuizPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      // Load subjects
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      setSubjects(data || [])
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubject(subjectId)

    if (!subjectId) {
      setTopics([])
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })

    setTopics(data || [])
  }

  const handleStartQuiz = async (topicId: string) => {
    try {
      // Get available questions for this topic
      const supabase = createClient()
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .limit(10)

      if (error) {
        alert('Error loading questions: ' + error.message)
        return
      }

      if (!questions || questions.length === 0) {
        alert('No questions available for this topic yet. Please add questions first.')
        return
      }

      // Navigate to quiz interface with topic info
      router.push(`/dashboard/quiz/${topicId}`)
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to start quiz')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Take a Quiz
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-generated adaptive quizzes
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {/* Subject Selection */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Select a Subject
              </h2>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </Card>

            {/* Topics List */}
            {selectedSubject && topics.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Topics
                </h2>
                {topics.map((topic) => (
                  <Card key={topic.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p className="text-muted-foreground mt-1">
                            {topic.description}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleStartQuiz(topic.id)}
                        className="gap-2"
                      >
                        Start Quiz <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedSubject && topics.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No topics found for this subject. Upload a syllabus to create
                  topics!
                </p>
                <Button onClick={() => router.push('/dashboard/syllabus-upload')}>
                  Upload Syllabus
                </Button>
              </Card>
            )}

            {!selectedSubject && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Select a subject to view its topics and start a quiz
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
