"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { SVGProps } from "react"

export const Logo = () => (
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

export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
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

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
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

interface NavLinkProps {
  href?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const NavLink = ({ href = "#", children, className = "", onClick }: NavLinkProps) => (
  <motion.a
    href={href}
    onClick={onClick}
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
