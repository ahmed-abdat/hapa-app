"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  variant?: "main" | "subsection";
  alignment?: "left" | "center" | "right";
  showGradient?: boolean;
  gradientSize?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  variant = "main",
  alignment = "center",
  showGradient = true,
  gradientSize = "md",
  className,
  animate = true,
  headingLevel = 2,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const gradientSizes = {
    sm: "w-16 h-1",
    md: "w-24 h-1.5",
    lg: "w-32 h-2",
  };

  const titleSizes = {
    main: "text-4xl md:text-5xl lg:text-6xl",
    subsection: "text-3xl md:text-4xl",
  };

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 40 } : undefined}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      transition={shouldAnimate ? { duration: 0.8 } : undefined}
      viewport={shouldAnimate ? { once: true, margin: "-100px" } : undefined}
      className={cn(
        variant === "main" ? "header-spacing" : "mb-12",
        alignmentClasses[alignment],
        className
      )}
    >
      {subtitle && (
        <motion.p
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={shouldAnimate ? { duration: 0.6, delay: 0.1 } : undefined}
          viewport={shouldAnimate ? { once: true } : undefined}
          className="text-primary font-semibold text-sm md:text-base uppercase tracking-wider mb-3"
        >
          {subtitle}
        </motion.p>
      )}

      {React.createElement(
        `h${headingLevel}` as keyof JSX.IntrinsicElements,
        {
          className: cn(
            titleSizes[variant],
            "font-bold text-gray-900 mb-6",
            variant === "subsection" && "mb-4"
          )
        },
        title
      )}

      {description && (
        <p className={cn(
          "text-lg md:text-xl text-gray-600 leading-relaxed",
          variant === "main" ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto"
        )}>
          {description}
        </p>
      )}

      {showGradient && (
        <motion.div
          initial={shouldAnimate ? { scaleX: 0, opacity: 0 } : undefined}
          whileInView={shouldAnimate ? { scaleX: 1, opacity: 1 } : undefined}
          transition={shouldAnimate ? { duration: 0.6, delay: 0.3 } : undefined}
          viewport={shouldAnimate ? { once: true } : undefined}
          className={cn(
            gradientSizes[gradientSize],
            "bg-gradient-to-r from-primary via-accent to-secondary rounded-full",
            variant === "main" ? "mt-8" : "mt-6",
            alignment === "center" && "mx-auto",
            alignment === "left" && "mr-auto",
            alignment === "right" && "ml-auto"
          )}
        />
      )}
    </motion.div>
  );
};