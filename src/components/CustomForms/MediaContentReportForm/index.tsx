'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { BaseForm } from '../BaseForm'
import { ThankYouCard } from '../ThankYouCard'
import { 
  FormInput, 
  FormTextarea, 
  FormCheckboxGroup, 
  FormRadioGroup 
} from '../FormFields'
import { 
  mediaContentReportSchema, 
  type MediaContentReportFormData,
  type MediaContentReportSubmission 
} from '@/lib/validations/media-forms'
import { type Locale } from '@/utilities/locale'
import { getLocaleDirection } from '@/utilities/locale'

interface MediaContentReportFormProps {
  className?: string
}

export function MediaContentReportForm({ className }: MediaContentReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>()
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as Locale) || 'fr'
  const direction = getLocaleDirection(locale)
  const t = useTranslations()

  const methods = useForm<MediaContentReportFormData>({
    resolver: zodResolver(mediaContentReportSchema),
    defaultValues: {
      mediaType: undefined,
      mediaTypeOther: '',
      programName: '',
      broadcastDateTime: '',
      linkScreenshot: '',
      reasons: [],
      reasonOther: '',
      description: '',
      attachmentTypes: [],
      attachmentOther: '',
    },
  })

  const { watch } = methods
  const selectedMediaType = watch('mediaType')
  const selectedReasons = watch('reasons')
  const selectedAttachments = watch('attachmentTypes')

  // Form options
  const mediaTypeOptions = [
    { value: 'television', label: t('television') },
    { value: 'radio', label: t('radio') },
    { value: 'website', label: t('website') },
    { value: 'youtube', label: t('youtube') },
    { value: 'facebook', label: t('facebook') },
    { value: 'other', label: t('other') },
  ]

  const reportReasonOptions = [
    { value: 'hateSpeech', label: t('hateSpeech') },
    { value: 'misinformation', label: t('misinformation') },
    { value: 'privacyViolation', label: t('privacyViolation') },
    { value: 'shockingContent', label: t('shockingContent') },
    { value: 'pluralismViolation', label: t('pluralismViolation') },
    { value: 'falseAdvertising', label: t('falseAdvertising') },
    { value: 'other', label: t('otherReason') },
  ]

  const attachmentOptions = [
    { value: 'screenshot', label: t('screenshot') },
    { value: 'videoLink', label: t('videoLink') },
    { value: 'writtenStatement', label: t('writtenStatement') },
    { value: 'audioRecording', label: t('audioRecording') },
    { value: 'other', label: t('other') },
  ]

  const translations = {
    fr: {
      title: t('mediaContentReportTitle'),
      description: t('mediaContentReportDesc'),
      submitButtonText: t('submitReport'),
    },
    ar: {
      title: t('mediaContentReportTitle'),
      description: t('mediaContentReportDesc'),
      submitButtonText: t('submitReport'),
    },
  }

  const onSubmit = async (data: MediaContentReportFormData) => {
    setIsSubmitting(true)
    
    try {
      const submissionData: MediaContentReportSubmission = {
        ...data,
        formType: 'report',
        submittedAt: new Date().toISOString(),
        locale,
      }

      const response = await fetch('/api/media-forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()

      if (result.success) {
        // Show thank you card with submission ID
        setSubmissionId(result.id || 'success')
        setIsSubmitted(true)
      } else {
        throw new Error(result.message || 'Submission failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(t('submissionError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show thank you card if form was submitted successfully
  if (isSubmitted) {
    return (
      <div dir={direction} className={className}>
        <ThankYouCard 
          locale={locale}
          formType="report"
          submissionId={submissionId}
        />
      </div>
    )
  }

  return (
    <div dir={direction} className={className}>
      <BaseForm
        methods={methods}
        onSubmit={onSubmit}
        translations={translations}
        locale={locale}
        isLoading={isSubmitting}
        className="max-w-4xl"
      >
        {/* Section 1: Content Information */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('contentInformation')}
            </h3>
          </div>

          <FormRadioGroup
            name="mediaType"
            label={t('mediaType')}
            options={mediaTypeOptions}
            required
            direction="vertical"
          />

          {selectedMediaType === 'other' && (
            <FormInput
              name="mediaTypeOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}

          <FormInput
            name="programName"
            label={t('programName')}
            placeholder=""
            required
          />

          <FormInput
            name="broadcastDateTime"
            label={t('broadcastDateTime')}
            type="date"
            required
          />

          <FormInput
            name="linkScreenshot"
            label={t('linkScreenshot')}
            placeholder="https://"
            type="text"
          />
        </div>

        {/* Section 2: Report Reason */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('reportReason')}
            </h3>
          </div>

          <FormCheckboxGroup
            name="reasons"
            label={t('reportReason')}
            options={reportReasonOptions}
            required
            direction="vertical"
          />

          {selectedReasons?.includes('other') && (
            <FormInput
              name="reasonOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}
        </div>

        {/* Section 3: Content Description */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('contentDescription')}
            </h3>
          </div>

          <FormTextarea
            name="description"
            label={t('contentDescription')}
            placeholder={t('contentDescriptionPlaceholderReport')}
            required
            className="min-h-32"
          />
        </div>

        {/* Section 4: Attachments (Optional) */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('attachments')}
            </h3>
          </div>

          <FormCheckboxGroup
            name="attachmentTypes"
            label={t('attachments')}
            options={attachmentOptions}
            direction="vertical"
          />

          {selectedAttachments?.includes('other') && (
            <FormInput
              name="attachmentOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}
        </div>
      </BaseForm>
    </div>
  )
}