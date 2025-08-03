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
  FormRadioGroup,
  TVChannelCombobox,
  RadioStationCombobox,
  FormDateTimePicker,
  FormFileUpload
} from '../FormFields'
import { 
  createMediaContentReportSchema, 
  type MediaContentReportFormData,
  type MediaContentReportSubmission 
} from '@/lib/validations/media-forms'
import { type Locale } from '@/utilities/locale'
import { convertToFormData } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'
import { FormSubmissionProgress } from '@/components/CustomForms/FormSubmissionProgress'

interface MediaContentReportFormProps {
  className?: string
}

export function MediaContentReportForm({ className }: MediaContentReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>()
  const [submissionProgress, setSubmissionProgress] = useState(0)
  const [submissionStage, setSubmissionStage] = useState<'preparing' | 'uploading' | 'validating' | 'saving' | 'complete' | 'error'>('preparing')
  const [submissionError, setSubmissionError] = useState<string>()
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as Locale) || 'fr'
  const t = useTranslations()

  const methods = useForm<MediaContentReportFormData>({
    resolver: zodResolver(createMediaContentReportSchema(t)),
    defaultValues: {
      // Content Information
      mediaType: '',
      mediaTypeOther: '',
      tvChannel: '',
      tvChannelOther: '',
      radioStation: '',
      radioStationOther: '',
      programName: '',
      broadcastDateTime: '',
      linkScreenshot: '',
      screenshotFiles: [],
      // Report Reasons
      reasons: [],
      reasonOther: '',
      // Content Description
      description: '',
      // Attachments
      attachmentTypes: [],
      attachmentOther: '',
      attachmentFiles: [],
    },
  })

  const { watch, trigger, formState } = methods
  const selectedMediaType = watch('mediaType')
  const selectedTvChannel = watch('tvChannel')
  const selectedRadioStation = watch('radioStation')
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
      successMessage: t('submissionSuccess', { type: t('reportForm') }),
      errorMessage: t('submissionError'),
    },
    ar: {
      title: t('mediaContentReportTitle'),
      description: t('mediaContentReportDesc'),
      submitButtonText: t('submitReport'),
      successMessage: t('submissionSuccess', { type: t('reportForm') }),
      errorMessage: t('submissionError'),
    },
  }


  const onSubmit = async (data: MediaContentReportFormData) => {
    // Log form submission data for debugging
    logger.form.submission('MediaContentReport', {
      component: 'MediaContentReportForm',
      metadata: {
        screenshotFilesType: typeof data.screenshotFiles,
        screenshotFilesLength: Array.isArray(data.screenshotFiles) ? data.screenshotFiles.length : 0,
        attachmentFilesType: typeof data.attachmentFiles,
        attachmentFilesLength: Array.isArray(data.attachmentFiles) ? data.attachmentFiles.length : 0,
        hasScreenshots: Array.isArray(data.screenshotFiles) && data.screenshotFiles.length > 0,
        hasAttachments: Array.isArray(data.attachmentFiles) && data.attachmentFiles.length > 0
      }
    })
    
    logger.formSubmission('Report', data)
    setIsSubmitting(true)
    setSubmissionStage('preparing')
    setSubmissionProgress(0)
    setSubmissionError(undefined)
    
    try {
      // Stage 1: Prepare submission data
      setSubmissionStage('preparing')
      setSubmissionProgress(10)
      
      const submissionData = {
        ...data,
        formType: 'report',
        submittedAt: new Date().toISOString(),
        locale,
      }

      logger.log('📦 Converting to FormData...')
      const formData = convertToFormData(submissionData)
      setSubmissionProgress(20)

      // Stage 2: Upload files and submit
      setSubmissionStage('uploading')
      setSubmissionProgress(30)

      logger.log('🚀 Submitting form with files...')
      const response = await fetch('/api/media-forms/submit-with-files', {
        method: 'POST',
        body: formData, // No Content-Type header - let browser set it with boundary
      })
      
      // Stage 3: Validate response
      setSubmissionStage('validating')
      setSubmissionProgress(70)

      const result = await response.json()
      logger.apiResponse(response.status, result)

      if (result.success) {
        // Stage 4: Save to database
        setSubmissionStage('saving')
        setSubmissionProgress(90)
        
        logger.success('Form submitted successfully', result.submissionId)
        
        // Stage 5: Complete
        setSubmissionStage('complete')
        setSubmissionProgress(100)
        
        // Small delay to show completion state
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setSubmissionId(result.submissionId || 'success')
        setIsSubmitted(true)
      } else {
        // Error handling with progress feedback
        setSubmissionStage('error')
        setSubmissionProgress(100)
        
        let errorMessage = result.message || t('submissionError')
        
        if (result.details && Array.isArray(result.details)) {
          // File upload specific errors
          logger.error('❌ File upload errors detected:', result.details)
          errorMessage = `${result.message}\n\nDétails des erreurs:\n${result.details.join('\n')}`
          setSubmissionError(errorMessage)
          
          toast.error(errorMessage, {
            duration: 10000, // Longer duration for file errors
          })
        } else if (result.uploadStats) {
          // Upload statistics available
          logger.error('❌ Upload statistics:', result.uploadStats)
          const statsMessage = `${result.message}\n\nStatistiques: ${result.uploadStats.successful}/${result.uploadStats.expected} fichiers téléchargés avec succès`
          setSubmissionError(statsMessage)
          
          toast.error(statsMessage, {
            duration: 8000,
          })
        } else {
          // Generic error
          setSubmissionError(errorMessage)
          toast.error(errorMessage)
        }
        
        // Keep error state visible for 3 seconds before hiding progress
        setTimeout(() => {
          setIsSubmitting(false)
        }, 3000)
        
        throw new Error(result.message || 'Submission failed')
      }
    } catch (error) {
      logger.error('❌ Form submission error:', error)
      
      setSubmissionStage('error')
      setSubmissionProgress(100)
      
      const errorMessage = error instanceof Error ? error.message : t('submissionError')
      setSubmissionError(errorMessage)
      
      // Only show generic error if we haven't already shown a specific one
      if (error instanceof Error && !error.message.includes('File upload failed')) {
        toast.error(t('submissionError'))
      }
      
      // Keep error state visible for 3 seconds before hiding progress
      setTimeout(() => {
        setIsSubmitting(false)
      }, 3000)
    }
  }

  // Show thank you card if form was submitted successfully
  if (isSubmitted) {
    return (
      <div className={className}>
        <ThankYouCard 
          locale={locale}
          formType="report"
          submissionId={submissionId}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Debug: Show validation errors */}
      {Object.keys(formState.errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">🐛 Validation Errors (Debug):</h4>
          <div className="text-sm text-red-700 space-y-1">
            {Object.entries(formState.errors).map(([field, error]) => (
              <div key={field} className="border-l-2 border-red-300 pl-2">
                <strong>{field}:</strong> {error?.message || 'Invalid value'}
              </div>
            ))}
          </div>
        </div>
      )}

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
          />

          {selectedMediaType === 'other' && (
            <FormInput
              name="mediaTypeOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}

          {selectedMediaType === 'television' && (
            <>
              <TVChannelCombobox
                name="tvChannel"
                label={t('tvChannel')}
                locale={locale}
                required
              />
              {selectedTvChannel === 'other' && (
                <FormInput
                  name="tvChannelOther"
                  label={t('specifyOther')}
                  placeholder={t('specifyOther')}
                  required
                />
              )}
            </>
          )}

          {selectedMediaType === 'radio' && (
            <>
              <RadioStationCombobox
                name="radioStation"
                label={t('radioStation')}
                locale={locale}
                required
              />
              {selectedRadioStation === 'other' && (
                <FormInput
                  name="radioStationOther"
                  label={t('specifyOther')}
                  placeholder={t('specifyOther')}
                  required
                />
              )}
            </>
          )}

          <FormInput
            name="programName"
            label={t('programName')}
            placeholder=""
            required
          />

          <FormDateTimePicker
            name="broadcastDateTime"
            label={t('broadcastDateTime')}
            locale={locale}
            required
          />

          <FormTextarea
            name="linkScreenshot"
            label={t('linkScreenshot')}
            placeholder={t('linkScreenshotPlaceholder')}
            className="min-h-20"
          />

          <FormFileUpload
            name="screenshotFiles"
            label={t('screenshotFiles')}
            accept="image/*,.pdf"
            maxSize={5}
            multiple
            locale={locale}
          />
        </div>

        {/* Section 3: Report Reason */}
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

        {/* Section 4: Content Description */}
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

        {/* Section 5: Attachments (Optional) */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('attachments')}
            </h3>
          </div>

          <FormCheckboxGroup
            name="attachmentTypes"
            label=""
            options={attachmentOptions}
          />

          {selectedAttachments?.includes('other') && (
            <FormInput
              name="attachmentOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}

          {selectedAttachments && selectedAttachments.length > 0 && (
            <FormFileUpload
              name="attachmentFiles"
              label={t('attachmentFiles')}
              accept="image/*,.pdf,.doc,.docx,.txt,.mp3,.wav,.mp4,.mov"
              maxSize={10}
              multiple
              locale={locale}
            />
          )}
        </div>

      </BaseForm>

      {/* Progress Modal */}
      <FormSubmissionProgress
        isVisible={isSubmitting}
        stage={submissionStage}
        progress={submissionProgress}
        errorMessage={submissionError}
        locale={locale}
      />
    </div>
  )
}