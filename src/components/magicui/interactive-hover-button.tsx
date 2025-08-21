"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  className?: string
  children?: React.ReactNode
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Button", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative min-w-[8rem] cursor-pointer overflow-hidden rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-sm px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:scale-[1.02] shadow-lg",
          className,
        )}
        {...props}
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
          {children || text}
        </span>
        <div className="absolute inset-0 z-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 z-0 rounded-full bg-white/10 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute -inset-1 z-0 rounded-full bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-80" />
      </button>
    )
  }
)

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }