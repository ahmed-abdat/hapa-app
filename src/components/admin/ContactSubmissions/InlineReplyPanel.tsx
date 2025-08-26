'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useField, useDocumentInfo, useForm } from '@payloadcms/ui'
import { ContactSubmission } from '@/payload-types'
import { sendReplyAction } from '@/app/actions/send-reply'
import { TemplateSelector, EmailTemplate } from '../EmailReply'
import { toast } from '@payloadcms/ui'
import { useAdminTranslation } from '@/utilities/admin-translations'

export interface EmailReplyData {
  subject: string
  message: string
  template: EmailTemplate
}

const InlineReplyPanel: React.FC = () => {
  const { dt, i18n } = useAdminTranslation()
  const { value: emailSent } = useField<boolean>({ path: 'emailSent' })
  const { value: emailSentAt } = useField<string>({ path: 'emailSentAt' })
  const { getData } = useForm()
  const { id } = useDocumentInfo()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [submissionData, setSubmissionData] = useState<ContactSubmission | null>(null)
  const [replyData, setReplyData] = useState<EmailReplyData>({
    subject: '',
    message: '',
    template: 'standard',
  })
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Get the full document data
  useEffect(() => {
    const data = getData() as ContactSubmission
    setSubmissionData(data)
    if (data) {
      setReplyData(prev => ({
        ...prev,
        subject: `Re: ${data.subject || 'Your contact request'}`,
      }))
    }
  }, [getData])

  const handleTemplateChange = useCallback((template: EmailTemplate, content: string) => {
    setReplyData(prev => ({
      ...prev,
      template,
      message: content,
    }))
  }, [])


  const handleSendReply = useCallback(async () => {
    if (!submissionData || !id) {
      setSendError(dt('emailReply.replyError'))
      return
    }

    const hasMessage = replyData.message && replyData.message.trim().length > 0
    const hasSubject = replyData.subject && replyData.subject.trim().length > 0
    
    if (!hasMessage || !hasSubject) {
      setSendError(dt('emailReply.pleaseEnterMessage'))
      return
    }

    setSendError(null)
    setIsSending(true)

    try {
      const result = await sendReplyAction({
        submissionId: String(id),
        replyMessage: replyData.message,
        subject: replyData.subject,
        useEnhancedTemplate: true, // Always use enhanced template
      })

      if (result && result.success) {
        setSendSuccess(true)
        
        // Include email ID in success message if available
        const successMsg = result.emailId 
          ? `${dt('emailReply.replySent')} (ID: ${result.emailId})` 
          : dt('emailReply.replySent')
        toast.success(successMsg)
        
        // Reset the form after a delay
        setTimeout(() => {
          setIsExpanded(false)
          setSendSuccess(false)
          setReplyData({
            subject: `Re: ${submissionData.subject || 'Your contact request'}`,
            message: '',
            template: 'standard',
          })
          // Note: Email status updates should be handled by the server action
          // No need for full page reload - the success state is maintained in local state
        }, 2000)
      } else {
        const errorMsg = result?.error || dt('emailReply.replyError')
        setSendError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dt('emailReply.replyError')
      setSendError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }, [replyData, submissionData, id, dt])

  if (!submissionData) {
    return <div>Loading...</div>
  }

  // Get admin's interface language for UI display
  const adminLocale = i18n.language
  const isAdminRTL = adminLocale === 'ar'
  
  // Keep submission locale for email content
  const locale = submissionData.preferredLanguage || 'fr'
  const isEmailRTL = locale === 'ar'

  return (
    <div 
      dir={isAdminRTL ? 'rtl' : 'ltr'}
      style={{ 
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginTop: '20px',
        direction: isAdminRTL ? 'rtl' : 'ltr'
      }}>
      {/* Header - Only show if reply was already sent */}
      {emailSent && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          marginBottom: '20px',
          color: '#059669',
          fontSize: '14px'
        }}>
          ✓ {dt('emailReply.replySent')} - {emailSentAt ? new Date(emailSentAt).toLocaleDateString() : ''}
        </div>
      )}

      {/* Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          aria-expanded={isExpanded}
          aria-controls="reply-panel"
          aria-label={dt('emailReply.composeReplyButton')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#16a34a', // HAPA green-600
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#15803d' // green-700
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#16a34a' // green-600
          }}
        >
          {dt('emailReply.composeReplyButton')}
        </button>
      )}

      {/* Expanded Reply Interface */}
      {isExpanded && (
        <div id="reply-panel" role="region" aria-label={dt('emailReply.replyInterface')} style={{ marginTop: '20px' }}>
          {/* Success Message */}
          {sendSuccess && (
            <div style={{
              padding: '16px',
              backgroundColor: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '6px',
              marginBottom: '20px',
              color: '#065f46'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                ✓ {dt('emailReply.replySent')}
              </div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                {dt('emailReply.replySent')} - {submissionData.email}
              </p>
            </div>
          )}

          {/* Error Message */}
          {sendError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              marginBottom: '20px',
              color: '#991b1b'
            }}>
              ⚠ {sendError}
            </div>
          )}

          {/* Content Area */}
          <div>
            {/* Subject Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                textAlign: isAdminRTL ? 'right' : 'left'
              }}>
                {dt('emailReply.subject')}
              </label>
              <input
                type="text"
                value={replyData.subject}
                onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                dir={isAdminRTL ? 'rtl' : 'ltr'}
                aria-label={dt('emailReply.subject')}
                aria-required="true"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textAlign: isAdminRTL ? 'right' : 'left',
                  direction: isAdminRTL ? 'rtl' : 'ltr'
                }}
              />
            </div>

            {/* Template Selector with proper RTL support */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                textAlign: isAdminRTL ? 'right' : 'left'
              }}>
                {dt('emailReply.template')}
              </label>
              <div dir={isAdminRTL ? 'rtl' : 'ltr'} style={{ direction: isAdminRTL ? 'rtl' : 'ltr' }}>
                <TemplateSelector
                  value={replyData.template}
                  submission={submissionData}
                  onChange={handleTemplateChange}
                />
              </div>
            </div>

            {/* Enhanced Message Textarea with proper RTL/LTR support */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  textAlign: isAdminRTL ? 'right' : 'left'
                }}>
                  {dt('emailReply.message')}
                </label>
                {replyData.message.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {replyData.message.length} {dt('emailReply.characters')}
                  </span>
                )}
              </div>
              
              <div style={{ position: 'relative' }}>
                <textarea
                  value={replyData.message}
                  onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={dt('emailReply.messagePlaceholder')}
                  dir="auto"
                  aria-label={dt('emailReply.message')}
                  aria-required="true"
                  aria-describedby="message-tip"
                  style={{
                    width: '100%',
                    minHeight: '250px',
                    padding: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    fontFamily: isAdminRTL ? 
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Arabic", "Arabic UI Display", sans-serif' : 
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    textAlign: isAdminRTL ? 'right' : 'left',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.borderColor = '#16a34a' // green-600
                    target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)' // green-500 with opacity
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.borderColor = '#d1d5db'
                    target.style.boxShadow = 'none'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    if (document.activeElement !== target) {
                      target.style.borderColor = '#86efac' // green-300
                    }
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    if (document.activeElement !== target) {
                      target.style.borderColor = '#d1d5db'
                    }
                  }}
                />
                {/* Text direction indicator with HAPA colors */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  [isAdminRTL ? 'left' : 'right']: '8px',
                  fontSize: '11px',
                  color: '#15803d', // green-700
                  backgroundColor: '#dcfce7', // green-100
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0', // green-200
                  fontWeight: '500'
                }}>
                  {isAdminRTL ? 'RTL' : 'LTR'}
                </div>
              </div>
              
              <p id="message-tip" style={{ 
                marginTop: '8px',
                fontSize: '12px', 
                color: '#6b7280'
              }}>
                {dt('emailReply.messageTip')}
              </p>
            </div>

            {/* Original Message */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                marginBottom: '12px',
                color: '#4b5563'
              }}>
                {dt('emailReply.originalMessageLabel')}
              </h4>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <p><strong>{dt('emailReply.fromLabel')}</strong> {submissionData.name} ({submissionData.email})</p>
                <p><strong>{dt('emailReply.subjectLabel')}</strong> {submissionData.subject}</p>
                <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {submissionData.message}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label={dt('emailReply.cancel')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {dt('emailReply.cancel')}
            </button>
            <button
              onClick={handleSendReply}
              disabled={isSending || !replyData.subject.trim() || !replyData.message.trim()}
              aria-label={isSending 
                ? dt('emailReply.sending') 
                : dt('emailReply.sendReply')
              }
              aria-describedby={(!replyData.subject.trim() || !replyData.message.trim()) ? "form-validation-error" : undefined}
              style={{
                padding: '10px 20px',
                backgroundColor: isSending || !replyData.subject.trim() || !replyData.message.trim() ? '#9ca3af' : '#16a34a', // HAPA green-600
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSending || !replyData.subject.trim() || !replyData.message.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSending && replyData.subject.trim() && replyData.message.trim()) {
                  e.currentTarget.style.backgroundColor = '#15803d' // green-700
                }
              }}
              onMouseLeave={(e) => {
                if (!isSending && replyData.subject.trim() && replyData.message.trim()) {
                  e.currentTarget.style.backgroundColor = '#16a34a' // green-600
                }
              }}
            >
              {isSending 
                ? dt('emailReply.sending') 
                : dt('emailReply.sendReply')
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InlineReplyPanel