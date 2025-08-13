'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { BaseForm } from '../BaseForm'
import { ThankYouCard } from '../ThankYouCard'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FormInput, 
  FormTextarea, 
  FormCheckboxGroup, 
  FormRadioGroup,
  FormSelect,
  CountryCombobox,
  TVChannelCombobox,
  RadioStationCombobox,
  FormDateTimePicker,
  FormFileUpload
} from '../FormFields'
import { EnhancedFileUpload } from '../FormFields/EnhancedFileUpload'
import { 
  createMediaContentComplaintSchema, 
  type MediaContentComplaintFormData,
  type MediaContentComplaintSubmission 
} from '@/lib/validations/media-forms'
import { type Locale } from '@/utilities/locale'
import { convertToFormData } from '@/lib/file-upload'
import { logger } from '@/utilities/logger'
import { FormSubmissionProgress } from '@/components/CustomForms/FormSubmissionProgress'

interface MediaContentComplaintFormProps {
  className?: string
}

export function MediaContentComplaintForm({ className }: MediaContentComplaintFormProps) {
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

  const methods = useForm<MediaContentComplaintFormData>({
    resolver: zodResolver(createMediaContentComplaintSchema(t)),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      // Complainant Information
      fullName: '',
      gender: '' as any, // Initialize as empty string instead of undefined
      country: '',
      phoneNumber: '',
      whatsappNumber: '',
      emailAddress: '',
      profession: '',
      relationshipToContent: '' as any, // Initialize as empty string instead of undefined
      relationshipOther: '',
      // Content Information
      mediaType: '' as any, // Initialize as empty string instead of undefined
      mediaTypeOther: '',
      tvChannel: '' as any, // Initialize as empty string instead of undefined
      tvChannelOther: '',
      radioStation: '' as any, // Initialize as empty string instead of undefined
      radioStationOther: '',
      programName: '',
      broadcastDateTime: '',
      linkScreenshot: '',
      screenshotFiles: [],
      // Complaint Reasons
      reasons: [],
      reasonOther: '',
      // Content Description
      description: '',
      // Attachments
      attachmentTypes: [],
      attachmentOther: '',
      attachmentFiles: [],
      // Declaration and Consent
      acceptDeclaration: false,
      acceptConsent: false,
    },
  })

  const { watch, trigger, formState } = methods
  const selectedMediaType = watch('mediaType')
  const selectedTvChannel = watch('tvChannel')
  const selectedRadioStation = watch('radioStation')
  const selectedReasons = watch('reasons')
  const selectedAttachments = watch('attachmentTypes')
  const selectedRelationship = watch('relationshipToContent')

  // Form options
  const mediaTypeOptions = [
    { value: 'television', label: t('television') },
    { value: 'radio', label: t('radio') },
    { value: 'website', label: t('website') },
    { value: 'youtube', label: t('youtube') },
    { value: 'facebook', label: t('facebook') },
    { value: 'other', label: t('other') },
  ]

  const relationshipOptions = [
    { value: 'viewer', label: t('viewer') },
    { value: 'directlyConcerned', label: t('directlyConcerned') },
    { value: 'journalist', label: t('journalist') },
    { value: 'other', label: t('other') },
  ]

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
  ]


  const complaintReasonOptions = [
    { value: 'hateSpeech', label: t('hateSpeech') },
    { value: 'fakeNews', label: t('fakeNews') },
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
      title: t('mediaContentComplaintTitle'),
      description: t('mediaContentComplaintDesc'),
      submitButtonText: t('submitComplaint'),
      successMessage: t('submissionSuccess', { type: t('complaintForm') }),
      errorMessage: t('submissionError'),
    },
    ar: {
      title: t('mediaContentComplaintTitle'),
      description: t('mediaContentComplaintDesc'),
      submitButtonText: t('submitComplaint'),
      successMessage: t('submissionSuccess', { type: t('complaintForm') }),
      errorMessage: t('submissionError'),
    },
  }


  const onSubmit = async (data: MediaContentComplaintFormData) => {
    const clientSessionId = `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // File validation
    const screenshotCount = Array.isArray(data.screenshotFiles) ? data.screenshotFiles.length : 0
    const attachmentCount = Array.isArray(data.attachmentFiles) ? data.attachmentFiles.length : 0
    
    // File check completed
    
    // File validation with detailed logging
    const fileValidationErrors: string[] = []
    
    if (Array.isArray(data.screenshotFiles)) {
      data.screenshotFiles.forEach((file, index) => {
        if (!(file instanceof File)) {
          const error = `Screenshot ${index + 1} is not a valid File`
          fileValidationErrors.push(error)
          logger.error('Invalid screenshot file:', { sessionId: clientSessionId, index: index + 1 })
        }
      })
    }
    
    if (Array.isArray(data.attachmentFiles)) {
      data.attachmentFiles.forEach((file, index) => {
        if (!(file instanceof File)) {
          const error = `Attachment ${index + 1} is not a valid File`
          fileValidationErrors.push(error)
          logger.error('Invalid attachment file:', { sessionId: clientSessionId, index: index + 1 })
        }
      })
    }
    
    if (fileValidationErrors.length > 0) {
      logger.error('File validation failed:', { sessionId: clientSessionId, errors: fileValidationErrors })
      setSubmissionError('File validation failed. Please re-upload your files.')
      return
    }

    // Log form submission
    logger.formSubmission('Complaint', { screenshots: screenshotCount, attachments: attachmentCount })
    
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
        formType: 'complaint',
        submittedAt: new Date().toISOString(),
        locale,
      }

      // Converting to FormData
      const formData = convertToFormData(submissionData)
      setSubmissionProgress(20)

      // Stage 2: Submit using Server Action
      setSubmissionStage('uploading')
      setSubmissionProgress(30)

      // Submitting form
      const { submitMediaFormAction } = await import('@/actions/media-forms')
      const result = await submitMediaFormAction(formData)
      
      // Stage 3: Validate response
      setSubmissionStage('validating')
      setSubmissionProgress(70)

      // Result already obtained from Server Action

      if (result.success) {
        // Stage 4: Save to database
        setSubmissionStage('saving')
        setSubmissionProgress(90)
        
        // Form submitted successfully
        
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

  // Show thank you card if form was submitted successfully
  if (isSubmitted) {
    return (
      <div className={className}>
        <ThankYouCard 
          locale={locale}
          formType="complaint"
          submissionId={submissionId}
        />
      </div>
    )
  }

  return (
    <div className={className}>
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
        {/* Section 1: Complainant Information */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('complainantInformation')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="fullName"
              label={t('fullName')}
              placeholder=""
              required
            />

            <FormSelect
              name="gender"
              label={t('gender')}
              options={genderOptions}
              required
            />

            <CountryCombobox
              name="country"
              label={t('country')}
              locale={locale}
              required
            />

            <FormInput
              name="emailAddress"
              label={t('emailAddress')}
              type="email"
              placeholder="example@email.com"
              required
            />

            <FormInput
              name="phoneNumber"
              label={t('phoneNumber')}
              type="tel"
              placeholder="+222 XX XX XX XX"
              required
            />

            <FormInput
              name="whatsappNumber"
              label={t('whatsappNumber')}
              type="tel"
              placeholder="+222 XX XX XX XX"
            />

            <FormInput
              name="profession"
              label={t('profession')}
              placeholder=""
              className="md:col-span-2"
            />
          </div>

          <FormRadioGroup
            name="relationshipToContent"
            label={t('relationshipToContent')}
            options={relationshipOptions}
          />

          {selectedRelationship === 'other' && (
            <FormInput
              name="relationshipOther"
              label={t('specifyOther')}
              placeholder={t('specifyOther')}
              required
            />
          )}
        </div>

        {/* Section 2: Content Information */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('contentInformationComplaint')}
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

          <EnhancedFileUpload
            name="screenshotFiles"
            label={t('screenshotFiles')}
            supportedTypes={['image', 'document']}
            maxFiles={5}
            enableChunkedUpload={false}
            enablePreview={true}
            locale={locale}
            required={false}
          />
        </div>

        {/* Section 3: Complaint Reason */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('complaintReason')}
            </h3>
          </div>

          <FormCheckboxGroup
            name="reasons"
            label={t('complaintReason')}
            options={complaintReasonOptions}
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
            placeholder={t('contentDescriptionPlaceholderComplaint')}
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
            <FormTextarea
              name="attachmentOther"
              label={t('attachmentOtherDescription')}
              placeholder={t('attachmentOtherPlaceholder')}
              className="min-h-20"
              required
            />
          )}

          {selectedAttachments && selectedAttachments.length > 0 && (
            <EnhancedFileUpload
              name="attachmentFiles"
              label={t('attachmentFiles')}
              supportedTypes={['video', 'audio', 'image', 'document']}
              maxFiles={8}
              enableChunkedUpload={true}
              enablePreview={true}
              locale={locale}
              required={false}
            />
          )}
        </div>

        {/* Section 6: Declaration and Consent */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('declarationConsent')}
            </h3>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptDeclaration"
                {...methods.register('acceptDeclaration')}
                className="mt-1"
              />
              <label htmlFor="acceptDeclaration" className="text-sm text-gray-700 leading-relaxed">
                {t('declarationText')}
                <span className="text-destructive ms-1">*</span>
              </label>
            </div>
            {methods.formState.errors.acceptDeclaration && (
              <p className="text-sm text-destructive mt-1">
                {t('fieldRequired')}
              </p>
            )}

            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptConsent"
                {...methods.register('acceptConsent')}
                className="mt-1"
              />
              <label htmlFor="acceptConsent" className="text-sm text-gray-700 leading-relaxed">
                {t('consentText')}
                <span className="text-destructive ms-1">*</span>
              </label>
            </div>
            {methods.formState.errors.acceptConsent && (
              <p className="text-sm text-destructive mt-1">
                {t('fieldRequired')}
              </p>
            )}
          </div>
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