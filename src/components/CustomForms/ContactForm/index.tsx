'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, ContactFormData } from '../schemas'
import { FormTranslations, FormSubmissionResponse } from '../types'
import { BaseForm } from '../BaseForm'
import { FormInput, FormTextarea } from '../FormFields'

const translations: FormTranslations = {
  fr: {
    title: 'Formulaire de Contact',
    description: 'Contactez-nous pour toute question ou demande d\'information concernant les services de HAPA.',
    submitButtonText: 'Envoyer le message',
    successMessage: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    errorMessage: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
  },
  ar: {
    title: 'نموذج الاتصال',
    description: 'اتصل بنا لأي سؤال أو طلب معلومات حول خدمات هابا.',
    submitButtonText: 'إرسال الرسالة',
    successMessage: 'تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.',
    errorMessage: 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.'
  }
}

interface ContactFormProps {
  locale: 'fr' | 'ar'
  onSuccess?: (response: FormSubmissionResponse) => void
  onError?: (error: string) => void
}

export function ContactForm({ locale, onSuccess, onError }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
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

      const response = await fetch('/api/custom-forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: FormSubmissionResponse = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        methods.reset()
        onSuccess?.(result)
      } else {
        setSubmitStatus('error')
        onError?.(result.message)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      onError?.(translations[locale].errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <BaseForm
        methods={methods}
        onSubmit={handleSubmit}
        translations={translations}
        locale={locale}
        isLoading={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="name"
            label={locale === 'fr' ? 'Nom complet' : 'الاسم الكامل'}
            placeholder={locale === 'fr' ? 'Votre nom complet' : 'اسمك الكامل'}
            required
          />
          
          <FormInput
            name="email"
            type="email"
            label={locale === 'fr' ? 'Adresse email' : 'عنوان البريد الإلكتروني'}
            placeholder={locale === 'fr' ? 'votre@email.com' : 'your@email.com'}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="phone"
            type="tel"
            label={locale === 'fr' ? 'Numéro de téléphone' : 'رقم الهاتف'}
            placeholder={locale === 'fr' ? '+222 XX XX XX XX' : '+222 XX XX XX XX'}
          />
          
          <FormInput
            name="subject"
            label={locale === 'fr' ? 'Sujet' : 'الموضوع'}
            placeholder={locale === 'fr' ? 'Sujet de votre message' : 'موضوع رسالتك'}
            required
          />
        </div>

        <FormTextarea
          name="message"
          label={locale === 'fr' ? 'Message' : 'الرسالة'}
          placeholder={locale === 'fr' ? 'Décrivez votre demande en détail...' : 'اصف طلبك بالتفصيل...'}
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
                {translations[locale].successMessage}
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
                {translations[locale].errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}