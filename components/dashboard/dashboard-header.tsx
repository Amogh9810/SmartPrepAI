'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Brain } from 'lucide-react'

export function DashboardHeader({ user }: { user: any }) {
  return (
    <div className="border-b bg-background sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Let's continue your learning journey
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Brain className="h-4 w-4" />
          AI Assistant
        </Button>
      </div>
    </div>
  )
}
