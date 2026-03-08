import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { topicId, difficulty = 'medium', numQuestions = 10 } = await request.json()

    if (!topicId) {
      return NextResponse.json(
        { error: 'Missing topicId' },
        { status: 400 }
      )
    }

    // Fetch questions for this topic
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('difficulty', difficulty)
      .limit(numQuestions)

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this topic' },
        { status: 404 }
      )
    }

    // Return questions without answers (for quiz display)
    const quiz = questions.map(({ answer_text, ...q }) => q)

    return NextResponse.json({
      success: true,
      quiz,
      totalQuestions: quiz.length,
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
