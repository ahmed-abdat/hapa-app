'use client'

import React, { useState, useCallback, useEffect, useTransition } from 'react'
import { useField, useDocumentInfo, useForm } from '@payloadcms/ui'
import { ContactSubmission } from '@/payload-types'
import { sendReplyAction } from '@/app/actions/send-reply'
import { RichTextReplyField } from '../EmailReply/RichTextReplyField'
import { EmailPreview } from '../EmailReply/EmailPreview'
import { TemplateSelector, EmailTemplate } from '../EmailReply'

export interface EmailReplyData {
  subject: string
  message: string
  template: EmailTemplate
  richText?: any
}

const InlineReplyPanel: React.FC = () => {
  const { value: replyMessage } = useField<string>({ path: 'replyMessage' })
  const { value: emailSent } = useField<boolean>({ path: 'emailSent' })
  const { value: emailSentAt } = useField<string>({ path: 'emailSentAt' })
  const { getData, submit } = useForm()
  const { id } = useDocumentInfo()
  
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [submissionData, setSubmissionData] = useState<ContactSubmission | null>(null)
  const [replyData, setReplyData] = useState<EmailReplyData>({
    subject: '',
    message: '',
    template: 'standard',
  })
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

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

  const handleMessageChange = useCallback((content: string, richText?: any) => {
    setReplyData(prev => ({
      ...prev,
      message: content,
      richText,
    }))
  }, [])

  const handleSendReply = useCallback(async () => {
    if (!replyData.message.trim() || !submissionData) {
      setSendError('Please enter a message')
      return
    }

    setSendError(null)
    startTransition(async () => {
      try {
        const result = await sendReplyAction({
          submissionId: String(submissionData.id),
          replyMessage: replyData.message,
          subject: replyData.subject,
        })

        if (result.success) {
          setSendSuccess(true)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          setSendError(result.error || 'Failed to send reply')
        }
      } catch (error) {
        console.error('Error sending reply:', error)
        setSendError('An unexpected error occurred')
      }
    })
  }, [replyData, submissionData])

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
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Email Reply System
        </h3>
        
        {emailSent && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#059669'
          }}>
            ✓ Reply Sent on {emailSentAt ? new Date(emailSentAt).toLocaleDateString() : ''}
          </div>
        )}
      </div>

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
              padding: '12px',
              backgroundColor: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '6px',
              marginBottom: '20px',
              color: '#065f46'
            }}>
              ✓ Reply sent successfully! Refreshing page...
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

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '10px'
          }}>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: !showPreview ? '#2563eb' : 'transparent',
                color: !showPreview ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📝 Compose
            </button>
            <button
              onClick={() => setShowPreview(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: showPreview ? '#2563eb' : 'transparent',
                color: showPreview ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              👁 Preview
            </button>
          </div>

          {/* Content Area */}
          {!showPreview ? (
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

              {/* Message Field */}
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
                <RichTextReplyField
                  value={replyData.message}
                  onChange={handleMessageChange}
                  locale={locale}
                  placeholder="Type your reply message..."
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
          ) : (
            <EmailPreview
              submission={submissionData}
              replyData={replyData}
              locale={locale}
            />
          )}

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
              disabled={isPending || !replyData.message.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isPending || !replyData.message.trim() ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isPending || !replyData.message.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isPending ? '⏳ Sending...' : '📤 Send Reply'}
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