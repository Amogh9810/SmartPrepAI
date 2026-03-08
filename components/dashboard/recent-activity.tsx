'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function RecentActivity({ user }: { user: any }) {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const loadActivities = async () => {
      const supabase = createClient()

      // Get recent quiz results
      const { data: recentQuizzes } = await supabase
        .from('quiz_results')
        .select('*, topics(name, subjects(name))')
        .order('completed_at', { ascending: false })
        .limit(5)

      // Get recent study sessions
      const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select('*, topics(name, subjects(name))')
        .order('created_at', { ascending: false })
        .limit(5)

      // Combine and sort activities
      const combined = [
        ...(recentQuizzes || []).map((quiz) => ({
          type: 'quiz',
          title: `Quiz on ${quiz.topics?.name || 'Topic'}`,
          description: `Score: ${Math.round((quiz.score / quiz.total_questions) * 100)}%`,
          date: quiz.completed_at,
          id: quiz.id,
        })),
        ...(recentSessions || []).map((session) => ({
          type: 'study',
          title: `Study session on ${session.topics?.name || 'Topic'}`,
          description: `${session.duration_minutes || 0} minutes`,
          date: session.created_at,
          id: session.id,
        })),
      ].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 8)

      setActivities(combined)
    }

    loadActivities()
  }, [])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
        <Link href="/dashboard/analytics">
          <Button variant="ghost" className="gap-2">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No activity yet. Start by uploading a syllabus or taking a quiz!
          </p>
          <Link href="/dashboard/syllabus-upload">
            <Button>Upload Your First Syllabus</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(activity.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
