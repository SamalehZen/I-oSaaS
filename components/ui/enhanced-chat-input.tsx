"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import { ArrowUp, Paperclip, Square, X, FileImage, Upload, Mic, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// CSS Variables and Base Styles
const styles = `
  .chat-input-modal {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-input-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
  }

  .chat-input-modal-content {
    position: relative;
    background-color: #1F2023;
    border-radius: 1rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 32rem;
    margin: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .chat-input-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .chat-input-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  .chat-input-scrollbar::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 3px;
  }

  .chat-input-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555555;
  }

  .chat-input-textarea {
    padding: 0.4rem;
    line-height: 1.5;
  }

  .voice-recorder-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background-color: #1F2023;
    border: 1px solid #333333;
    border-radius: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .voice-recorder-bar {
    background: linear-gradient(180deg, #3B82F6 0%, #8B5CF6 100%);
    opacity: 0.8;
  }

  .upload-dialog-content {
    background: linear-gradient(180deg, #1F2023 0%, #2E3033 100%);
    border: 1px solid #333333;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .upload-dialog-dropzone {
    background: linear-gradient(180deg, #2E3033 0%, #1F2023 100%);
    border: 2px dashed #444444;
    transition: all 0.3s ease;
  }

  .upload-dialog-dropzone:hover {
    border-color: #3B82F6;
    background: linear-gradient(180deg, #2E3033 0%, #1F2023 100%);
  }

  .upload-dialog-dropzone.dragging {
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.1);
  }

  .search-toggle-button {
    transition: all 0.2s ease;
  }
`

// Simple Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div className="chat-input-modal">
      <div className="chat-input-modal-overlay" onClick={onClose} />
      <div className="chat-input-modal-content">{children}</div>
    </div>
  )
}

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "icon"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-white text-black hover:bg-white/80",
        variant === "outline" && "border border-[#333333] hover:bg-[#2E3033]",
        variant === "ghost" && "bg-transparent hover:bg-[#2E3033]",
        size === "default" && "h-10 py-2 px-4",
        size === "icon" && "h-10 w-10",
        className,
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

// Voice Recorder Component
interface VoiceRecorderProps {
  onStart?: () => void
  onStop?: (duration: number) => void
  visualizerBars?: number
  className?: string
}

const VoiceRecorder = ({ onStart, onStop, visualizerBars = 48, className }: VoiceRecorderProps) => {
  const [time, setTime] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    onStart?.()

    const intervalId = setInterval(() => {
      setTime((t) => t + 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)
      onStop?.(time)
    }
  }, [onStart, onStop, time])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full mx-auto flex items-center flex-col gap-2">
        <span className="font-mono text-sm text-gray-300">{formatTime(time)}</span>

        <div className="h-4 w-full flex items-center justify-center gap-0.5 my-1">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full voice-recorder-bar animate-pulse"
              style={
                isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-gray-300">Listening... Press the mic icon to stop</p>
      </div>
    </div>
  )
}

// Upload Dialog Component
const UploadDialog = ({
  isOpen,
  onClose,
  onFileSelect,
}: {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  if (!isOpen) return null

  return (
    <div className="chat-input-modal">
      <div className="chat-input-modal-overlay" onClick={onClose} />
      <div className="chat-input-modal-content upload-dialog-content">
        <div className="flex flex-col items-center justify-center p-6">
          <div
            className={cn("w-full aspect-video rounded-xl upload-dialog-dropzone", isDragging && "dragging")}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-400">Drop image here or click to select</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelect(file)
            }}
            accept="image/*"
          />
        </div>
      </div>
    </div>
  )
}

// Main ChatInput Component
interface ChatInputProps {
  onSend: (message: string, files?: File[], withSearch?: boolean) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export const EnhancedChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  placeholder = "Type your message here...",
  className,
}) => {
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isImageFile = (file: File) => file.type.startsWith("image/")

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)")
      return
    }
    setFiles([file])
    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreviews({
        [file.name]: e.target?.result as string,
      })
    }
    reader.readAsDataURL(file)
    setIsUploadDialogOpen(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFile = event.target.files[0]
      if (!newFile) return
      processFile(newFile)
    }
    if (event.target) {
      event.target.value = ""
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => isImageFile(file))
    if (imageFiles.length > 0) {
      processFile(imageFiles[0])
    }
  }, [])

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove && filePreviews[fileToRemove.name]) {
      setFilePreviews({})
    }
    setFiles([])
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = ""
    }
  }

  const handleSubmit = () => {
    if (input.trim() || files.length > 0) {
      onSend(input, files, showSearch)
      setInput("")
      setFiles([])
      setFilePreviews({})
    }
  }

  const handleVoiceRecordingStart = () => {
    setIsRecording(true)
  }

  const handleVoiceRecordingStop = (duration: number) => {
    setIsRecording(false)
    console.log("Recording stopped, duration:", duration)
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 200) // Max height of 200px
      textarea.style.height = `${newHeight}px`
    }
  }, [input])

  return (
    <>
      <style>{styles}</style>
      <div className="relative">
        {isRecording && (
          <div className="voice-recorder-container">
            <VoiceRecorder onStart={handleVoiceRecordingStart} onStop={handleVoiceRecordingStop} visualizerBars={32} />
          </div>
        )}

        <div
          className={cn(
            "rounded-3xl border border-[#333333] bg-[#1F2023] p-2 shadow-lg transition-all duration-200",
            className,
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-0 pb-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 rounded-lg bg-[#2E3033] text-sm border border-[#333333]",
                    file.type.startsWith("image/") ? "p-0" : "p-4",
                  )}
                >
                  {file.type.startsWith("image/") ? (
                    <div className="relative h-20 w-20 md:h-14 md:w-14 overflow-hidden rounded-xl">
                      {filePreviews[file.name] ? (
                        <>
                          <div
                            className="h-full w-full cursor-pointer"
                            onClick={() => setSelectedImage(filePreviews[file.name])}
                          >
                            <img
                              src={filePreviews[file.name] || "/placeholder.svg"}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFile(index)
                            }}
                            className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 hover:bg-black/80 transition-colors"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <FileImage className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="max-w-[120px] truncate text-gray-300">{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="rounded-full p-1 hover:bg-white/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={placeholder}
            className={cn(
              "min-h-[44px] w-full resize-none border-none bg-transparent text-gray-100 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "chat-input-scrollbar chat-input-textarea",
              "placeholder:text-gray-400 text-lg",
            )}
            rows={1}
            disabled={isLoading}
          />

          <div className="flex items-center justify-between gap-2 p-0 pt-2 md:pt-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsUploadDialogOpen(true)}
                className="flex h-8 w-8 text-gray-400 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-500/20 hover:text-gray-300"
              >
                <Paperclip className="h-5 w-5 transition-colors" />
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors",
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-gray-400 hover:bg-gray-500/20 hover:text-gray-300",
                )}
              >
                <Mic className="h-5 w-5 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "search-toggle-button rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  showSearch
                    ? "bg-sky-500/15 border-sky-400 text-sky-500"
                    : "bg-black/5 border-transparent text-gray-400 hover:text-gray-300",
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe className={cn("w-4 h-4", showSearch ? "text-sky-500" : "text-inherit")} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-sky-500 flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading && !(input.trim() || files.length > 0)}
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center",
                input.trim() || files.length > 0
                  ? "bg-white hover:bg-white/80 text-black"
                  : "bg-transparent hover:bg-transparent text-white/50",
              )}
            >
              {isLoading ? <Square className="h-4 w-4 fill-current animate-pulse" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onFileSelect={processFile}
      />

      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <div className="w-full h-full flex items-center justify-center relative">
          <img src={selectedImage || ""} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      </Modal>
    </>
  )
}
