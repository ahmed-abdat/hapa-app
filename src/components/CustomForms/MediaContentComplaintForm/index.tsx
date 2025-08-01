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
  FormSelect,
  CountryCombobox,
  TVChannelCombobox,
  RadioStationCombobox,
  FormDateTimePicker,
  FormFileUpload
} from '../FormFields'
import { 
  createMediaContentComplaintSchema, 
  type MediaContentComplaintFormData,
  type MediaContentComplaintSubmission 
} from '@/lib/validations/media-forms'
import { type Locale } from '@/utilities/locale'

interface MediaContentComplaintFormProps {
  className?: string
}

export function MediaContentComplaintForm({ className }: MediaContentComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>()
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as Locale) || 'fr'
  const t = useTranslations()

  const methods = useForm<MediaContentComplaintFormData>({
    resolver: zodResolver(createMediaContentComplaintSchema(t)),
    defaultValues: {
      // Complainant Information
      fullName: '',
      gender: undefined,
      country: '',
      phoneNumber: '',
      whatsappNumber: '',
      emailAddress: '',
      profession: '',
      relationshipToContent: undefined,
      relationshipOther: '',
      // Content Information
      mediaType: undefined,
      mediaTypeOther: '',
      tvChannel: undefined,
      tvChannelOther: '',
      radioStation: undefined,
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

  const { watch } = methods
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
    setIsSubmitting(true)
    
    try {
      const submissionData: MediaContentComplaintSubmission = {
        ...data,
        formType: 'complaint',
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

          <FormFileUpload
            name="screenshotFiles"
            label={t('screenshotFiles')}
            accept="image/*,.pdf"
            maxSize={5}
            multiple
            locale={locale}
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

        {/* Section 6: Declaration and Consent */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('declarationConsent')}
            </h3>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptDeclaration"
                {...methods.register('acceptDeclaration')}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="acceptDeclaration" className="text-sm text-gray-700 leading-relaxed">
                {t('declarationText')}
                <span className="text-red-500 ms-1">*</span>
              </label>
            </div>
            {methods.formState.errors.acceptDeclaration && (
              <p className="text-sm text-red-600 mt-1">
                {t('fieldRequired')}
              </p>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptConsent"
                {...methods.register('acceptConsent')}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="acceptConsent" className="text-sm text-gray-700 leading-relaxed">
                {t('consentText')}
                <span className="text-red-500 ms-1">*</span>
              </label>
            </div>
            {methods.formState.errors.acceptConsent && (
              <p className="text-sm text-red-600 mt-1">
                {t('fieldRequired')}
              </p>
            )}
          </div>
        </div>
      </BaseForm>
    </div>
  )
}