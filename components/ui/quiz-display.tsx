"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, RefreshCw, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"
import { GlowButton } from "@/components/ui/glow-button"

interface Quiz {
  title: string
  questions: {
    question: string
    options: string[]
    correctAnswer: string
    explanation?: string
  }[]
}

interface QuizDisplayProps {
  quiz: Quiz
  className?: string
  onRestart: () => void
}

export function QuizDisplay({ quiz, className, onRestart }: QuizDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({})

  const totalQuestions = quiz.questions.length

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (showResults) return

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option,
    })
  }

  const handleSubmitQuiz = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setShowResults(true)
      setIsSubmitting(false)

      // Auto-expand explanations for incorrect answers
      const newExpandedExplanations: Record<number, boolean> = {}
      quiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] !== question.correctAnswer) {
          newExpandedExplanations[index] = true
        }
      })
      setExpandedExplanations(newExpandedExplanations)

      // Scroll to the top to see the score
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 1000)
  }

  const toggleExplanation = (questionIndex: number) => {
    setExpandedExplanations({
      ...expandedExplanations,
      [questionIndex]: !expandedExplanations[questionIndex],
    })
  }

  const calculateScore = () => {
    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++
      }
    })
    return {
      score: correctCount,
      total: totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100),
    }
  }

  const score = calculateScore()
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === totalQuestions

  return (
    <div className={cn("w-full", className)}>
      <ShineBorder
        className="p-0 bg-transparent dark:bg-transparent w-full min-w-full mb-8"
        borderWidth={2}
        borderRadius={12}
        duration={10}
        color={["#0CF2A0", "#57DCC5", "#0CF2A0"]}
      >
        <div className="bg-[#1a1a1a]/60 rounded-xl p-6 md:p-8">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-white">{quiz.title}</h2>
              <div className="text-sm text-gray-400">{totalQuestions} Questions</div>
            </div>

            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 p-6 bg-[#2a2a2a]/30 rounded-lg border border-gray-700/50"
              >
                <h3 className="text-xl font-semibold text-white mb-2">Quiz Results</h3>
                <div className="flex items-center justify-center my-4">
                  <div
                    className={cn(
                      "text-4xl font-bold w-24 h-24 rounded-full flex items-center justify-center",
                      score.percentage >= 70
                        ? "bg-green-500/20 text-green-400"
                        : score.percentage >= 40
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400",
                    )}
                  >
                    {score.percentage}%
                  </div>
                </div>
                <p className="text-gray-300 mb-2">
                  You got {score.score} out of {score.total} questions correct.
                </p>
                <p className="text-gray-400 text-sm mb-4">Scroll down to review your answers and explanations.</p>
              </motion.div>
            )}

            <div className="space-y-8">
              {quiz.questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
                  className={cn(
                    "p-6 rounded-lg border",
                    showResults && selectedAnswers[questionIndex] === question.correctAnswer
                      ? "border-green-500/30 bg-green-500/5"
                      : showResults && selectedAnswers[questionIndex]
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-gray-700/50 bg-[#2a2a2a]/30",
                  )}
                >
                  <h3 className="text-lg md:text-xl font-medium text-white mb-6 text-left">
                    <span className="inline-block bg-[#333] text-[#0CF2A0] w-8 h-8 rounded-full text-center leading-8 mr-3">
                      {questionIndex + 1}
                    </span>
                    {question.question}
                  </h3>

                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <motion.div
                        key={`${questionIndex}-${optionIndex}`}
                        className={cn(
                          "flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                          selectedAnswers[questionIndex] === option
                            ? "border-[#0CF2A0] bg-[#0CF2A0]/10"
                            : "border-gray-700/50 hover:border-gray-500/50 bg-[#2a2a2a]/30 hover:bg-[#2a2a2a]/50",
                          showResults &&
                            (option === question.correctAnswer
                              ? "border-green-500 bg-green-500/10"
                              : selectedAnswers[questionIndex] === option
                                ? "border-red-500 bg-red-500/10"
                                : ""),
                        )}
                        onClick={() => handleOptionSelect(questionIndex, option)}
                        whileHover={!showResults ? { scale: 1.01 } : {}}
                        whileTap={!showResults ? { scale: 0.99 } : {}}
                      >
                        <div className="flex-1 text-left text-white">{option}</div>
                        {showResults && option === question.correctAnswer && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        {showResults &&
                          selectedAnswers[questionIndex] === option &&
                          option !== question.correctAnswer && <X className="w-5 h-5 text-red-500" />}
                      </motion.div>
                    ))}
                  </div>

                  {showResults && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleExplanation(questionIndex)}
                        className="flex items-center gap-2 text-sm text-[#0CF2A0] hover:text-[#0CF2A0]/80 transition-colors"
                      >
                        <HelpCircle size={16} />
                        {expandedExplanations[questionIndex] ? "Hide Explanation" : "Show Explanation"}
                      </button>

                      {expandedExplanations[questionIndex] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-4 bg-[#2a2a2a]/50 rounded-lg border border-gray-700/50"
                        >
                          <h4 className="font-medium text-[#0CF2A0] mb-2">Explanation:</h4>
                          <p className="text-gray-300">
                            {question.explanation ||
                              `The correct answer is "${question.correctAnswer}". This option was determined to be the most accurate based on the content provided in the document.`}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {!showResults ? (
                <GlowButton
                  onClick={handleSubmitQuiz}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    !allQuestionsAnswered || isSubmitting ? "opacity-70 cursor-not-allowed" : "",
                  )}
                  disabled={!allQuestionsAnswered || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : null}
                  Submit Quiz ({Object.keys(selectedAnswers).length}/{totalQuestions} answered)
                </GlowButton>
              ) : (
                <GlowButton onClick={onRestart} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start New Quiz
                </GlowButton>
              )}
            </div>
          </div>
        </div>
      </ShineBorder>
    </div>
  )
}
