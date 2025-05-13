"use client"

import { GlowEffect } from "@/components/ui/glow-effect"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface GlowButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function GlowButton({ children, className, onClick, disabled = false, type = "button" }: GlowButtonProps) {
  return (
    <div className="relative inline-block">
      <GlowEffect colors={["#0CF2A0", "#57DCC5", "#0CF2A0"]} mode="colorShift" blur="soft" duration={3} scale={1.2} />
      <motion.button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className={cn(
          "relative z-10 px-6 py-3 rounded-md text-[#111111] font-semibold",
          "bg-[#0CF2A0] shadow-lg",
          "transition-all duration-200",
          disabled && "opacity-70 cursor-not-allowed",
          className,
        )}
        whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {children}
      </motion.button>
    </div>
  )
}
