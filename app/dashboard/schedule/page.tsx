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
    await supabase
      .from('schedules')
      .update({ completed: true })
      .eq('id', scheduleId)

    loadSchedules(supabase)
  }

  const handleGenerateSchedule = async () => {
    // This would call the Python backend to generate an optimized schedule
    alert('Schedule generation will be implemented with the Python backend')
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
