import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const subjectId = formData.get("subject_id") as string

    if (!file || !subjectId) {
      return NextResponse.json(
        { error: "Missing file or subject_id" },
        { status: 400 }
      )
    }

    // Send file to FastAPI backend
    const pythonFormData = new FormData()
    pythonFormData.append("file", file)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    
    let aiResponse;
    try {
      aiResponse = await fetch(
        `${backendUrl}/api/process-syllabus`,
        {
          method: "POST",
          body: pythonFormData,
        }
      )
    } catch (error) {
      console.error("Backend connection error:", error)
      return NextResponse.json(
        { 
          error: "Backend service unavailable. Make sure the FastAPI backend is running.",
          details: `Tried to connect to ${backendUrl}`
        },
        { status: 503 }
      )
    }

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: "AI processing failed",
          details: errorData.detail || "Unknown error from backend"
        },
        { status: 500 }
      )
    }

    const aiData = await aiResponse.json()

    const topics = aiData.topics || []

    // Insert extracted topics into Supabase
    for (const topic of topics) {
      await supabase.from("topics").insert({
        subject_id: subjectId,
        name: topic,
      })
    }

    return NextResponse.json({
      success: true,
      topics_created: topics.length,
      message: "Syllabus processed and topics generated successfully",
    })

  } catch (error) {

    console.error("Upload error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
