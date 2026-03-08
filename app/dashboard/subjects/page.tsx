'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

export default function SubjectsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSubject, setNewSubject] = useState('')

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
      loadSubjects(supabase)
    }

    checkAuth()
  }, [router])

  const loadSubjects = async (supabase: any) => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })

    setSubjects(data || [])
    setLoading(false)
  }

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return

    const supabase = createClient()
    const { data, error } = await supabase.from('subjects').insert({
      name: newSubject,
      user_id: user.id,
    })

    if (!error) {
      setNewSubject('')
      loadSubjects(supabase)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    const supabase = createClient()
    await supabase.from('subjects').delete().eq('id', id)
    loadSubjects(supabase)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Subjects</h1>
          <p className="text-muted-foreground">
            Manage your study subjects and topics
          </p>
        </div>

        {/* Add New Subject */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Add New Subject
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Biology, Mathematics, History"
              className="flex-1 px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <Button onClick={handleAddSubject} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </Card>

        {/* Subjects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No subjects yet. Create one to get started!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/dashboard/subject/${subject.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-muted-foreground mb-4">
                      {subject.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteSubject(subject.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
