'use client'

import React, { ReactNode } from 'react'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { FormTranslations } from '../types'

interface BaseFormProps {
  children: ReactNode
  methods: UseFormReturn<any>
  onSubmit: (data: any) => void
  translations: FormTranslations
  locale: 'fr' | 'ar'
  isLoading?: boolean
  className?: string
}

export function BaseForm({
  children,
  methods,
  onSubmit,
  translations,
  locale,
  isLoading = false,
  className = ''
}: BaseFormProps) {
  const config = translations[locale] || translations['fr'] // Fallback to French if locale not found

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Form Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {config.title}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {children}
          
          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  {locale === 'fr' ? 'Envoi en cours...' : 'جاري الإرسال...'}
                </div>
              ) : (
                config.submitButtonText
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}