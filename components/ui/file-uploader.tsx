"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { FileUp, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
  className?: string
}

export function FileUploader({ onFileUpload, isLoading, className }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        onFileUpload(droppedFile)
      } else {
        setError("Please upload a PDF file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    console.log("File input change detected")

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size)

      if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
        console.log("Valid PDF file detected, proceeding with upload")
        setFile(selectedFile)
        onFileUpload(selectedFile)
      } else {
        console.log("Invalid file type:", selectedFile.type)
        setError("Please upload a PDF file")
      }
    } else {
      console.log("No file selected")
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 bg-[#1a1a1a]/60 rounded-xl",
        isDragging ? "border-[#0CF2A0] border-2" : "border border-gray-700/50",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={isLoading}
      />

      {error && (
        <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
          {error}
        </div>
      )}

      {!file ? (
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            className="w-16 h-16 rounded-full bg-[#0CF2A0]/10 flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileUp className="w-8 h-8 text-[#0CF2A0]" />
          </motion.div>
          <h3 className="text-xl font-medium text-white mb-2">Upload PDF Document</h3>
          <p className="text-gray-400 mb-6 max-w-md">Drag and drop your PDF file here, or click to browse your files</p>
          <motion.button
            type="button"
            onClick={handleButtonClick}
            className="px-6 py-3 bg-[#0CF2A0]/10 text-[#0CF2A0] rounded-lg font-medium border border-[#0CF2A0]/30 hover:bg-[#0CF2A0]/20 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            Browse Files
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full bg-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#0CF2A0]/10 flex items-center justify-center mr-4">
              <FileText className="w-5 h-5 text-[#0CF2A0]" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
              <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-[#0CF2A0]/30 border-t-[#0CF2A0] rounded-full animate-spin"></div>
          ) : (
            <motion.button
              onClick={handleRemoveFile}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
