"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search"
import { Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hi there! I'm Nexus AI assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to top when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0
    }
  }, [messages])

  // Reset copied code state after 2 seconds
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedCode])

  // Update the handleSubmit function to handle the welcome message properly
  const handleSubmit = async (value: string, withSearch: boolean) => {
    if (!value.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      timestamp: Date.now(),
    }

    // Add user message at the beginning of the array (newest first)
    setMessages((prev) => [userMessage, ...prev])
    setIsLoading(true)

    try {
      // Create a temporary message ID for the assistant's response
      const tempAssistantId = `assistant-${Date.now()}`

      // Add an empty assistant message at the beginning
      setMessages((prev) => [
        {
          id: tempAssistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
        ...prev,
      ])

      // Filter out the welcome message if it's the only message besides the new ones
      const messagesToSend =
        messages.length === 1 && messages[0].id === "welcome-message" ? [] : [...messages].reverse() // Reverse to get chronological order for the API

      // Make the streaming request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          messages: [
            ...messagesToSend.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: "user",
              content: value,
            },
          ],
          withSearch: withSearch,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is null")

      const decoder = new TextDecoder()
      let accumulatedContent = ""

      // Function to read chunks
      async function readStream() {
        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              setIsLoading(false)
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.substring(6)
                if (data === "[DONE]") {
                  setIsLoading(false)
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.chunk) {
                    accumulatedContent += parsed.chunk

                    // Update the assistant message with the accumulated content
                    setMessages((prev) =>
                      prev.map((msg) => (msg.id === tempAssistantId ? { ...msg, content: accumulatedContent } : msg)),
                    )
                  }
                } catch (e) {
                  console.error("Error parsing chunk:", e)
                }
              }
            }
          }
        } catch (error) {
          console.error("Error reading stream:", error)
          setIsLoading(false)
          throw error
        }
      }

      // Start reading the stream
      readStream().catch((error) => {
        console.error("Stream reading failed:", error)

        // Update the empty message with an error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId
              ? { ...msg, content: "I'm sorry, I encountered an error. Please try again later." }
              : msg,
          ),
        )
      })
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [errorMessage, ...prev])
      setIsLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    // In a real implementation, you would handle file uploads here
    console.log("File selected:", file.name)

    // Add a message to acknowledge the file upload
    const fileMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `I've received your file: ${file.name}. What would you like to know about it?`,
      timestamp: Date.now(),
    }

    setMessages((prev) => [fileMessage, ...prev])
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
  }

  // Custom renderer for code blocks
  const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    return (
      <div className="relative group my-4">
        <div className="absolute top-0 right-0 flex items-center px-2 py-1 bg-gray-800 rounded-bl-md rounded-tr-md">
          <span className="text-xs text-gray-400 mr-2">{language || "code"}</span>
          <button
            onClick={() => copyToClipboard(value)}
            className="p-1 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            aria-label="Copy code"
          >
            {copiedCode === value ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <pre className="bg-gray-800 rounded-md p-4 pt-8 overflow-x-auto text-sm text-gray-200 font-mono">
          <code>{value}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-[#111111] flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#0CF2A0]/20 flex items-center justify-center mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-[#0CF2A0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white">Nexus AI Assistant</h3>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto max-h-[350px] min-h-[350px] bg-[#1a1a1a]/60 flex flex-col-reverse"
      >
        <AnimatePresence initial={false}>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 max-w-[85%] p-3 rounded-lg bg-[#2a2a2a] text-gray-200 border border-gray-700/30 mr-auto"
            >
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-[#0CF2A0] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#0CF2A0] animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-[#0CF2A0] animate-pulse delay-300" />
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "mb-4 max-w-[85%] p-3 rounded-lg",
                message.role === "user"
                  ? "ml-auto bg-[#0CF2A0]/10 text-white border border-[#0CF2A0]/20"
                  : "mr-auto bg-[#2a2a2a] text-gray-200 border border-gray-700/30",
              )}
            >
              {message.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      return !inline ? (
                        <CodeBlock language={match ? match[1] : ""} value={String(children).replace(/\n$/, "")} />
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      )
                    },
                    ul({ node, ...props }) {
                      return <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
                    },
                    ol({ node, ...props }) {
                      return <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
                    },
                    li({ node, ...props }) {
                      return <li className="my-1" {...props} />
                    },
                    p({ node, ...props }) {
                      return <p className="my-2" {...props} />
                    },
                    h1({ node, ...props }) {
                      return <h1 className="text-xl font-bold my-3" {...props} />
                    },
                    h2({ node, ...props }) {
                      return <h2 className="text-lg font-bold my-2" {...props} />
                    },
                    h3({ node, ...props }) {
                      return <h3 className="text-md font-bold my-2" {...props} />
                    },
                  }}
                  className="text-sm prose prose-invert max-w-none"
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <div className="text-xs text-gray-500 mt-2 text-right">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-gray-800 bg-[#111111]">
        <AIInputWithSearch onSubmit={handleSubmit} onFileSelect={handleFileSelect} className="py-2" />
      </div>
    </div>
  )
}
