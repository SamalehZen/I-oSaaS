import { type NextRequest, NextResponse } from "next/server"
import { generateQuizFromText } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    console.log("Generate quiz API called")
    const body = await request.json()
    const { text, numQuestions = 5 } = body

    if (!text || typeof text !== "string") {
      console.error("Text is required but was not provided")
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log(`Generating quiz from text of length: ${text.length}`)

    try {
      // Use Gemini to generate quiz from text
      const quiz = await generateQuizFromText(text, numQuestions)

      // Validate the quiz structure
      if (!quiz || !quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        console.error("Invalid quiz format returned from AI")
        return NextResponse.json(
          { error: "The AI generated an invalid quiz format. Please try again." },
          { status: 500 },
        )
      }

      // Ensure each question has the correct structure
      for (const question of quiz.questions) {
        if (!question.question || !Array.isArray(question.options) || !question.correctAnswer) {
          console.error("Invalid question format in quiz")
          return NextResponse.json(
            { error: "The AI generated an invalid question format. Please try again." },
            { status: 500 },
          )
        }

        // Ensure the correct answer is one of the options
        if (!question.options.includes(question.correctAnswer)) {
          console.error("Correct answer not found in options")
          question.correctAnswer = question.options[0] // Default to first option if mismatch
        }
      }

      console.log("Quiz generation successful")
      return NextResponse.json(quiz)
    } catch (error) {
      console.error("Error in quiz generation:", error)
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate quiz. Please try again with a different document.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process request"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
