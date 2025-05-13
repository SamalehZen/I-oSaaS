"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Info } from "lucide-react"
import { GlowButton } from "@/components/ui/glow-button"
import { ShineBorder } from "@/components/ui/shine-border"

export type QuizType = "multiple-choice" | "true-false" | "fill-in-blank" | "long-form"

interface QuizOptionsProps {
  onSubmit: (options: {
    title: string
    language: string
    quizType: QuizType
    numQuestions: number
  }) => void
  onCancel?: () => void
  defaultTitle?: string
  defaultLanguage?: string
  defaultQuizType?: QuizType
  defaultNumQuestions?: number
  isLoading?: boolean
  className?: string
}

export function QuizOptions({
  onSubmit,
  onCancel,
  defaultTitle = "",
  defaultLanguage = "English",
  defaultQuizType = "multiple-choice",
  defaultNumQuestions = 5,
  isLoading = false,
  className,
}: QuizOptionsProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [language, setLanguage] = useState(defaultLanguage)
  const [quizType, setQuizType] = useState<QuizType>(defaultQuizType)
  const [numQuestions, setNumQuestions] = useState(defaultNumQuestions)

  const handleSubmit = () => {
    onSubmit({
      title: title || "Quiz",
      language,
      quizType,
      numQuestions,
    })
  }

  const languages = ["English", "Français", "Español", "Deutsch", "Italiano", "中文", "日本語", "한국어"]

  return (
    <ShineBorder
      className={cn("p-0 bg-transparent dark:bg-transparent w-full min-w-full", className)}
      borderWidth={2}
      borderRadius={12}
      duration={10}
      color={["#0CF2A0", "#57DCC5", "#0CF2A0"]}
    >
      <div className="bg-[#1a1a1a]/60 backdrop-blur-sm rounded-xl p-6 md:p-8">
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-6">Quiz Options</h2>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                id="quiz-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-transparent"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label htmlFor="quiz-language" className="block text-sm font-medium text-gray-300">
                Language
              </label>
              <div className="relative">
                <select
                  id="quiz-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quiz Type */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Quiz Type</label>

              <div className="space-y-3">
                <QuizTypeOption
                  id="multiple-choice"
                  label="Multiple Choice"
                  checked={quizType === "multiple-choice"}
                  onChange={() => setQuizType("multiple-choice")}
                  tooltip="Questions with multiple options where one is correct"
                />

                <QuizTypeOption
                  id="true-false"
                  label="True False"
                  checked={quizType === "true-false"}
                  onChange={() => setQuizType("true-false")}
                  tooltip="Questions with True or False answers only"
                />

                <QuizTypeOption
                  id="fill-in-blank"
                  label="Fill In The Blank"
                  checked={quizType === "fill-in-blank"}
                  onChange={() => setQuizType("fill-in-blank")}
                  tooltip="Questions where users fill in missing words"
                />

                <QuizTypeOption
                  id="long-form"
                  label="Long Form"
                  checked={quizType === "long-form"}
                  onChange={() => setQuizType("long-form")}
                  tooltip="Questions requiring detailed written answers"
                />
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <label htmlFor="num-questions" className="block text-sm font-medium text-gray-300">
                Number of Questions
              </label>
              <input
                id="num-questions"
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, Number.parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-transparent"
              />
              <p className="text-xs text-gray-400">Maximum 20 questions</p>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <GlowButton onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </GlowButton>
          </div>
        </div>
      </div>
    </ShineBorder>
  )
}

interface QuizTypeOptionProps {
  id: string
  label: string
  checked: boolean
  onChange: () => void
  tooltip?: string
}

function QuizTypeOption({ id, label, checked, onChange, tooltip }: QuizTypeOptionProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "flex items-center p-3 rounded-md border cursor-pointer transition-all w-full",
          checked
            ? "border-[#0CF2A0] bg-[#0CF2A0]/10"
            : "border-gray-700 hover:border-gray-500 bg-[#2a2a2a]/30 hover:bg-[#2a2a2a]/50",
        )}
        onClick={onChange}
      >
        <input
          type="radio"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          aria-labelledby={`${id}-label`}
        />
        <div
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center mr-3",
            checked ? "border-[#0CF2A0] bg-[#0CF2A0]/20" : "border-gray-500",
          )}
        >
          {checked && <Check className="w-3 h-3 text-[#0CF2A0]" />}
        </div>
        <label id={`${id}-label`} htmlFor={id} className="flex-1 text-white cursor-pointer">
          {label}
        </label>
        {tooltip && (
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation()
              setShowTooltip(!showTooltip)
            }}
            aria-label="More information"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {tooltip && showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute right-0 bottom-full mb-2 p-2 bg-[#333] text-white text-xs rounded shadow-lg z-10 max-w-xs"
        >
          {tooltip}
          <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-[#333] transform rotate-45"></div>
        </motion.div>
      )}
    </div>
  )
}
