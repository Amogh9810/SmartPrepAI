'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, BarChart3, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (session) {
        router.push('/dashboard')
      }
      setSession(session)
      setLoading(false)
    }

    checkSession()
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-foreground">SmartPrep AI</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          Your AI-Powered Study Companion
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Upload your syllabus, generate adaptive quizzes, and master any subject with personalized learning paths powered by advanced AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Learning Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Powerful Features for Smarter Learning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-background p-8 rounded-lg border">
              <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                OCR Syllabus Processing
              </h3>
              <p className="text-muted-foreground">
                Upload images or PDFs of your syllabus and let AI extract topics automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background p-8 rounded-lg border">
              <Brain className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Adaptive Quiz Generation
              </h3>
              <p className="text-muted-foreground">
                Get AI-generated quizzes tailored to your learning level and knowledge gaps.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background p-8 rounded-lg border">
              <Zap className="h-12 w-12 text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Smart Scheduling
              </h3>
              <p className="text-muted-foreground">
                Get personalized study schedules optimized for long-term retention.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background p-8 rounded-lg border">
              <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Progress Analytics
              </h3>
              <p className="text-muted-foreground">
                Track your progress with detailed analytics and performance insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Ready to transform your learning?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of students already using SmartPrep AI to ace their exams.
        </p>
        <Link href="/auth/sign-up">
          <Button size="lg" className="text-lg px-8 py-6">
            Create Free Account
          </Button>
        </Link>
      </section>
    </main>
  )
}
