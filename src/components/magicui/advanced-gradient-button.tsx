"use client"

import React from "react"
import { cn } from "@/utilities/ui"

export interface AdvancedGradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children?: React.ReactNode
  gradientColor?: string
  hoverColor?: string
}

const AdvancedGradientButton = React.forwardRef<HTMLButtonElement, AdvancedGradientButtonProps>(
  (
    {
      className,
      children,
      gradientColor = "hsl(var(--accent) / 0.6)", // HAPA accent color with opacity
      _hoverColor = "hsl(var(--accent) / 0.9)",
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "group relative cursor-pointer rounded-full bg-primary/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary border border-white/10",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span 
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(75% 100% at 50% 0%, ${gradientColor} 0%, transparent 75%)`
            }}
          />
        </span>
        <div className="relative z-10 flex items-center space-x-2">
          {children}
        </div>
      </button>
    )
  }
)
AdvancedGradientButton.displayName = "AdvancedGradientButton"

export { AdvancedGradientButton }