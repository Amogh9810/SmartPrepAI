import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {

  try {

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { topicIds, startDate, duration } = await request.json()

    if (!topicIds || topicIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing topicIds' },
        { status: 400 }
      )
    }

    // Call Python FastAPI backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    let response
    try {
      response = await fetch(`${backendUrl}/api/schedule/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic_ids: topicIds,
          start_date: startDate || new Date().toISOString().split('T')[0],
          duration: duration || 60
        }),
      })
    } catch (error) {
      console.error('Backend connection error:', error)
      return NextResponse.json(
        { error: 'Backend service unavailable', details: `Could not connect to ${backendUrl}` },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Schedule generation failed', details: errorData.detail || 'Backend error' },
        { status: response.status }
      )
    }

    const aiData = await response.json()

    const schedules = aiData.schedules || []

    if (schedules.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No schedules generated"
      })
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert(
        schedules.map((item: any) => ({
          topic_id: item.topic_id,
          study_date: item.study_date,
          duration_minutes: item.duration_minutes,
          priority: item.priority,
          user_id: user.id
        }))
      )
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      schedules: data,
      message: "Schedule generated successfully"
    })

  } catch (error) {

    console.error("Schedule generation error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
