'use client'

import React, { Component, ReactNode } from 'react'
import { logger } from '@/utilities/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  locale?: 'fr' | 'ar'
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component for graceful error handling
 * Provides localized error messages and optional error reporting
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with structured logging and generate error ID
    const errorId = logger.error('ErrorBoundary caught component error', error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      metadata: {
        componentStack: errorInfo.componentStack,
        locale: this.props.locale,
        hasCustomFallback: !!this.props.fallback
      }
    })
    
    // Store error ID for user support
    if (typeof window !== 'undefined') {
      ;(window as any).__hapa_error_id = errorId
    }
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const locale = this.props.locale || 'fr'

      // Simple translations without next-intl dependency
      const translations = {
        fr: {
          title: 'Une erreur s\'est produite',
          message: 'Nous nous excusons pour ce problème technique. Veuillez réessayer.',
          retry: 'Réessayer'
        },
        ar: {
          title: 'حدث خطأ',
          message: 'نعتذر عن هذه المشكلة التقنية. يرجى المحاولة مرة أخرى.',
          retry: 'المحاولة مرة أخرى'
        }
      }

      const t = translations[locale]

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {t.message}
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-[#138B3A] text-white px-6 py-2 rounded-lg hover:bg-[#0F7A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#138B3A] focus:ring-offset-2"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Async error boundary for handling errors in async components
 */
export function AsyncErrorBoundary({ 
  children, 
  locale = 'fr' 
}: { 
  children: ReactNode
  locale?: 'fr' | 'ar'
}) {
  const loadingText = locale === 'ar' ? 'جاري التحميل...' : 'Chargement...'

  return (
    <ErrorBoundary 
      locale={locale}
      fallback={
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#138B3A] mx-auto mb-4"></div>
            <p className="text-gray-600">
              {loadingText}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}