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

    const aiResponse = await fetch(
      "http://127.0.0.1:8000/api/process-syllabus",
      {
        method: "POST",
        body: pythonFormData,
      }
    )

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "AI processing failed" },
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