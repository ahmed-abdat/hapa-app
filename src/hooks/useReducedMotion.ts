'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the user prefers reduced motion
 * Based on WCAG guidelines for accessibility
 */
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
 * Helper function to get animation variants based on reduced motion preference
 */
export function getMotionVariants(
  reducedMotion: boolean,
  fullVariants: any,
  reducedVariants: any = {}
) {
  if (reducedMotion) {
    // Return simplified variants for reduced motion
    return {
      ...fullVariants,
      ...reducedVariants,
      // Ensure transitions are instant or very fast
      transition: { duration: 0.01 }
    }
  }
  return fullVariants
}