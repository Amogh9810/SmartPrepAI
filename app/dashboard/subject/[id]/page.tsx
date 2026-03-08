'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, ArrowLeft, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function SubjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [subject, setSubject] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')

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
      loadData(supabase, subjectId)
    }

    checkAuth()
  }, [subjectId, router])

  const loadData = async (supabase: any, id: string) => {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()

    if (subjectData) {
      setSubject(subjectData)
    }

    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', id)
      .order('created_at', { ascending: false })

    setTopics(topicsData || [])
    setLoading(false)
  }

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return

    const supabase = createClient()
    const { error } = await supabase.from('topics').insert({
      subject_id: subjectId,
      name: newTopicName,
    })

    if (!error) {
      setNewTopicName('')
      setShowAddTopic(false)
      loadData(supabase, subjectId)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    const supabase = createClient()
    await supabase.from('topics').delete().eq('id', topicId)
    loadData(supabase, subjectId)
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
          <Link href="/dashboard/subjects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              {subject?.name || 'Subject'}
            </h1>
            {subject?.description && (
              <p className="text-muted-foreground mt-1">{subject.description}</p>
            )}
          </div>
        </div>

        {/* Topics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Topics</h2>
            <Button
              onClick={() => setShowAddTopic(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Topic
            </Button>
          </div>

          {/* Add Topic Form */}
          {showAddTopic && (
            <Card className="p-6 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Topic name"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                  className="flex-1 px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
                <Button onClick={handleAddTopic}>Add</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddTopic(false)
                    setNewTopicName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Topics Grid */}
          {topics.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No topics yet. Add one to get started!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/dashboard/topic/${topic.id}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-blue-600 cursor-pointer">
                      {topic.name}
                    </h3>
                  </Link>
                  {topic.description && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/topic/${topic.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTopic(topic.id)}
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
