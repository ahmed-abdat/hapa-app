'use client'

import React, { ReactNode } from 'react'
import { FormProvider, UseFormReturn, FieldValues } from 'react-hook-form'
import { FormTranslations } from '../types'

interface BaseFormProps<T extends FieldValues = FieldValues> {
  children: ReactNode
  methods: UseFormReturn<T>
  onSubmit: (data: T) => void
  translations: FormTranslations
  locale: 'fr' | 'ar'
  isLoading?: boolean
  className?: string
}

export function BaseForm<T extends FieldValues = FieldValues>({
  children,
  methods,
  onSubmit,
  translations,
  locale,
  isLoading = false,
  className = ''
}: BaseFormProps<T>) {
  const config = translations[locale] || translations['fr'] // Fallback to French if locale not found

  return (
    <div className={className}>
      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {children}
          
          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-accent disabled:bg-primary/60 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl"
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