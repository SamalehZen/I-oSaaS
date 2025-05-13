/**
 * Type definitions for quiz-related data structures
 */

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export interface Quiz {
  title: string
  questions: QuizQuestion[]
}
