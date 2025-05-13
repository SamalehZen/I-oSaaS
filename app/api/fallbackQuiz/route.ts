import { type NextRequest, NextResponse } from "next/server"
import { createFallbackQuiz } from "@/lib/utils/quiz-helpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { numQuestions = 5 } = body

    // Create a fallback quiz with the requested number of questions
    const fallbackQuiz = createFallbackQuiz(
      Math.min(Math.max(1, numQuestions), 20), // Ensure between 1-20 questions
    )

    return NextResponse.json(fallbackQuiz)
  } catch (error) {
    console.error("Error in fallback quiz API:", error)
    return NextResponse.json({ error: "Failed to generate fallback quiz" }, { status: 500 })
  }
}
