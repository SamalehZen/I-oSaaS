"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, type SVGProps } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from "framer-motion"
import { useTheme } from "next-themes"
import { Sparkles } from "@/components/ui/sparkles"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"
import { EnhancedAIChat } from "@/components/ui/enhanced-ai-chat"
import { DisplayCardsDemo } from "@/components/ui/display-cards-demo"
import { Maximize2, Minimize2 } from "lucide-react"

// Reusing the same logo component
const Logo: React.FC = () => (
  <div className="flex items-center flex-shrink-0 relative">
    <div className="absolute -inset-4 bg-[radial-gradient(circle_at_center,#0CF2A0_5%,rgba(12,242,160,0.5)_30%,rgba(12,242,160,0.1)_60%,transparent_80%)] opacity-70 blur-md z-0"></div>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="#0CF2A0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 17L12 22L22 17" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12L12 17L22 12" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-xl font-bold text-white ml-2 relative z-10">Nexus</span>
  </div>
)

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const NavLink: React.FC<{ href?: string; children: React.ReactNode; className?: string }> = ({
  href = "#",
  children,
  className = "",
}) => (
  <motion.a
    href={href}
    className={cn(
      "relative group text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center py-1",
      className,
    )}
    whileHover="hover"
  >
    {children}
    <motion.div
      className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#0CF2A0]"
      variants={{ initial: { scaleX: 0, originX: 0.5 }, hover: { scaleX: 1, originX: 0.5 } }}
      initial="initial"
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  </motion.a>
)

interface Dot {
  x: number
  y: number
  baseColor: string
  targetOpacity: number
  currentOpacity: number
  opacitySpeed: number
  baseRadius: number
  currentRadius: number
}

const DemoPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10)
  })

  const dotsRef = useRef<Dot[]>([])
  const gridRef = useRef<Record<string, number[]>>({})
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const DOT_SPACING = 25
  const BASE_OPACITY_MIN = 0.4
  const BASE_OPACITY_MAX = 0.5
  const BASE_RADIUS = 1
  const INTERACTION_RADIUS = 150
  const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS
  const OPACITY_BOOST = 0.6
  const RADIUS_BOOST = 2.5
  const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5))

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

    const newDots: Dot[] = []
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
            grid[cellKey].forEach((dotIndex) => activeDotIndices.add(dotIndex))
          }
        }
      }
    }

    dots.forEach((dot, index) => {
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

  const chatVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } },
  }

  const featuresVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 } },
  }

  const { theme } = useTheme()

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
            <NavLink href="#">Product</NavLink>
            <NavLink href="#">Features</NavLink>
            <NavLink href="#">Pricing</NavLink>
            <NavLink href="#">Contact</NavLink>
          </div>

          <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
            <NavLink href="#" className="hidden md:inline-block">
              Sign in
            </NavLink>

            <motion.a
              href="/"
              className="bg-[#0CF2A0] text-[#111111] px-4 py-[6px] rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Back to Home
            </motion.a>

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
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Product
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
          Experience <span className="text-[#0CF2A0]">Nexus</span> in Action
        </motion.h1>

        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Try our AI assistant and see how Nexus can transform your customer support experience. Ask any questions about
          our platform and features.
        </motion.p>

        <motion.div
          variants={chatVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "mb-12 transition-all duration-300 ease-in-out",
            isFullScreen ? "w-full max-w-[1000px]" : "w-full max-w-[700px]",
          )}
        >
          <div className="relative">
            <ShineBorder
              className="p-0 bg-transparent dark:bg-transparent w-full min-w-full"
              borderWidth={2}
              borderRadius={12}
              duration={10}
              color={["#0CF2A0", "#57DCC5", "#0CF2A0"]}
            >
              <div className="relative">
                <EnhancedAIChat />
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="absolute top-3 right-3 bg-[#1F2023] p-2 rounded-full text-gray-400 hover:text-white transition-colors z-10"
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </ShineBorder>
          </div>
        </motion.div>

        {!isFullScreen && (
          <motion.div
            variants={featuresVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto mb-16"
          >
            <DisplayCardsDemo />
          </motion.div>
        )}

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

export default DemoPage

export function AIInputWithSearchDemo() {
  return (
    <div className="space-y-8 w-full max-w-[700px]">
      <ShineBorder
        className="p-0 bg-transparent dark:bg-transparent w-full min-w-full"
        borderWidth={2}
        borderRadius={12}
        duration={10}
        color={["#0CF2A0", "#57DCC5", "#0CF2A0"]}
      >
        <EnhancedAIChat />
      </ShineBorder>
    </div>
  )
}
