'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])

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
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      setSubjects(subjectsData || [])
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <div className="flex">
        <aside className="w-64 border-r bg-muted/30 hidden md:block">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              QUICK ACTIONS
            </h3>
            <div className="space-y-2">
              <Link href="/dashboard/syllabus-upload">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Syllabus
                </Button>
              </Link>
              <Link href="/dashboard/quiz">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
              <Link href="/dashboard/schedule">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </Link>
            </div>

            {subjects.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 mt-6">
                  YOUR SUBJECTS
                </h3>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/dashboard/subject/${subject.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                      >
                        {subject.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <DashboardHeader user={user} />
          <div className="p-6 max-w-7xl">
            <QuickStats user={user} />
            <RecentActivity user={user} />
          </div>
        </main>
      </div>
    </div>
  )
}
