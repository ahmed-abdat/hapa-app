'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
  EnhancedFileUploadV3
} from '../FormFields'
import { 
  createMediaContentReportSchema, 
  type MediaContentReportFormData,
  type MediaContentReportSubmission 
} from '@/lib/validations/media-forms'
import { REPORT_REASON_OPTIONS, ATTACHMENT_TYPE_OPTIONS, MEDIA_TYPE_OPTIONS, createFormOptions } from '@/lib/form-options'
import { type Locale } from '@/utilities/locale'
import { convertToFormData, validateFormDataSize, formatFileSize } from '@/lib/file-upload'
import { FormFileUploadService, type FileUploadField } from '@/lib/FormFileUploadService'
import { validateFileProduction } from '@/lib/production-file-validation'
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
      screenshotFiles: [], // Will be managed as File objects by EnhancedFileUploadV3
      // Report Reasons
      reasons: [],
      reasonOther: '',
      // Content Description
      description: '',
      // Attachments
      attachmentTypes: [],
      attachmentOther: '',
      attachmentFiles: [], // Will be managed as File objects by EnhancedFileUploadV3
    },
  })

  const { watch, trigger, formState } = methods
  const selectedMediaType = watch('mediaType')
  const selectedTvChannel = watch('tvChannel')
  const selectedRadioStation = watch('radioStation')
  const selectedReasons = watch('reasons')
  const selectedAttachments = watch('attachmentTypes')

  // Form options using centralized constants for consistency
  const mediaTypeOptions = createFormOptions(MEDIA_TYPE_OPTIONS, t)
  const reportReasonOptions = createFormOptions(REPORT_REASON_OPTIONS, t, { other: 'otherReason' })
  const attachmentOptions = createFormOptions(ATTACHMENT_TYPE_OPTIONS, t)

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
    // Initialize loading state immediately
    setIsSubmitting(true)
    setSubmissionStage('preparing')
    setSubmissionProgress(0)
    setSubmissionError(undefined)

    // PRODUCTION DEBUG: Comprehensive form submission analysis
    const clientSessionId = `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.log('Form submission starting', { sessionId: clientSessionId })
    
    try {
      // File validation for V2 component (URLs instead of File objects)
      const screenshotCount = Array.isArray(data.screenshotFiles) ? data.screenshotFiles.length : 0
      const attachmentCount = Array.isArray(data.attachmentFiles) ? data.attachmentFiles.length : 0
      
      logger.log('File check:', {
        sessionId: clientSessionId,
        screenshots: screenshotCount,
        attachments: attachmentCount
      })
      
      // Stage 1: File Upload (if needed)
      setSubmissionStage('uploading')
      setSubmissionProgress(10)
      
      // Handle file uploads using reusable service
      const uploadService = new FormFileUploadService(clientSessionId, {
        setSubmissionProgress,
        setSubmissionStage,
        setSubmissionError,
        setIsSubmitting
      })

      const fileFields: FileUploadField[] = [
        {
          files: data.screenshotFiles || [],
          fieldName: 'screenshotFiles',
          fileType: 'screenshot'
        },
        {
          files: data.attachmentFiles || [],
          fieldName: 'attachmentFiles', 
          fileType: 'attachment'
        }
      ]

      const uploadResult = await uploadService.processFileFields(fileFields)
      
      if (!uploadResult.success) {
        logger.error('❌ File upload failed:', { sessionId: clientSessionId, errors: uploadResult.errors })
        setSubmissionError(`File upload failed: ${uploadResult.errors.join('; ')}`)
        setSubmissionStage('error')
        setIsSubmitting(false)
        return
      }

      // Validate uploaded URLs
      const fileValidationErrors = uploadService.validateUploadedUrls(uploadResult.uploadedUrls)
      
      if (fileValidationErrors.length > 0) {
        logger.error('File URL validation failed:', { sessionId: clientSessionId, errors: fileValidationErrors })
        setSubmissionError('File validation failed. Please re-upload your files.')
        setSubmissionStage('error')
        setIsSubmitting(false)
        return
      }

      // Prepare submission data with uploaded URLs
      const submissionData = uploadService.createSubmissionData(data, uploadResult.uploadedUrls, {
        formType: 'report',
        submittedAt: new Date().toISOString(),
        locale,
      })

      // Log form submission
      uploadService.logFormSubmission('Report', uploadResult.uploadedUrls)
      
      // Stage 2: Prepare submission data
      setSubmissionStage('preparing')
      setSubmissionProgress(60)

      // Converting to FormData
      const formData = convertToFormData(submissionData)
      setSubmissionProgress(70)

      // Stage 3: Submit using Server Action
      setSubmissionStage('validating')
      setSubmissionProgress(80)

      // Submitting form
      const { submitMediaFormAction } = await import('@/actions/media-forms')
      const result = await submitMediaFormAction(formData)
      
      // Stage 4: Validate response
      setSubmissionStage('saving')
      setSubmissionProgress(90)

      if (result.success) {
        // Stage 5: Complete
        setSubmissionStage('complete')
        setSubmissionProgress(100)
        
        logger.success('Form submitted successfully', result.submissionId)
        
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
          const successful = result.uploadStats.successful || (result.uploadStats.screenshots || 0) + (result.uploadStats.attachments || 0)
          const expected = result.uploadStats.expected || 'unknown'
          const statsMessage = `${result.message}\n\nStatistiques: ${successful}/${expected} fichiers téléchargés avec succès`
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

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              duration: 0.6,
              ease: [0.04, 0.62, 0.23, 0.98]
            }}
          >
            <ThankYouCard 
              locale={locale}
              formType="report"
              submissionId={submissionId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.5,
              ease: [0.04, 0.62, 0.23, 0.98]
            }}
          >
            {/* Development: Show validation errors in development mode only */}
            {process.env.NODE_ENV === 'development' && Object.keys(formState.errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-semibold mb-2">Validation Errors (Development):</h4>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('screenshotFiles')}
            </label>
            <EnhancedFileUploadV3
              value={watch('screenshotFiles') || []}
              onChange={(files) => methods.setValue('screenshotFiles', files)}
              maxFiles={5}
              maxSize={10}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt']}
              multiple={true}
              fileType="screenshot"
              label={t('screenshots')}
              description={t('uploadScreenshotFiles')}
              disabled={isSubmitting}
            />
          </div>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('attachmentFiles')}
              </label>
              <EnhancedFileUploadV3
                value={watch('attachmentFiles') || []}
                onChange={(files) => methods.setValue('attachmentFiles', files)}
                maxFiles={8}
                maxSize={100}
                acceptedFileTypes={['.mp4', '.webm', '.mov', '.avi', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.mp3', '.wav', '.m4a', '.ogg', '.flac']}
                multiple={true}
                fileType="attachment"
                label={t('attachments')}
                description={t('uploadAttachmentFiles')}
                disabled={isSubmitting}
              />
            </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }