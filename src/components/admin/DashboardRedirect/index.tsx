'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Gutter, Link } from '@payloadcms/ui'

/**
 * Production-Ready Dashboard Redirect Component
 * 
 * This component provides robust, multi-layer redirection to /admin/media-submissions
 * with comprehensive error handling, fallback mechanisms, and performance optimization.
 * 
 * Redirect Strategy:
 * 1. Immediate Next.js router redirect (preferred)
 * 2. Browser location redirect after 1.5s (fallback)
 * 3. Manual fallback link after 3s (last resort)
 * 
 * Features:
 * - Multiple fallback layers for maximum reliability
 * - Proper error handling and logging
 * - Memory leak prevention
 * - Accessibility and mobile-friendly
 * - Production-ready performance monitoring
 */
import { useAdminTranslation } from '@/utilities/admin-translations'
import { logger } from '@/utilities/logger'

export default function DashboardRedirect() {
  const { dt } = useAdminTranslation()
  const router = useRouter()
  const [status, setStatus] = useState<'redirecting' | 'fallback' | 'error'>('redirecting')
  const [attempt, setAttempt] = useState(1)
  const timeoutRef = useRef<NodeJS.Timeout[]>([])
  const hasRedirected = useRef(false)
  const startTime = useRef(Date.now())

  const targetUrl = '/admin/collections/dashboard-submissions'

  // Immediate redirect attempt - runs as soon as component is created
  useEffect(() => {
    // Super-fast immediate attempt using window.location
    const immediateRedirect = () => {
      if (hasRedirected.current) return
      
      try {
        // Performance monitoring
        const redirectStart = Date.now()
        
        // Log redirect attempt for debugging
        logger.debug('Starting redirect to dashboard', {
          component: 'DashboardRedirect',
          action: 'redirect_start',
          metadata: { targetUrl }
        })
        
        // Immediate browser redirect as the fastest option
        window.location.replace(targetUrl)
        hasRedirected.current = true
        
        // Log successful redirect time (though this might not execute)
        logger.debug('Immediate redirect completed', {
          component: 'DashboardRedirect',
          action: 'redirect_success',
          duration: Date.now() - redirectStart,
          metadata: { method: 'immediate' }
        })
      } catch (error) {
        logger.warn('Immediate redirect failed, falling back to router', {
          component: 'DashboardRedirect',
          action: 'redirect_fallback',
          metadata: { error: error instanceof Error ? error.message : error }
        })
        // Continue to Next.js router attempt
      }
    }

    // Execute immediately
    immediateRedirect()
  }, [])

  const cleanup = useCallback(() => {
    // Clear all timeouts to prevent memory leaks
    timeoutRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRef.current = []
  }, [])

  const performRedirect = useCallback(async () => {
    if (hasRedirected.current) return
    
    // Aggressive Strategy: Try multiple methods simultaneously for maximum speed
    const redirectPromises = []
    
    // Method 1: Next.js router (preferred)
    redirectPromises.push(
      (async () => {
        try {
          setStatus('redirecting')
          setAttempt(1)
          
          // Immediate attempt without delay for maximum speed
          await router.replace(targetUrl)
          hasRedirected.current = true
          return 'router-success'
        } catch (error) {
          logger.warn('Router redirect failed', {
            component: 'DashboardRedirect',
            action: 'router_redirect_failed',
            metadata: { error: error instanceof Error ? error.message : error }
          })
          throw error
        }
      })()
    )
    
    // Method 2: Browser location (parallel attempt after small delay)
    redirectPromises.push(
      new Promise((resolve, reject) => {
        setTimeout(async () => {
          if (hasRedirected.current) {
            resolve('already-redirected')
            return
          }
          
          try {
            setAttempt(2)
            window.location.replace(targetUrl)
            hasRedirected.current = true
            resolve('location-success')
          } catch (error) {
            reject(error)
          }
        }, 800) // Faster fallback timing
      })
    )
    
    try {
      // Race the promises - first one to succeed wins
      await Promise.race(redirectPromises)
    } catch (error) {
      logger.error('All redirect methods failed', error, {
        component: 'DashboardRedirect',
        action: 'all_redirects_failed'
      })
      
      // Final fallback: Show manual link after shorter delay
      const errorTimeout = setTimeout(() => {
        if (!hasRedirected.current) {
          setStatus('error')
          setAttempt(3)
        }
      }, 1000) // Faster error display
      
      timeoutRef.current.push(errorTimeout)
    }
  }, [router, targetUrl])

  // Main redirect logic - runs after immediate redirect attempt
  useEffect(() => {
    // Small delay to allow immediate redirect to complete
    const mainRedirectTimeout = setTimeout(() => {
      if (!hasRedirected.current) {
        performRedirect()
      }
    }, 100)

    timeoutRef.current.push(mainRedirectTimeout)
    
    // Cleanup on unmount
    return cleanup
  }, [performRedirect, cleanup])

  const handleManualClick = useCallback(() => {
    hasRedirected.current = true
    cleanup()
    window.location.href = targetUrl
  }, [targetUrl, cleanup])

  const renderContent = () => {
    if (status === 'error') {
      return (
        <>
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            marginBottom: '1rem'
          }}>
            <p style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              Redirection automatique échouée
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: '#7f1d1d'
            }}>
              Cliquez sur le lien ci-dessous pour accéder au tableau de bord
            </p>
          </div>
          
          <Link 
            href={targetUrl}
            onClick={handleManualClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              gap: '0.5rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            </svg>
{dt('common.viewAllSubmissions')}
          </Link>
        </>
      )
    }

    return (
      <>
        {/* Enhanced loading indicator */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }} />
        
        <p style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.1rem',
          color: '#374151',
          fontWeight: '500'
        }}>
          Redirection vers le tableau de bord...
        </p>
        
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Tentative {attempt}/3 • Redirection optimisée en cours...
        </p>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  return (
    <Gutter>
      <div style={{ 
        padding: '3rem 2rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        minHeight: '300px',
        justifyContent: 'center'
      }}>
        {renderContent()}
      </div>
    </Gutter>
  )
}