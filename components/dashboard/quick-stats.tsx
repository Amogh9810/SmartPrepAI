'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { BookOpen, Brain, TrendingUp, Zap } from 'lucide-react'

export function QuickStats({ user }: { user: any }) {
  const [stats, setStats] = useState({
    subjects: 0,
    quizzes: 0,
    avgScore: 0,
    studyHours: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient()

      // Get subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })

      // Get quiz results count and average score
      const { data: quizzes } = await supabase
        .from('quiz_results')
        .select('score, total_questions')

      let avgScore = 0
      if (quizzes && quizzes.length > 0) {
        const totalScore = quizzes.reduce(
          (acc, quiz) => acc + (quiz.score / quiz.total_questions) * 100,
          0
        )
        avgScore = Math.round(totalScore / quizzes.length)
      }

      // Get study sessions for total hours
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')

      let studyHours = 0
      if (sessions) {
        studyHours = Math.round(
          sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60
        )
      }

      setStats({
        subjects: subjectsCount || 0,
        quizzes: quizzes?.length || 0,
        avgScore,
        studyHours,
      })
    }

    loadStats()
  }, [])

  const statsItems = [
    {
      label: 'Subjects',
      value: stats.subjects,
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      label: 'Quizzes Completed',
      value: stats.quizzes,
      icon: Brain,
      color: 'text-purple-600',
    },
    {
      label: 'Average Score',
      value: `${stats.avgScore}%`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Study Hours',
      value: stats.studyHours,
      icon: Zap,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsItems.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            </div>
            <Icon className={`h-10 w-10 ${color} opacity-20`} />
          </div>
        </Card>
      ))}
    </div>
  )
}
