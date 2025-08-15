/**
 * Hook to detect if user prefers reduced motion
 * Implements WCAG 2.3.3 compliance for accessibility
 * 
 * NOTE: For most use cases, prefer Tailwind's built-in motion utilities:
 * - `motion-safe:animate-*` - animations that respect motion preferences
 * - `motion-reduce:animate-none` - disable animations when motion is reduced
 * 
 * This hook is useful for:
 * - Complex Framer Motion animations
 * - Conditional rendering based on motion preference
 * - JavaScript-driven animations that can't use Tailwind classes
 */

import { useEffect, useState } from 'react'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Create listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook that uses Framer Motion's built-in reduced motion detection
 * Preferred for Framer Motion components
 */
export function useFramerMotionSafe() {
  const shouldReduceMotion = useFramerReducedMotion()
  
  return {
    shouldReduceMotion,
    variants: getMotionVariants(shouldReduceMotion),
    animate: shouldReduceMotion ? false : true,
    transition: shouldReduceMotion 
      ? { duration: 0.01 } 
      : { duration: 0.3, ease: 'easeInOut' }
  }
}

/**
 * Get Tailwind-compatible CSS classes for motion preferences
 * Returns classes that automatically respect user's motion preferences
 */
export function getMotionClasses() {
  return {
    // Animations that are safe for motion
    fadeIn: 'motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none',
    slideIn: 'motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-reduce:animate-none',
    scaleIn: 'motion-safe:animate-in motion-safe:zoom-in-95 motion-reduce:animate-none',
    
    // Transitions that respect motion preferences
    transition: 'motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none',
    transform: 'motion-safe:transform motion-safe:transition-transform motion-reduce:transform-none',
    
    // Hover effects that respect motion preferences
    hoverScale: 'motion-safe:hover:scale-105 motion-reduce:hover:scale-100',
    hoverLift: 'motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0',
    
    // Loading states
    pulse: 'motion-safe:animate-pulse motion-reduce:animate-none',
    spin: 'motion-safe:animate-spin motion-reduce:animate-none',
    bounce: 'motion-safe:animate-bounce motion-reduce:animate-none',
  }
}

/**
 * Get animation variants based on reduced motion preference
 * For use with Framer Motion when Tailwind classes aren't sufficient
 */
export function getMotionVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 } // Faster, simpler transitions
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
 * Utility function to conditionally apply motion classes
 * Example: cn(getMotionClass('fadeIn'), 'other-classes')
 */
export function getMotionClass(animation: keyof ReturnType<typeof getMotionClasses>): string {
  const classes = getMotionClasses()
  return classes[animation] || ''
}