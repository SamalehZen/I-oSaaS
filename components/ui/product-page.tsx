"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from "framer-motion"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Sparkles } from "@/components/ui/sparkles"
import { FileUpload } from "@/components/ui/file-upload"
import { QuizDisplay } from "@/components/ui/quiz-display"
import { MenuIcon, CloseIcon, Logo, NavLink } from "@/components/ui/shared-components"
import { AlertCircle } from "lucide-react"
import { useQuizGenerator } from "@/hooks/use-quiz-generator"
import { AuroraButton } from "@/components/ui/aurora-button"
import { QuizOptions, type QuizType } from "@/components/ui/quiz-options"
import { GlowButton } from "@/components/ui/glow-button"

const ProductPage = () => {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [showQuestionCountSelector, setShowQuestionCountSelector] = useState<boolean>(false)
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [showQuizOptions, setShowQuizOptions] = useState<boolean>(false)
  const [quizOptions, setQuizOptions] = useState({
    title: "",
    language: "English",
    quizType: "multiple-choice" as QuizType,
    numQuestions: 5,
  })

  // Use our custom hook for quiz generation
  const {
    generateQuiz,
    isLoading: isGeneratingQuiz,
    error: quizError,
    quiz,
    resetQuiz,
  } = useQuizGenerator({
    onSuccess: () => {
      // Hide the question selector when quiz is successfully generated
      setShowQuestionCountSelector(false)
    },
  })

  // Combined loading state
  const isLoading = isExtractingText || isGeneratingQuiz

  // Combined error state
  const error = extractError || quizError?.message || null

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10)
  })

  // Canvas background effect setup
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const { theme } = useTheme()
  const dotsRef = useRef<any[]>([])
  const gridRef = useRef<Record<string, number[]>>({})
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  // Canvas constants
  const DOT_SPACING = 25
  const BASE_OPACITY_MIN = 0.4
  const BASE_OPACITY_MAX = 0.5
  const BASE_RADIUS = 1
  const INTERACTION_RADIUS = 150
  const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS
  const OPACITY_BOOST = 0.6
  const RADIUS_BOOST = 2.5
  const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5))

  // Canvas interaction handlers
  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) {
      mousePositionRef.current = { x: null, y: null }
      return
    }
    const rect = canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    mousePositionRef.current = { x: canvasX, y: canvasY }
  }, [])

  const createDots = useCallback(() => {
    const { width, height } = canvasSizeRef.current
    if (width === 0 || height === 0) return

    const newDots: any[] = []
    const newGrid: Record<string, number[]> = {}
    const cols = Math.ceil(width / DOT_SPACING)
    const rows = Math.ceil(height / DOT_SPACING)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2
        const y = j * DOT_SPACING + DOT_SPACING / 2
        const cellX = Math.floor(x / GRID_CELL_SIZE)
        const cellY = Math.floor(y / GRID_CELL_SIZE)
        const cellKey = `${cellX}_${cellY}`

        if (!newGrid[cellKey]) {
          newGrid[cellKey] = []
        }

        const dotIndex = newDots.length
        newGrid[cellKey].push(dotIndex)

        const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
        newDots.push({
          x,
          y,
          baseColor: `rgba(87, 220, 205, ${BASE_OPACITY_MAX})`,
          targetOpacity: baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: Math.random() * 0.005 + 0.002,
          baseRadius: BASE_RADIUS,
          currentRadius: BASE_RADIUS,
        })
      }
    }
    dotsRef.current = newDots
    gridRef.current = newGrid
  }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const width = container ? container.clientWidth : window.innerWidth
    const height = container ? container.clientHeight : window.innerHeight

    if (
      canvas.width !== width ||
      canvas.height !== height ||
      canvasSizeRef.current.width !== width ||
      canvasSizeRef.current.height !== height
    ) {
      canvas.width = width
      canvas.height = height
      canvasSizeRef.current = { width, height }
      createDots()
    }
  }, [createDots])

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const dots = dotsRef.current
    const grid = gridRef.current
    const { width, height } = canvasSizeRef.current
    const { x: mouseX, y: mouseY } = mousePositionRef.current

    if (!ctx || !dots || !grid || width === 0 || height === 0) {
      animationFrameId.current = requestAnimationFrame(animateDots)
      return
    }

    ctx.clearRect(0, 0, width, height)

    const activeDotIndices = new Set<number>()
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE)
      const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE)
      const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE)
      for (let i = -searchRadius; i <= searchRadius; i++) {
        for (let j = -searchRadius; j <= searchRadius; j++) {
          const checkCellX = mouseCellX + i
          const checkCellY = mouseCellY + j
          const cellKey = `${checkCellX}_${checkCellY}`
          if (grid[cellKey]) {
            grid[cellKey].forEach((dotIndex: number) => activeDotIndices.add(dotIndex))
          }
        }
      }
    }

    dots.forEach((dot: any, index: number) => {
      dot.currentOpacity += dot.opacitySpeed
      if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
        dot.opacitySpeed = -dot.opacitySpeed
        dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX))
        dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
      }

      let interactionFactor = 0
      dot.currentRadius = dot.baseRadius

      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX
        const dy = dot.y - mouseY
        const distSq = dx * dx + dy * dy

        if (distSq < INTERACTION_RADIUS_SQ) {
          const distance = Math.sqrt(distSq)
          interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS)
          interactionFactor = interactionFactor * interactionFactor
        }
      }

      const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST)
      dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST

      const colorMatch = dot.baseColor.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$$/)
      const r = colorMatch ? colorMatch[1] : "87"
      const g = colorMatch ? colorMatch[2] : "220"
      const b = colorMatch ? colorMatch[3] : "205"

      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2)
      ctx.fill()
    })

    animationFrameId.current = requestAnimationFrame(animateDots)
  }, [
    GRID_CELL_SIZE,
    INTERACTION_RADIUS,
    INTERACTION_RADIUS_SQ,
    OPACITY_BOOST,
    RADIUS_BOOST,
    BASE_OPACITY_MIN,
    BASE_OPACITY_MAX,
    BASE_RADIUS,
  ])

  // Set up canvas animation
  useEffect(() => {
    handleResize()
    const canvasElement = canvasRef.current
    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)

    animationFrameId.current = requestAnimationFrame(animateDots)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleResize, handleMouseMove, animateDots])

  // Handle mobile menu body overflow
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  // Animation variants
  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(17, 17, 17, 0.8)",
      borderBottomColor: "rgba(55, 65, 81, 0.5)",
      position: "fixed",
      boxShadow: "none",
    },
    scrolled: {
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      borderBottomColor: "rgba(75, 85, 99, 0.7)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      position: "fixed",
    },
  }

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } },
  }

  const contentDelay = 0.3
  const itemDelayIncrement = 0.1

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay } },
  }

  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } },
  }

  const uploaderVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } },
  }

  const quizVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  }

  // Handle file upload with improved error handling
  const handleFileUpload = async (file: File) => {
    console.log("File upload triggered:", file.name, file.type, file.size)
    setIsExtractingText(true)
    setExtractError(null)
    resetQuiz()
    setExtractedText(null)
    setShowQuestionCountSelector(false)

    try {
      // First, extract text from the PDF
      const formData = new FormData()
      formData.append("file", file)

      console.log("Sending request to extract text from PDF")
      const extractResponse = await fetch("/api/extractText", {
        method: "POST",
        body: formData,
      })

      console.log("Extract response status:", extractResponse.status)

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to extract text: ${extractResponse.status}`)
      }

      const extractData = await extractResponse.json()
      console.log("Text extracted successfully")

      if (!extractData.text || extractData.text.trim() === "") {
        throw new Error("Could not extract text from the PDF. The file might be empty or protected.")
      }

      setExtractedText(extractData.text)
      setShowQuizOptions(true)
      setQuizOptions((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "") || "Quiz",
      }))
    } catch (err) {
      console.error("Error processing PDF:", err)
      setExtractError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsExtractingText(false)
    }
  }

  // Handle quiz generation with our custom hook
  const handleGenerateQuiz = () => {
    if (!extractedText) {
      setExtractError("No text available to generate quiz. Please upload a PDF first.")
      return
    }

    // Use our custom hook to generate the quiz
    generateQuiz(extractedText, questionCount)
  }

  const handleRestart = () => {
    resetQuiz()
    setShowQuestionCountSelector(true)
  }

  const incrementQuestionCount = () => {
    if (questionCount < 20) {
      setQuestionCount(questionCount + 1)
    }
  }

  const decrementQuestionCount = () => {
    if (questionCount > 1) {
      setQuestionCount(questionCount - 1)
    }
  }

  const resetAll = () => {
    resetQuiz()
    setExtractedText(null)
    setExtractError(null)
    setShowQuestionCountSelector(false)
  }

  const handleQuizOptionsSubmit = (options: {
    title: string
    language: string
    quizType: QuizType
    numQuestions: number
  }) => {
    setQuizOptions(options)
    setShowQuizOptions(false)
    setQuestionCount(options.numQuestions)

    // Generate the quiz with the selected options
    generateQuiz(extractedText!, options.numQuestions)
  }

  return (
    <div className="pt-[100px] relative bg-[#111111] text-gray-300 min-h-screen flex flex-col overflow-x-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)",
        }}
      ></div>

      <motion.header
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="px-6 w-full md:px-10 lg:px-16 sticky top-0 z-30 backdrop-blur-md border-b"
      >
        <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
          <Logo />

          <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8 px-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/product" className="text-[#0CF2A0]">
              Product
            </NavLink>
            <NavLink href="/demo">Demo</NavLink>
            <NavLink href="#">Features</NavLink>
            <NavLink href="#">Pricing</NavLink>
            <NavLink href="#">Contact</NavLink>
          </div>

          <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
            <NavLink href="#" className="hidden md:inline-block">
              Sign in
            </NavLink>

            <AuroraButton
              onClick={() => router.push("/")}
              className="px-4 py-[6px] text-sm font-semibold whitespace-nowrap"
              glowClassName="from-[#0CF2A0] via-[#57DCC5] to-[#0CF2A0] opacity-85"
            >
              Get Started
            </AuroraButton>

            <motion.button
              className="md:hidden text-gray-300 hover:text-white z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
            >
              <div className="flex flex-col items-center space-y-4 px-6">
                <NavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </NavLink>
                <NavLink href="/product" onClick={() => setIsMobileMenuOpen(false)} className="text-[#0CF2A0]">
                  Product
                </NavLink>
                <NavLink href="/demo" onClick={() => setIsMobileMenuOpen(false)}>
                  Demo
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Pricing
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </NavLink>
                <hr className="w-full border-t border-gray-700/50 my-2" />
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign in
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10">
        <motion.h1
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl lg:text-[64px] font-semibold text-white leading-tight max-w-4xl mb-6"
        >
          PDF <span className="text-[#0CF2A0]">Quiz</span> Generator
        </motion.h1>

        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Upload any PDF document and our AI will generate interactive quizzes to test knowledge and enhance learning.
        </motion.p>

        <motion.div
          variants={uploaderVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl mx-auto mb-12"
        >
          {!showQuestionCountSelector && !quiz && (
            <FileUpload
              onFileSelect={handleFileUpload}
              isLoading={isExtractingText}
              acceptedFileTypes="application/pdf,.pdf"
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
          )}
        </motion.div>

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="flex-1 text-left">{error}</p>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => {
                  setExtractError(null)
                  if (quizError) resetQuiz()
                }}
                className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-md text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {showQuizOptions && !quiz && (
            <motion.div
              key="quiz-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl mx-auto mb-8"
            >
              <QuizOptions
                onSubmit={handleQuizOptionsSubmit}
                onCancel={resetAll}
                defaultTitle={quizOptions.title}
                defaultLanguage={quizOptions.language}
                defaultQuizType={quizOptions.quizType}
                defaultNumQuestions={quizOptions.numQuestions}
                isLoading={isGeneratingQuiz}
              />
            </motion.div>
          )}

          {quiz && (
            <motion.div
              key="quiz"
              variants={quizVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full max-w-3xl mx-auto"
            >
              <QuizDisplay quiz={quiz} onRestart={handleRestart} />
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <GlowButton onClick={resetAll}>Upload New PDF</GlowButton>
              </div>
            </motion.div>
          )}

          {isLoading && !quiz && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 border-4 border-[#0CF2A0]/20 border-t-[#0CF2A0] rounded-full animate-spin"></div>
              <p className="text-white/70">
                {isExtractingText ? "Extracting text from your document..." : "Generating your quiz..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-48 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
          <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#0CF2A0,transparent_70%)] before:opacity-70" />
          <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-zinc-900/20 dark:border-white/20 bg-white dark:bg-zinc-900" />
          <Sparkles
            density={1200}
            className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
            color={theme === "dark" ? "#ffffff" : "#000000"}
          />
        </div>

        <p className="text-xs text-gray-500 mt-4">© 2025 Nexus. All rights reserved.</p>
      </main>
    </div>
  )
}

export default ProductPage
