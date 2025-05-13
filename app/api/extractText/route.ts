import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPDF } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    console.log("Extract text API called")
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`Processing PDF: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`)

    // Accept files that end with .pdf regardless of MIME type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      console.error(`Invalid file type: ${file.type}`)
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Use Gemini to extract text from PDF
    const text = await extractTextFromPDF(arrayBuffer)

    console.log("Text extraction successful")
    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to extract text from PDF"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
