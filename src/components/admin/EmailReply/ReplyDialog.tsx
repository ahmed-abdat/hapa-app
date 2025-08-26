'use client'

import React, { useState, useCallback, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Send, Eye, FileText, X } from 'lucide-react'
import { toast } from '@payloadcms/ui'
import { ContactSubmission } from '@/payload-types'
import { EmailPreview } from './EmailPreview'
import { TemplateSelector } from './TemplateSelector'
import { sendReplyAction } from '@/app/actions/send-reply'

interface ReplyDialogProps {
  submission: ContactSubmission
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export type EmailTemplate = 'standard' | 'quick' | 'detailed' | 'follow-up'

export interface EmailReplyData {
  subject: string
  message: string
  template: EmailTemplate
  richText?: any // Lexical editor state
}

export const ReplyDialog: React.FC<ReplyDialogProps> = ({
  submission,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose')
  const [replyData, setReplyData] = useState<EmailReplyData>({
    subject: `Re: ${submission.subject || 'Your contact request'}`,
    message: '',
    template: 'standard',
  })

  const handleSendReply = useCallback(async () => {
    if (!replyData.message.trim()) {
      toast.error('Please enter a message')
      return
    }

    startTransition(async () => {
      try {
        const result = await sendReplyAction({
          submissionId: String(submission.id),
          replyMessage: replyData.message,
          subject: replyData.subject,
        })

        if (result.success) {
          toast.success('Reply sent successfully!')
          onOpenChange(false)
          onSuccess?.()
          // Reset form
          setReplyData({
            subject: `Re: ${submission.subject || 'Your contact request'}`,
            message: '',
            template: 'standard',
          })
        } else {
          toast.error(result.error || 'Failed to send reply')
        }
      } catch (error) {
        // Display error in toast notification
        toast.error('An unexpected error occurred')
      }
    })
  }, [replyData, submission, onOpenChange, onSuccess])

  const handleTemplateChange = useCallback((template: EmailTemplate, content: string) => {
    setReplyData(prev => ({
      ...prev,
      template,
      message: content,
    }))
  }, [])

  const handleMessageChange = useCallback((content: string) => {
    setReplyData(prev => ({
      ...prev,
      message: content,
    }))
  }, [])

  const handleSubjectChange = useCallback((subject: string) => {
    setReplyData(prev => ({
      ...prev,
      subject,
    }))
  }, [])

  // Determine locale from submission
  const locale = submission.preferredLanguage || 'fr'
  const isRTL = locale === 'ar'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Reply to {submission.name}</DialogTitle>
          <DialogDescription>
            Compose and send a reply to this contact submission.
            {submission.email && (
              <span className="block mt-1 font-medium">
                To: {submission.email}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'compose' | 'preview')}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="compose" className="space-y-4 mt-0">
              {/* Subject Field */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <input
                  id="subject"
                  type="text"
                  value={replyData.subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject..."
                />
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <Label>Template</Label>
                <TemplateSelector
                  value={replyData.template}
                  submission={submission}
                  onChange={handleTemplateChange}
                />
              </div>

              {/* Simple Textarea Editor */}
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea
                  value={replyData.message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder={locale === 'ar' 
                    ? 'اكتب رسالة الرد هنا...'
                    : 'Tapez votre message de réponse ici...'
                  }
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="w-full min-h-[200px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    direction: isRTL ? 'rtl' : 'ltr',
                  }}
                />
              </div>

              {/* Original Message Reference */}
              <div className="p-4 bg-gray-50 rounded-md space-y-2">
                <p className="text-sm font-medium text-gray-700">Original Message:</p>
                <div className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p><strong>From:</strong> {submission.name} ({submission.email})</p>
                  <p><strong>Subject:</strong> {submission.subject}</p>
                  <p className="mt-2 whitespace-pre-wrap">{submission.message}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <EmailPreview
                submission={submission}
                replyData={replyData}
                locale={locale}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSendReply}
            disabled={isPending || !replyData.message.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}