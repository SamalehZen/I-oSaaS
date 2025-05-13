"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedChatInput } from "@/components/ui/enhanced-chat-input"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  withSearch?: boolean
  imageUrl?: string
}

export const EnhancedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm Nexus AI. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedResponse])

  const handleSendMessage = async (message: string, files?: File[], withSearch?: boolean) => {
    if (!message.trim() && (!files || files.length === 0)) return

    // Cancel any ongoing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    let imageUrl: string | undefined = undefined

    // Process image if provided
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      const imageFile = files[0]
      const reader = new FileReader()

      imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.readAsDataURL(imageFile)
      })
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
      withSearch,
      imageUrl,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)
    setStreamedResponse("")

    // Prepare messages for API
    const apiMessages = messages
      .filter((msg) => msg.id !== "welcome" || messages.length <= 1)
      .concat(userMessage)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.imageUrl ? { imageUrl: msg.imageUrl } : {}),
      }))

    try {
      abortControllerRef.current = new AbortController()

      // Call the API with streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          messages: apiMessages,
          withSearch: withSearch || false,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is null")

      const decoder = new TextDecoder()
      let done = false
      let fullResponse = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                setIsStreaming(false)
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.chunk) {
                  fullResponse += parsed.chunk
                  setStreamedResponse(fullResponse)
                }
              } catch (e) {
                console.error("Error parsing chunk:", e)
              }
            }
          }
        }
      }

      // Add assistant message once streaming is complete
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamedResponse("")
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error in chat:", error)

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-[#111111] rounded-xl overflow-hidden border border-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-input-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex flex-col max-w-[85%] rounded-lg p-3",
                message.role === "user" ? "ml-auto bg-[#0CF2A0]/10 text-white" : "mr-auto bg-[#1F2023] text-gray-200",
              )}
            >
              {message.imageUrl && (
                <div className="mb-2 rounded-md overflow-hidden">
                  <img
                    src={message.imageUrl || "/placeholder.svg"}
                    alt="Uploaded image"
                    className="max-w-full max-h-[200px] object-contain"
                  />
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{message.withSearch && "🔍 Web search"}</span>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && streamedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mr-auto bg-[#1F2023] text-gray-200 flex flex-col max-w-[85%] rounded-lg p-3"
          >
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{streamedResponse}</ReactMarkdown>
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500 flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Typing...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#111111] border-t border-gray-800">
        <EnhancedChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask Nexus AI anything..."
          className="bg-[#1F2023] border-gray-700"
        />
      </div>
    </div>
  )
}
