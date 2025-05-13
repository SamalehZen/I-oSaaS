"use client"
import { useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect"

export function NexusGeminiEffect() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Create animated path lengths based on scroll position
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.5], [0.2, 1.0])
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.5], [0.15, 1.0])
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.5], [0.1, 1.0])
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.5], [0.05, 1.0])
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.5], [0, 1.0])

  return (
    <div className="w-full relative h-[400px] my-8 overflow-hidden" ref={ref}>
      <GoogleGeminiEffect
        pathLengths={[pathLengthFirst, pathLengthSecond, pathLengthThird, pathLengthFourth, pathLengthFifth]}
        title="Powered by AI"
        description="Experience the future of customer support with our advanced AI capabilities"
        className="h-full"
      />
    </div>
  )
}
