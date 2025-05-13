"use client"

import { useEffect, useRef, useCallback, useTransition } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  ImageIcon,
  Figma,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  Copy,
  Check,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import ReactMarkdown from "react-markdown"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

interface CommandSuggestion {
  icon: React.ReactNode
  label: string
  description: string
  prefix: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string
  showRing?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className,
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: "none",
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"

export function AnimatedAIChat() {
  const [value, setValue] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [recentCommand, setRecentCommand] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  })
  const [inputFocused, setInputFocused] = useState(false)
  const commandPaletteRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: number }>
  >([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hi there! I'm Nexus AI assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ])

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <ImageIcon className="w-4 h-4" />,
      label: "Clone UI",
      description: "Generate a UI from a screenshot",
      prefix: "/clone",
    },
    {
      icon: <Figma className="w-4 h-4" />,
      label: "Import Figma",
      description: "Import a design from Figma",
      prefix: "/figma",
    },
    {
      icon: <MonitorIcon className="w-4 h-4" />,
      label: "Create Page",
      description: "Generate a new web page",
      prefix: "/page",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Improve",
      description: "Improve existing UI design",
      prefix: "/improve",
    },
  ]

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

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true)

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) => cmd.prefix.startsWith(value))

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex)
      } else {
        setActiveSuggestion(-1)
      }
    } else {
      setShowCommandPalette(false)
    }
  }, [value])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const commandButton = document.querySelector("[data-command-button]")

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestion((prev) => (prev < commandSuggestions.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : commandSuggestions.length - 1))
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault()
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion]
          setValue(selectedCommand.prefix + " ")
          setShowCommandPalette(false)

          setRecentCommand(selectedCommand.label)
          setTimeout(() => setRecentCommand(null), 3500)
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        setShowCommandPalette(false)
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        handleSendMessage()
      }
    }
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

  // Update the handleSendMessage function to use streaming
  const handleSendMessage = () => {
    if (value.trim()) {
      // Add user message to chat
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: value,
        timestamp: Date.now(),
      }

      // Add user message at the beginning (newest first)
      setMessages((prev) => [userMessage, ...prev])

      // Clear input
      setValue("")
      adjustHeight(true)

      startTransition(() => {
        setIsTyping(true)

        // Create a temporary message ID for the assistant's response
        const tempAssistantId = `assistant-${Date.now()}`

        // Add an empty assistant message that will be updated with streamed content
        setMessages((prev) => [
          {
            id: tempAssistantId,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
          },
          ...prev,
        ])

        // Filter out the welcome message if it's the first message
        const messagesToSend =
          messages.length === 1 && messages[0].id === "welcome-message" ? [] : [...messages].reverse() // Reverse to get chronological order for the API

        // Create the request body
        const requestBody = {
          messages: [
            ...messagesToSend.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: "user",
              content: userMessage.content,
            },
          ],
          withSearch: showSearch,
        }

        // Make the streaming request
        fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(requestBody),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to get response")

            const reader = response.body?.getReader()
            if (!reader) throw new Error("Response body is null")

            const decoder = new TextDecoder()
            let accumulatedContent = ""

            // Function to read chunks
            function readChunk() {
              reader
                .read()
                .then(({ done, value }) => {
                  if (done) {
                    setIsTyping(false)
                    return
                  }

                  const chunk = decoder.decode(value, { stream: true })
                  const lines = chunk.split("\n\n")

                  lines.forEach((line) => {
                    if (line.startsWith("data: ")) {
                      const data = line.substring(6)
                      if (data === "[DONE]") {
                        setIsTyping(false)
                        return
                      }

                      try {
                        const parsed = JSON.parse(data)
                        if (parsed.chunk) {
                          accumulatedContent += parsed.chunk

                          // Update the assistant message with the accumulated content
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === tempAssistantId ? { ...msg, content: accumulatedContent } : msg,
                            ),
                          )
                        }
                      } catch (e) {
                        console.error("Error parsing chunk:", e)
                      }
                    }
                  })

                  // Continue reading
                  readChunk()
                })
                .catch((error) => {
                  console.error("Error reading chunk:", error)
                  setIsTyping(false)
                })
            }

            // Start reading chunks
            readChunk()
          })
          .catch((error) => {
            console.error("Error in chat:", error)

            // Update the empty message with an error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempAssistantId
                  ? { ...msg, content: "I'm sorry, I encountered an error. Please try again." }
                  : msg,
              ),
            )

            setIsTyping(false)
          })
      })
    }
  }

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`
    setAttachments((prev) => [...prev, mockFileName])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index]
    setValue(selectedCommand.prefix + " ")
    setShowCommandPalette(false)

    setRecentCommand(selectedCommand.label)
    setTimeout(() => setRecentCommand(null), 2000)
  }

  return (
    <div className="flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0CF2A0]/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0CF2A0]/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-[#0CF2A0]/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>
      <div className="w-full max-w-2xl mx-auto relative">
        <motion.div
          className="relative z-10 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                How can I help today?
              </h1>
              <motion.div
                className="h-px bg-gradient-to-r from-transparent via-[#0CF2A0]/20 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p
              className="text-sm text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Type a command or ask a question
            </motion.p>
          </div>

          {/* Chat Messages - Reversed order (newest first) */}
          <motion.div
            ref={chatContainerRef}
            className="max-h-[300px] overflow-y-auto mb-4 p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex flex-col-reverse"
            style={{
              scrollBehavior: "smooth",
            }}
          >
            <AnimatePresence initial={false}>
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mr-auto max-w-[85%] rounded-lg p-3 bg-[#2a2a2a] text-gray-200 border border-gray-700/30 mb-4"
                >
                  <div className="flex items-center gap-2">
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
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex max-w-[85%] rounded-lg p-3 text-sm mb-4",
                    message.role === "user"
                      ? "ml-auto bg-[#0CF2A0]/10 text-white border border-[#0CF2A0]/20"
                      : "mr-auto bg-[#2a2a2a] text-gray-200 border border-gray-700/30",
                  )}
                >
                  <div className="w-full">
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
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="relative backdrop-blur-2xl bg-[#1a1a1a] rounded-2xl border border-gray-800/50 flex flex-col"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-[#111111]/90 rounded-lg z-50 shadow-lg border border-gray-700/30 overflow-hidden"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-1 bg-[#111111]/95">
                    {commandSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.prefix}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                          activeSuggestion === index ? "bg-[#0CF2A0]/10 text-white" : "text-white/70 hover:bg-white/5",
                        )}
                        onClick={() => selectCommandSuggestion(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-white/60">{suggestion.icon}</div>
                        <div className="font-medium">{suggestion.label}</div>
                        <div className="text-white/40 text-xs ml-1">{suggestion.prefix}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask Nexus AI a question..."
                containerClassName="w-full"
                className={cn(
                  "w-full px-4 py-3",
                  "resize-none",
                  "bg-transparent",
                  "border-none",
                  "text-white/90 text-sm",
                  "focus:outline-none",
                  "placeholder:text-white/20",
                  "min-h-[60px]",
                )}
                style={{
                  overflow: "hidden",
                }}
                showRing={false}
              />
            </div>

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  className="px-4 pb-3 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-xs bg-[#2a2a2a] py-1.5 px-3 rounded-lg text-white/70"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span>{file}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 border-t border-gray-800/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={handleAttachFile}
                  whileTap={{ scale: 0.94 }}
                  className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
                >
                  <Paperclip className="w-4 h-4" />
                  <motion.span
                    className="absolute inset-0 bg-[#2a2a2a] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="button-highlight"
                  />
                </motion.button>
                <motion.button
                  type="button"
                  data-command-button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCommandPalette((prev) => !prev)
                  }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                    showCommandPalette && "bg-[#2a2a2a] text-white/90",
                  )}
                >
                  <Command className="w-4 h-4" />
                  <motion.span
                    className="absolute inset-0 bg-[#2a2a2a] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="button-highlight"
                  />
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={handleSendMessage}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTyping || !value.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  "flex items-center gap-2",
                  value.trim()
                    ? "bg-[#0CF2A0] text-[#111111] shadow-lg shadow-[#0CF2A0]/10"
                    : "bg-[#2a2a2a] text-white/40",
                )}
              >
                {isTyping ? (
                  <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {commandSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.prefix}
                onClick={() => selectCommandSuggestion(index)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion.icon}
                <span>{suggestion.label}</span>
                <motion.div
                  className="absolute inset-0 border border-gray-800/50 rounded-lg"
                  initial={false}
                  animate={{
                    opacity: [0, 1],
                    scale: [0.98, 1],
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="fixed bottom-8 mx-auto transform -translate-x-1/2 backdrop-blur-2xl bg-[#1a1a1a] rounded-full px-4 py-2 shadow-lg border border-gray-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-7 rounded-full bg-[#0CF2A0]/20 flex items-center justify-center text-center">
                <span className="text-xs font-medium text-white/90 mb-0.5">Nexus</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>Thinking</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-[#0CF2A0] via-[#57DCC5] to-[#0CF2A0] blur-[96px]"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            mass: 0.5,
          }}
        />
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </div>
  )
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`

if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.innerHTML = rippleKeyframes
  document.head.appendChild(style)
}
