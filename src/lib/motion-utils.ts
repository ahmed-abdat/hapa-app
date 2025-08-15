/**
 * Unified Motion Utilities for HAPA Website
 * 
 * Provides consistent motion handling across:
 * - Frontend components (with Tailwind)
 * - Admin components (without Tailwind)
 * - Framer Motion components
 * - Legacy components
 * 
 * Design Principle: One system, all contexts
 */

import { useEffect, useState } from 'react'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

// ========================
// HOOKS
// ========================

/**
 * Universal hook for detecting reduced motion preference
 * Works in all contexts (frontend, admin, legacy)
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Framer Motion-specific hook
 * Uses Framer's built-in detection for better performance
 */
export function useFramerMotionSafe() {
  const shouldReduceMotion = useFramerReducedMotion()
  
  return {
    shouldReduceMotion,
    variants: getFramerVariants(shouldReduceMotion),
    animate: shouldReduceMotion ? false : true,
    transition: shouldReduceMotion 
      ? { duration: 0.01 } 
      : { duration: 0.3, ease: 'easeInOut' }
  }
}

// ========================
// TAILWIND UTILITIES
// ========================

/**
 * Tailwind CSS classes that respect motion preferences
 * Use these for frontend components
 */
export const motionClasses = {
  // Animations
  fadeIn: 'motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none',
  slideIn: 'motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-reduce:animate-none',
  scaleIn: 'motion-safe:animate-in motion-safe:zoom-in-95 motion-reduce:animate-none',
  
  // Loading states
  pulse: 'motion-safe:animate-pulse motion-reduce:animate-none',
  spin: 'motion-safe:animate-spin motion-reduce:animate-none',
  bounce: 'motion-safe:animate-bounce motion-reduce:animate-none',
  ping: 'motion-safe:animate-ping motion-reduce:animate-none',
  
  // Transitions
  transition: 'motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none',
  transform: 'motion-safe:transform motion-safe:transition-transform motion-reduce:transform-none',
  
  // Hover effects
  hoverScale: 'motion-safe:hover:scale-105 motion-reduce:hover:scale-100',
  hoverLift: 'motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0',
  hoverGlow: 'motion-safe:hover:shadow-lg motion-reduce:hover:shadow-none',
  
  // Interactive states
  buttonPress: 'motion-safe:active:scale-95 motion-reduce:active:scale-100',
  cardHover: 'motion-safe:hover:scale-[1.02] motion-reduce:hover:scale-100',
  
  // Layout animations
  slideInLeft: 'motion-safe:animate-in motion-safe:slide-in-from-left-4 motion-reduce:animate-none',
  slideInRight: 'motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-reduce:animate-none',
  slideInTop: 'motion-safe:animate-in motion-safe:slide-in-from-top-4 motion-reduce:animate-none',
  slideInBottom: 'motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-reduce:animate-none',
} as const

/**
 * Get motion class by name with type safety
 */
export function getMotionClass(animation: keyof typeof motionClasses): string {
  return motionClasses[animation]
}

// ========================
// FRAMER MOTION VARIANTS
// ========================

/**
 * Framer Motion variants that respect motion preferences
 */
export function getFramerVariants(shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 }
    }
  }

  return {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { 
      duration: 0.3,
      ease: [0.04, 0.62, 0.23, 0.98]
    }
  }
}

/**
 * Common Framer Motion variants for different contexts
 */
export const framerVariants = {
  modal: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  slide: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }
}

// ========================
// ADMIN COMPONENT UTILITIES
// ========================

/**
 * CSS-in-JS styles for admin components (no Tailwind)
 * Returns style objects based on motion preference
 */
export function getAdminMotionStyles(prefersReducedMotion: boolean) {
  const baseTransition = prefersReducedMotion ? 'none' : 'all 0.3s ease'
  const fastTransition = prefersReducedMotion ? 'none' : 'all 0.15s ease'
  
  return {
    // Basic transitions
    transition: { transition: baseTransition },
    fastTransition: { transition: fastTransition },
    
    // Hover effects
    hoverScale: {
      transition: baseTransition,
      ':hover': {
        transform: prefersReducedMotion ? 'none' : 'scale(1.05)'
      }
    },
    
    // Button styles
    button: {
      transition: baseTransition,
      ':hover': {
        transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
        boxShadow: prefersReducedMotion ? 'none' : '0 4px 8px rgba(0,0,0,0.1)'
      },
      ':active': {
        transform: prefersReducedMotion ? 'none' : 'translateY(0px)'
      }
    },
    
    // Card animations
    card: {
      transition: baseTransition,
      ':hover': {
        transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
        boxShadow: prefersReducedMotion ? 'none' : '0 8px 16px rgba(0,0,0,0.1)'
      }
    },
    
    // Loading spinner
    spinner: {
      animation: prefersReducedMotion ? 'none' : 'spin 1s linear infinite'
    },
    
    // Pulse effect
    pulse: {
      animation: prefersReducedMotion ? 'none' : 'pulse 2s infinite'
    }
  }
}

// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Conditionally apply animation based on motion preference
 */
export function conditionalAnimation<T>(
  shouldReduceMotion: boolean,
  reducedAnimation: T,
  fullAnimation: T
): T {
  return shouldReduceMotion ? reducedAnimation : fullAnimation
}

/**
 * Create motion-aware CSS classes
 */
export function createMotionClass(
  baseClass: string,
  motionClass: string,
  prefersReducedMotion?: boolean
): string {
  if (prefersReducedMotion === true) {
    return baseClass
  }
  if (prefersReducedMotion === false) {
    return `${baseClass} ${motionClass}`
  }
  // Use CSS media queries for automatic detection
  return `${baseClass} motion-safe:${motionClass} motion-reduce:${baseClass}`
}

/**
 * Animation timing functions that respect motion preferences
 */
export const motionTimings = {
  instant: { duration: 0.01 },
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  
  // Easing functions
  easeInOut: [0.04, 0.62, 0.23, 0.98],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
} as const

/**
 * Get timing based on motion preference
 */
export function getMotionTiming(
  timing: keyof typeof motionTimings,
  prefersReducedMotion: boolean
) {
  if (prefersReducedMotion) {
    return motionTimings.instant
  }
  return motionTimings[timing]
}

// ========================
// CONSTANTS
// ========================

/**
 * Standard motion configuration
 */
export const MOTION_CONFIG = {
  // Duration in milliseconds
  DURATION: {
    INSTANT: 1,
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Animation delays
  DELAY: {
    NONE: 0,
    SHORT: 50,
    MEDIUM: 100,
    LONG: 200
  },
  
  // Stagger delays for lists
  STAGGER: {
    FAST: 0.05,
    NORMAL: 0.1,
    SLOW: 0.2
  }
} as const