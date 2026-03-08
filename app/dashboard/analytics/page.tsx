'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, TrendingUp, Target, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
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
      loadAnalytics(supabase)
    }

    checkAuth()
  }, [router])

  const loadAnalytics = async (supabase: any) => {
    try {
      // Get quiz results
      const { data: quizzes } = await supabase
        .from('quiz_results')
        .select('score, total_questions, completed_at, topics(name)')
        .order('completed_at', { ascending: false })

      // Get study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, focus_score, created_at, topics(name)')

      // Calculate stats
      let totalScore = 0
      let avgScore = 0
      let bestScore = 0
      let quizCount = 0
      const topicScores: { [key: string]: number[] } = {}

      if (quizzes && quizzes.length > 0) {
        quizCount = quizzes.length
        quizzes.forEach((quiz) => {
          const scorePercent = (quiz.score / quiz.total_questions) * 100
          totalScore += scorePercent
          bestScore = Math.max(bestScore, scorePercent)
          
          const topicName = quiz.topics?.name || 'Unknown'
          if (!topicScores[topicName]) topicScores[topicName] = []
          topicScores[topicName].push(scorePercent)
        })
        avgScore = Math.round(totalScore / quizCount)
      }

      let totalStudyMinutes = 0
      let avgFocus = 0
      const studyByTopic: { [key: string]: number } = {}
      
      if (sessions && sessions.length > 0) {
        totalStudyMinutes = sessions.reduce(
          (acc, s) => acc + (s.duration_minutes || 0),
          0
        )
        const totalFocus = sessions.reduce(
          (acc, s) => acc + (s.focus_score || 0),
          0
        )
        avgFocus = Math.round(totalFocus / sessions.length)
        
        sessions.forEach((session) => {
          const topicName = session.topics?.name || 'Unknown'
          studyByTopic[topicName] = (studyByTopic[topicName] || 0) + (session.duration_minutes || 0)
        })
      }

      // Prepare chart data
      const topicChartData = Object.entries(topicScores).map(([name, scores]) => ({
        name,
        score: Math.round(scores.reduce((a, b) => a + b) / scores.length),
      }))

      const studyChartData = Object.entries(studyByTopic).map(([name, minutes]) => ({
        name,
        minutes,
      }))

      setStats({
        quizCount,
        avgScore,
        bestScore,
        totalStudyMinutes,
        avgFocus,
        quizzes: quizzes || [],
        sessions: sessions || [],
        topicChartData,
        studyChartData,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="p-6 text-center">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Learning Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your progress and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.quizCount || 0}
                </p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.avgScore || 0}%
                </p>
              </div>
              <Target className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.bestScore || 0}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {Math.round((stats?.totalStudyMinutes || 0) / 60)}h
                </p>
              </div>
              <Clock className="h-10 w-10 text-amber-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {stats?.topicChartData && stats.topicChartData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Performance by Topic
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topicChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {stats?.studyChartData && stats.studyChartData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Study Time by Topic
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.studyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Recent Quizzes */}
        {stats?.quizzes && stats.quizzes.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Quizzes
            </h2>
            <div className="space-y-3">
              {stats.quizzes.slice(0, 5).map((quiz: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {quiz.topics?.name || 'Quiz'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quiz.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {Math.round((quiz.score / quiz.total_questions) * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
