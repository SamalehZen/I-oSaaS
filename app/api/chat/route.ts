import { type NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/gemini"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { messages, withSearch = false } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    // Check if the request wants streaming
    const stream = request.headers.get("accept") === "text/event-stream"

    if (stream) {
      // Set up streaming response
      const encoder = new TextEncoder()
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            await generateChatResponse(messages, withSearch, (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            })
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Error in streaming:", error)
            controller.error(error)
          }
        },
      })

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // Generate response using Gemini (non-streaming)
      const response = await generateChatResponse(messages, withSearch)
      return NextResponse.json({ response })
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate response"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
