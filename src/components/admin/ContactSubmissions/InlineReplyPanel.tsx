'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useField, useDocumentInfo, useForm } from '@payloadcms/ui'
import { ContactSubmission } from '@/payload-types'
import { sendReplyAction } from '@/app/actions/send-reply'
import { TemplateSelector, EmailTemplate } from '../EmailReply'
import { toast } from '@payloadcms/ui'

export interface EmailReplyData {
  subject: string
  message: string
  template: EmailTemplate
}

const InlineReplyPanel: React.FC = () => {
  const { value: replyMessage, setValue: setReplyMessage } = useField<string>({ path: 'replyMessage' })
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
      setSendError('No submission data available')
      return
    }

    const hasMessage = replyData.message && replyData.message.trim().length > 0
    const hasSubject = replyData.subject && replyData.subject.trim().length > 0
    
    if (!hasMessage || !hasSubject) {
      setSendError('Please enter a subject and message')
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
        setReplyMessage(replyData.message)
        
        // Include email ID in success message if available
        const successMsg = result.emailId 
          ? `Email sent successfully! (ID: ${result.emailId})` 
          : 'Email sent successfully!'
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
          // Refresh the page to show updated status
          window.location.reload()
        }, 2000)
      } else {
        const errorMsg = result?.error || 'Failed to send email'
        setSendError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while sending the email'
      setSendError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }, [replyData, submissionData, id, setReplyMessage])

  if (!submissionData) {
    return <div>Loading...</div>
  }

  const locale = submissionData.preferredLanguage || 'fr'
  const isRTL = locale === 'ar'

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginTop: '20px'
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
          ✓ Reply Sent on {emailSentAt ? new Date(emailSentAt).toLocaleDateString() : ''}
        </div>
      )}

      {/* Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {emailSent ? '↩ Send Another Reply' : '✉ Compose Reply'}
        </button>
      )}

      {/* Expanded Reply Interface */}
      {isExpanded && (
        <div style={{ marginTop: '20px' }}>
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
                ✓ Email sent successfully!
              </div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                The reply has been sent to {submissionData.email}
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
                color: '#374151'
              }}>
                Subject
              </label>
              <input
                type="text"
                value={replyData.subject}
                onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Template Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Template
              </label>
              <TemplateSelector
                value={replyData.template}
                submission={submissionData}
                onChange={handleTemplateChange}
              />
            </div>

            {/* Simple Message Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Message
              </label>
              
              <textarea
                value={replyData.message}
                onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={locale === 'ar' 
                  ? 'اكتب رسالة الرد هنا...'
                  : 'Tapez votre message de réponse ici...'
                }
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  direction: isRTL ? 'rtl' : 'ltr',
                }}
              />
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
                Original Message:
              </h4>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <p><strong>From:</strong> {submissionData.name} ({submissionData.email})</p>
                <p><strong>Subject:</strong> {submissionData.subject}</p>
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
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={isSending || !replyData.subject.trim() || !replyData.message.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isSending || !replyData.subject.trim() || !replyData.message.trim() ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSending || !replyData.subject.trim() || !replyData.message.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isSending ? '⏳ Sending...' : '📤 Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Previous Reply Display */}
      {replyMessage && !isExpanded && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            marginBottom: '8px',
            color: '#4b5563'
          }}>
            Last Reply:
          </h4>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            whiteSpace: 'pre-wrap'
          }}>
            {replyMessage}
          </p>
        </div>
      )}
    </div>
  )
}

export default InlineReplyPanel