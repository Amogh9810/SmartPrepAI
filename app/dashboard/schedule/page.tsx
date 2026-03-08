'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

export default function SchedulePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
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
      loadSchedules(supabase)
    }

    checkAuth()
  }, [router])

  const loadSchedules = async (supabase: any) => {
    const { data } = await supabase
      .from('schedules')
      .select('*, topics(name, subjects(name))')
      .order('study_date', { ascending: true })

    setSchedules(data || [])
    setLoading(false)
  }

  const handleMarkComplete = async (scheduleId: string) => {
    const supabase = createClient()
    
    // Find the schedule to get its details
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (!schedule) return

    // Mark schedule as completed
    await supabase
      .from('schedules')
      .update({ completed: true })
      .eq('id', scheduleId)

    // Create a study session record to track the study hours
    if (user) {
      await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          topic_id: schedule.topic_id,
          duration_minutes: schedule.duration_minutes || 60,
        })
    }

    loadSchedules(supabase)
  }

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get all topics
      const { data: topics } = await supabase
        .from('topics')
        .select('id')

      if (!topics || topics.length === 0) {
        alert('No topics found. Please add topics first.')
        setLoading(false)
        return
      }

      // Call schedule generation API
      const response = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicIds: topics.map((t) => t.id),
          startDate: new Date().toISOString().split('T')[0],
          duration: 60,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error}. ${data.details || ''}`)
        setLoading(false)
        return
      }

      // Reload schedules
      await loadSchedules(supabase)
      alert('Schedule generated successfully!')
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Failed to generate schedule. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Study Schedule
            </h1>
            <p className="text-muted-foreground">
              Your personalized study schedule optimized for long-term retention
            </p>
          </div>
          <Button onClick={handleGenerateSchedule} className="gap-2">
            <Calendar className="h-4 w-4" />
            Generate Schedule
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        ) : schedules.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No scheduled sessions yet. Generate a schedule to get started!
            </p>
            <Button onClick={handleGenerateSchedule}>
              Create Your First Schedule
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card
                key={schedule.id}
                className={`p-6 ${
                  schedule.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {schedule.topics?.name || 'Topic'}
                      </h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {schedule.priority || 'medium'} priority
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {schedule.topics?.subjects?.name || 'Subject'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(schedule.study_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {schedule.duration_minutes || 30} min
                      </span>
                    </div>

                    {schedule.completed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkComplete(schedule.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
