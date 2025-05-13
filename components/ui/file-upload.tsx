"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, Trash2, Loader, CheckCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileWithPreview {
  id: string
  preview: string
  progress: number
  name: string
  size: number
  type: string
  lastModified?: number
  file?: File
}

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedFileTypes?: string
  maxFileSize?: number // in bytes
  isLoading?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes = "application/pdf",
  maxFileSize = 10 * 1024 * 1024, // Default 10MB
  isLoading = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file type
    const isPdfByType = file.type === "application/pdf"
    const isPdfByExtension = file.name.toLowerCase().endsWith(".pdf")

    if (!isPdfByType && !isPdfByExtension) {
      setError("Please upload a PDF file")
      return false
    }

    // Check file size
    if (file.size > maxFileSize) {
      setError(`File size exceeds ${formatFileSize(maxFileSize)} limit (${formatFileSize(file.size)})`)
      return false
    }

    return true
  }

  // Process dropped or selected files
  const handleFiles = (fileList: FileList) => {
    if (fileList.length === 0) return

    const file = fileList[0] // Only take the first file

    if (!validateFile(file)) return

    const newFile = {
      id: `${Date.now()}`,
      preview: URL.createObjectURL(file),
      progress: 0,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      file,
    }

    setFiles([newFile]) // Replace any existing file
    simulateUpload(newFile.id)
    onFileSelect(file)
  }

  // Simulate upload progress
  const simulateUpload = (id: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: Math.min(progress, 100) } : f)))
      if (progress >= 100) {
        clearInterval(interval)
        if (navigator.vibrate) navigator.vibrate(100)
      }
    }, 300)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const clearFile = () => {
    setFiles([])
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Error message */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <motion.div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        initial={false}
        animate={{
          borderColor: isDragging ? "#0CF2A0" : "#ffffff10",
          scale: isDragging ? 1.02 : 1,
          opacity: isLoading ? 0.7 : 1,
        }}
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative rounded-xl p-8 md:p-12 text-center cursor-pointer bg-[#1a1a1a]/60 border border-gray-700/50 shadow-sm hover:shadow-md backdrop-blur group",
          isDragging && "ring-4 ring-[#0CF2A0]/30 border-[#0CF2A0]",
          isLoading && "cursor-not-allowed",
        )}
      >
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ y: isDragging ? [-5, 0, -5] : 0 }}
            transition={{
              duration: 1.5,
              repeat: isDragging ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <motion.div
              animate={{
                opacity: isDragging ? [0.5, 1, 0.5] : 1,
                scale: isDragging ? [0.95, 1.05, 0.95] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isDragging ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
              className="absolute -inset-4 bg-[#0CF2A0]/10 rounded-full blur-md"
              style={{ display: isDragging ? "block" : "none" }}
            />
            <UploadCloud
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 drop-shadow-sm",
                isDragging
                  ? "text-[#0CF2A0]"
                  : "text-white/70 group-hover:text-[#0CF2A0] transition-colors duration-300",
              )}
            />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              {isDragging ? "Drop PDF here" : files.length ? "Replace PDF" : "Upload your PDF"}
            </h3>
            <p className="text-gray-400 md:text-lg max-w-md mx-auto">
              {isDragging ? (
                <span className="font-medium text-[#0CF2A0]">Release to upload</span>
              ) : (
                <>
                  Drag & drop your PDF here, or <span className="text-[#0CF2A0] font-medium">browse</span>
                </>
              )}
            </p>
            <p className="text-sm text-gray-500">Supports PDF files up to {formatFileSize(maxFileSize)}</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            hidden
            onChange={onSelect}
            accept={acceptedFileTypes}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      {/* Uploaded file */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-6"
          >
            <div className="px-4 py-4 flex items-start gap-4 rounded-xl bg-[#2a2a2a] shadow hover:shadow-md transition-all duration-200">
              {/* File icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-[#0CF2A0]/10 flex items-center justify-center border dark:border-zinc-700 shadow-sm">
                  <FileText className="w-8 h-8 text-[#0CF2A0]" />
                </div>
                {files[0].progress === 100 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -right-2 -bottom-2 bg-[#1a1a1a] rounded-full shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                )}
              </div>

              {/* File info & progress */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 w-full">
                  {/* Filename */}
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="font-medium text-base md:text-lg truncate text-white" title={files[0].name}>
                      {files[0].name}
                    </h4>
                  </div>

                  {/* Details & remove/loading */}
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-400">
                    <span className="text-xs md:text-sm">{formatFileSize(files[0].size)}</span>
                    <span className="flex items-center gap-1.5">
                      {isLoading ? (
                        <Loader className="w-4 h-4 animate-spin text-[#0CF2A0]" />
                      ) : (
                        <Trash2
                          className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearFile()
                          }}
                          aria-label="Remove file"
                        />
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isLoading ? "90%" : `${files[0].progress}%` }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "h-full rounded-full shadow-inner",
                      isLoading
                        ? "bg-[#0CF2A0] animate-pulse"
                        : files[0].progress < 100
                          ? "bg-[#0CF2A0]"
                          : "bg-emerald-500",
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
