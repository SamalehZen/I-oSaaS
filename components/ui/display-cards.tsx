"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface DisplayCardProps {
  className?: string
  icon?: React.ReactNode
  title?: string
  description?: string
  date?: string
  iconClassName?: string
  titleClassName?: string
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-[#0CF2A0]" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-[#0CF2A0]",
  titleClassName = "text-[#0CF2A0]",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-gray-800/50 bg-[#1a1a1a]/80 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-[#111111] after:to-transparent after:content-[''] hover:border-[#0CF2A0]/30 hover:bg-[#1a1a1a] [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className,
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-[#111111] p-1.5">{icon}</span>
        <p className={cn("text-lg font-medium text-white", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg text-gray-300">{description}</p>
      <p className="text-gray-500">{date}</p>
    </div>
  )
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[]
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-800/50 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#111111]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-800/50 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#111111]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ]

  const displayCards = cards || defaultCards

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  )
}
