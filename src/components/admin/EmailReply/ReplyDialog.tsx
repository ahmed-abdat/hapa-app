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
import { useAdminTranslation } from '@/utilities/admin-translations'

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
  const { dt, i18n } = useAdminTranslation()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose')
  const [replyData, setReplyData] = useState<EmailReplyData>({
    subject: `Re: ${submission.subject || 'Your contact request'}`,
    message: '',
    template: 'standard',
  })

  const handleSendReply = useCallback(async () => {
    if (!replyData.message.trim()) {
      toast.error(dt('emailReply.pleaseEnterMessage'))
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
          toast.success(dt('emailReply.replySent'))
          onOpenChange(false)
          onSuccess?.()
          // Reset form
          setReplyData({
            subject: `Re: ${submission.subject || 'Your contact request'}`,
            message: '',
            template: 'standard',
          })
        } else {
          toast.error(result.error || dt('emailReply.replyError'))
        }
      } catch (error) {
        // Display error in toast notification
        toast.error(dt('emailReply.replyError'))
      }
    })
  }, [replyData, submission, onOpenChange, onSuccess, dt])

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

  // Get admin's interface language for UI display
  const adminLocale = i18n.language
  const isAdminRTL = adminLocale === 'ar'
  
  // Keep submission locale for email content
  const locale = submission.preferredLanguage || 'fr'
  const isEmailRTL = locale === 'ar'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{dt('emailReply.replyTo', { name: submission.name })}</DialogTitle>
          <DialogDescription>
            {dt('emailReply.composeAndSend')}
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
              {dt('emailReply.composeTab')}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {dt('emailReply.previewTab')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="compose" className="space-y-4 mt-0">
              {/* Subject Field */}
              <div className="space-y-2">
                <Label htmlFor="subject">{dt('emailReply.subject')}</Label>
                <input
                  id="subject"
                  type="text"
                  value={replyData.subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={dt('emailReply.subject')}
                />
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <Label>{dt('emailReply.template')}</Label>
                <TemplateSelector
                  value={replyData.template}
                  submission={submission}
                  onChange={handleTemplateChange}
                />
              </div>

              {/* Enhanced Textarea Editor with proper RTL/LTR support */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{dt('emailReply.message')}</Label>
                  <span className="text-xs text-gray-500">
                    {replyData.message.length > 0 && `${replyData.message.length} ${dt('emailReply.characters')}`}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={replyData.message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder={dt('emailReply.messagePlaceholder')}
                    dir="auto"
                    className={`
                      w-full min-h-[250px] px-4 py-3 
                      border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
                      resize-vertical transition-all duration-200
                      placeholder:text-gray-400
                      ${isAdminRTL ? 'text-right' : 'text-left'}
                      hover:border-green-500/50
                    `}
                    style={{
                      fontFamily: isAdminRTL ? 
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Arabic", "Arabic UI Display", sans-serif' : 
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}
                  />
                  {/* Text direction indicator with HAPA colors */}
                  <div className={`absolute top-2 ${isAdminRTL ? 'left-2' : 'right-2'} text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md border border-green-200`}>
                    {isAdminRTL ? 'RTL' : 'LTR'}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {dt('emailReply.messageTip')}
                </p>
              </div>

              {/* Original Message Reference */}
              <div className="p-4 bg-gray-50 rounded-md space-y-2">
                <p className="text-sm font-medium text-gray-700">{dt('emailReply.originalMessage')}:</p>
                <div className={`text-sm text-gray-600 ${isAdminRTL ? 'text-right' : 'text-left'}`}>
                  <p><strong>{dt('emailReply.from')}:</strong> {submission.name} ({submission.email})</p>
                  <p><strong>{dt('emailReply.subject')}:</strong> {submission.subject}</p>
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
            {dt('emailReply.cancel')}
          </Button>
          <Button
            onClick={handleSendReply}
            disabled={isPending || !replyData.message.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {dt('emailReply.sending')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {dt('emailReply.sendReply')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}