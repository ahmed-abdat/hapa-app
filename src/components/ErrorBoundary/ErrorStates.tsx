'use client'

import React from 'react'

interface ErrorStateProps {
  type?: 'network' | 'not-found' | 'permission' | 'generic'
  locale?: 'fr' | 'ar'
  onRetry?: () => void
  onGoHome?: () => void
}

const translations = {
  fr: {
    network: {
      title: 'Connexion perdue',
      message: 'Vérifiez votre connexion internet.',
      action: 'Réessayer'
    },
    notFound: {
      title: 'Page introuvable',
      message: 'Cette page n\'existe pas.',
      action: 'Retour à l\'accueil'
    },
    permission: {
      title: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions nécessaires.',
      action: 'Retour à l\'accueil'
    },
    generic: {
      title: 'Une erreur s\'est produite',
      message: 'Nous travaillons à résoudre ce problème.',
      action: 'Réessayer'
    }
  },
  ar: {
    network: {
      title: 'انقطاع الاتصال',
      message: 'تحقق من اتصالك بالإنترنت.',
      action: 'إعادة المحاولة'
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      message: 'هذه الصفحة غير موجودة.',
      action: 'العودة للرئيسية'
    },
    permission: {
      title: 'ممنوع الوصول',
      message: 'ليس لديك الصلاحيات المطلوبة.',
      action: 'العودة للرئيسية'
    },
    generic: {
      title: 'حدث خطأ',
      message: 'نعمل على حل هذه المشكلة.',
      action: 'إعادة المحاولة'
    }
  }
}

const getIcon = (type: ErrorStateProps['type']) => {
  const iconClass = "w-8 h-8"
  
  switch (type) {
    case 'network':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      )
    case 'not-found':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    case 'permission':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )
  }
}

export function ErrorState({ 
  type = 'generic', 
  locale = 'fr', 
  onRetry, 
  onGoHome 
}: ErrorStateProps) {
  const t = translations[locale]
  const errorContent = t[type]
  const isRTL = locale === 'ar'

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="text-center max-w-sm">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
          <div className="text-gray-400">
            {getIcon(type)}
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          {errorContent.title}
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          {errorContent.message}
        </p>
        
        {/* Action */}
        {(type === 'network' || type === 'generic') && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#138B3A] text-white rounded-lg text-sm font-medium hover:bg-[#0F7A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#138B3A] focus:ring-offset-2"
          >
            {errorContent.action}
          </button>
        )}
        
        {(type === 'not-found' || type === 'permission') && onGoHome && (
          <button
            onClick={onGoHome}
            className="px-6 py-2 bg-[#138B3A] text-white rounded-lg text-sm font-medium hover:bg-[#0F7A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#138B3A] focus:ring-offset-2"
          >
            {errorContent.action}
          </button>
        )}
      </div>
    </div>
  )
}