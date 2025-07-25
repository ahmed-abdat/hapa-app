'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { complaintFormSchema, ComplaintFormData } from '../schemas'
import { FormTranslations, FormSubmissionResponse } from '../types'
import { BaseForm } from '../BaseForm'
import { FormInput, FormTextarea, FormSelect } from '../FormFields'

const translations: FormTranslations = {
  fr: {
    title: 'Formulaire de Plainte / Réclamation',
    description: 'Déposez une plainte ou une réclamation concernant les services de HAPA. Nous traiterons votre demande dans les plus brefs délais.',
    submitButtonText: 'Soumettre la plainte',
    successMessage: 'Votre plainte a été soumise avec succès. Nous vous répondrons dans les plus brefs délais.',
    errorMessage: 'Une erreur est survenue lors de la soumission de votre plainte. Veuillez réessayer.'
  },
  ar: {
    title: 'نموذج الشكوى / المطالبة',
    description: 'قدم شكوى أو مطالبة بخصوص خدمات الهيئة العليا للصحافة والإعلام. سنعالج طلبك في أقرب وقت ممكن.',
    submitButtonText: 'تقديم الشكوى',
    successMessage: 'تم تقديم شكواك بنجاح. سنرد عليك في أقرب وقت ممكن.',
    errorMessage: 'حدث خطأ أثناء تقديم شكواك. يرجى المحاولة مرة أخرى.'
  }
}

const complaintTypeOptions = {
  fr: [
    { value: 'service', label: 'Problème de service' },
    { value: 'staff', label: 'Comportement du personnel' },
    { value: 'procedure', label: 'Procédure administrative' },
    { value: 'other', label: 'Autre' }
  ],
  ar: [
    { value: 'service', label: 'مشكلة في الخدمة' },
    { value: 'staff', label: 'سلوك الموظفين' },
    { value: 'procedure', label: 'إجراء إداري' },
    { value: 'other', label: 'أخرى' }
  ]
}

interface ComplaintFormProps {
  locale: 'fr' | 'ar'
  onSuccess?: (response: FormSubmissionResponse) => void
  onError?: (error: string) => void
}

export function ComplaintForm({ locale, onSuccess, onError }: ComplaintFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      organization: '',
      complaintType: 'service',
      subject: '',
      description: '',
      dateOfIncident: '',
      locale,
      formType: 'complaint'
    }
  })

  const handleSubmit = async (data: ComplaintFormData) => {
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
    } catch (_error) {
      // Form submission error - handled via error callback
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
            name="organization"
            label={locale === 'fr' ? 'Organisation (optionnel)' : 'المنظمة (اختياري)'}
            placeholder={locale === 'fr' ? 'Nom de votre organisation' : 'اسم منظمتك'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            name="complaintType"
            label={locale === 'fr' ? 'Type de plainte' : 'نوع الشكوى'}
            placeholder={locale === 'fr' ? 'Sélectionnez un type' : 'اختر نوعاً'}
            options={complaintTypeOptions[locale]}
            required
          />
          
          <FormInput
            name="dateOfIncident"
            type="date"
            label={locale === 'fr' ? 'Date de l\'incident (optionnel)' : 'تاريخ الحادثة (اختياري)'}
          />
        </div>

        <FormInput
          name="subject"
          label={locale === 'fr' ? 'Objet de la plainte' : 'موضوع الشكوى'}
          placeholder={locale === 'fr' ? 'Résumé en quelques mots' : 'ملخص في بضع كلمات'}
          required
        />

        <FormTextarea
          name="description"
          label={locale === 'fr' ? 'Description détaillée' : 'وصف مفصل'}
          placeholder={locale === 'fr' ? 'Décrivez votre plainte en détail : ce qui s\'est passé, quand, où, avec qui...' : 'اصف شكواك بالتفصيل: ما حدث، متى، أين، مع من...'}
          rows={8}
          maxLength={3000}
          required
        />
      </BaseForm>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="max-w-2xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="text-green-400">✓</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {locale === 'fr' ? 'Plainte soumise avec succès' : 'تم تقديم الشكوى بنجاح'}
              </h3>
              <p className="text-sm text-green-700 mt-1">
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
              <h3 className="text-sm font-medium text-red-800">
                {locale === 'fr' ? 'Erreur lors de la soumission' : 'خطأ في التقديم'}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {translations[locale].errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}