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
    const response = await fetch("http://127.0.0.1:8000/api/schedule/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic_ids: topicIds,
        start_date: startDate,
        duration: duration || 60
      }),
    })

    if (!response.ok) {
      throw new Error("Python backend schedule generation failed")
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