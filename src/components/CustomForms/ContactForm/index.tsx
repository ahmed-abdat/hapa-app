'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { createContactFormSchema, ContactFormData } from '../schemas'
import { FormTranslations, FormSubmissionResponse } from '../types'
import { BaseForm } from '../BaseForm'
import { FormInput, FormTextarea } from '../FormFields'
import { type Locale } from '@/utilities/locale'
import { submitContactForm } from '@/app/actions/contact-form'


interface ContactFormProps {
  locale: 'fr' | 'ar'
  onSuccess?: (response: FormSubmissionResponse) => void
  onError?: (error: string) => void
}

export function ContactForm({ locale, onSuccess, onError }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const t = useTranslations()

  const methods = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(locale)),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      locale,
      formType: 'contact'
    }
  })

  const handleSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true)
      setSubmitStatus('idle')

      const result = await submitContactForm(data)

      if (result.success) {
        setSubmitStatus('success')
        methods.reset()
        onSuccess?.(result)
      } else {
        setSubmitStatus('error')
        onError?.(result.message)
      }
    } catch (_error) {
      // Form submission error - handled via error callback
      setSubmitStatus('error')
      onError?.(t('submissionError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <BaseForm
        methods={methods}
        onSubmit={handleSubmit}
        translations={{
          fr: {
            title: t('contactFormTitle'),
            description: t('contactFormDesc'),
            submitButtonText: t('sendMessage'),
            successMessage: t('contactFormSuccess'),
            errorMessage: t('submissionError')
          },
          ar: {
            title: t('contactFormTitle'),
            description: t('contactFormDesc'),
            submitButtonText: t('sendMessage'),
            successMessage: t('contactFormSuccess'),
            errorMessage: t('submissionError')
          }
        }}
        locale={locale}
        isLoading={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="name"
            label={t('nameLabel')}
            placeholder={t('namePlaceholder')}
            required
          />
          
          <FormInput
            name="email"
            type="email"
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="phone"
            type="tel"
            label={t('phoneLabel')}
            placeholder={t('phonePlaceholder')}
          />
          
          <FormInput
            name="subject"
            label={t('subjectLabel')}
            placeholder={t('subjectPlaceholder')}
            required
          />
        </div>

        <FormTextarea
          name="message"
          label={t('messageLabel')}
          placeholder={t('messagePlaceholder')}
          rows={6}
          maxLength={2000}
          required
        />
      </BaseForm>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="max-w-2xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="text-green-400">✓</div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                {t('contactFormSuccess')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-400">⚠</div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                {t('submissionError')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}