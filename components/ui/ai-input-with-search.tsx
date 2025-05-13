"use client"

import type React from "react"

import { Globe, Paperclip, Send } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"

interface AIInputWithSearchProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (value: string, withSearch: boolean) => void
  onFileSelect?: (file: File) => void
  className?: string
}

export function AIInputWithSearch({
  id = "ai-input-with-search",
  placeholder = "Ask Nexus AI...",
  minHeight = 48,
  maxHeight = 164,
  onSubmit,
  onFileSelect,
  className,
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  })
  const [showSearch, setShowSearch] = useState(true)

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value, showSearch)
      setValue("")
      adjustHeight(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect?.(file)
    }
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <div className="relative flex flex-col shadow-[0_0_15px_rgba(12,242,160,0.15)]">
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
            <Textarea
              id={id}
              value={value}
              placeholder={placeholder}
              className="w-full rounded-xl rounded-b-none px-4 py-3 bg-[#2a2a2a] border-none text-white placeholder:text-white/70 resize-none focus-visible:ring-0 leading-[1.2] focus-visible:ring-[#0CF2A0] focus-visible:ring-opacity-50"
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
            />
          </div>

          <div className="h-12 bg-[#2a2a2a] rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label className="cursor-pointer rounded-lg p-2 bg-[#1a1a1a] hover:bg-[#333333] transition-colors">
                <input type="file" className="hidden" onChange={handleFileChange} />
                <Paperclip className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
              </label>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  showSearch
                    ? "bg-[#0CF2A0]/15 border-[#0CF2A0] text-[#0CF2A0]"
                    : "bg-[#1a1a1a] border-transparent text-white/40 hover:text-white",
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
                    <Globe className={cn("w-4 h-4", showSearch ? "text-[#0CF2A0]" : "text-inherit")} />
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
                      className="text-sm overflow-hidden whitespace-nowrap text-[#0CF2A0] flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  value ? "bg-[#0CF2A0]/15 text-[#0CF2A0]" : "bg-[#1a1a1a] text-white/40 hover:text-white",
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
