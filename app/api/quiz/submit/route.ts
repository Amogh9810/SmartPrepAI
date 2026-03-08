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

    const {
      topicId,
      answers,
      timeSpentSeconds,
    } = await request.json()

    if (!topicId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch questions for scoring
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id, answer_text')
      .eq('topic_id', topicId)

    if (fetchError) {
      console.error('Database error fetching questions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this topic' },
        { status: 404 }
      )
    }

    // Score the quiz
    let correctAnswers = 0
    const answersMap = new Map(answers.map((a: any) => [a.questionId, a.userAnswer]))

    questions.forEach((q: any) => {
      const userAnswer = answersMap.get(q.id)
      if (userAnswer?.toLowerCase() === q.answer_text?.toLowerCase()) {
        correctAnswers++
      }
    })

    // Store quiz result
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: user.id,
        topic_id: topicId,
        score: correctAnswers,
        total_questions: questions.length,
        time_spent_seconds: timeSpentSeconds,
      })
      .select()

    if (error) {
      console.error('Error inserting quiz result:', error)
      return NextResponse.json(
        { error: 'Failed to save quiz result', details: error.message },
        { status: 500 }
      )
    }

    const percentage = Math.round((correctAnswers / questions.length) * 100)

    return NextResponse.json({
      success: true,
      score: correctAnswers,
      total: questions.length,
      percentage,
      feedback: getFeedback(percentage),
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getFeedback(percentage: number): string {
  if (percentage >= 90) {
    return 'Excellent work! You have mastered this topic!'
  } else if (percentage >= 80) {
    return 'Great job! You have a strong understanding of this topic.'
  } else if (percentage >= 70) {
    return 'Good effort! Review the material and try again.'
  } else if (percentage >= 60) {
    return 'You understand the basics. Focus on weak areas.'
  } else {
    return 'Keep studying! Review the material and practice more.'
  }
}
