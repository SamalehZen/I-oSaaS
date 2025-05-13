"use client"

import DisplayCards from "@/components/ui/display-cards"
import { Sparkles } from "lucide-react"

const defaultCards = [
  {
    icon: <Sparkles className="size-4 text-[#0CF2A0]" />,
    title: "Featured",
    description: "Discover amazing content",
    date: "Just now",
    iconClassName: "text-[#0CF2A0]",
    titleClassName: "text-[#0CF2A0]",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-800/50 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#111111]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-[#0CF2A0]" />,
    title: "Popular",
    description: "Trending this week",
    date: "2 days ago",
    iconClassName: "text-[#0CF2A0]",
    titleClassName: "text-[#0CF2A0]",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-800/50 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#111111]/80 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-[#0CF2A0]" />,
    title: "New",
    description: "Latest updates and features",
    date: "Today",
    iconClassName: "text-[#0CF2A0]",
    titleClassName: "text-[#0CF2A0]",
    className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
  },
]

export function DisplayCardsDemo() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center py-20">
      <div className="w-full max-w-3xl">
        <DisplayCards cards={defaultCards} />
      </div>
    </div>
  )
}
