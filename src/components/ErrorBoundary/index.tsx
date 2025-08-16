'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { logger } from '@/utilities/logger'

interface Props {
  children: ReactNode
  locale?: 'fr' | 'ar'
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Modern Error Boundary with clean UX
 * Simplified, user-friendly error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Simple error logging
    const errorId = logger.error('Component error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      locale: this.props.locale
    })
    
    // Store error ID for support
    if (typeof window !== 'undefined') {
      ;(window as any).__hapa_error_id = errorId
    }
    
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const locale = this.props.locale || 'fr'
      const isRTL = locale === 'ar'

      // Simple, empathetic translations
      const t = locale === 'ar' ? {
        title: 'حدث خطأ',
        message: 'نعتذر، حدث خطأ مؤقت. سنقوم بحل هذا بسرعة.',
        retry: 'إعادة المحاولة',
        reload: 'تحديث الصفحة'
      } : {
        title: 'Oups, une erreur',
        message: 'Désolé, une erreur temporaire s\'est produite. Nous allons résoudre cela rapidement.',
        retry: 'Réessayer',
        reload: 'Actualiser'
      }

      return (
        <div className={`min-h-[400px] flex items-center justify-center p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="text-center max-w-md">
            {/* Simple warning icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-orange-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                />
              </svg>
            </div>
            
            {/* Clean typography */}
            <h2 className="text-xl font-medium text-gray-900 mb-3">
              {t.title}
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {t.message}
            </p>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-[#138B3A] text-white rounded-lg text-sm font-medium hover:bg-[#0F7A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#138B3A] focus:ring-offset-2"
              >
                {t.retry}
              </button>
              
              <button
                onClick={this.handleReload}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t.reload}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple HOC wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

/**
 * Async loading wrapper with error boundary
 */
export function AsyncWrapper({ 
  children, 
  locale = 'fr' 
}: { 
  children: ReactNode
  locale?: 'fr' | 'ar'
}) {
  const loadingText = locale === 'ar' ? 'جاري التحميل...' : 'Chargement...'

  return (
    <ErrorBoundary locale={locale}>
      <React.Suspense 
        fallback={
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#138B3A] mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">{loadingText}</p>
            </div>
          </div>
        }
      >
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}