'use client'

import React, { useMemo } from 'react'
import { ContactSubmission } from '@/payload-types'
import { EmailReplyData } from './ReplyDialog'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Monitor, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailPreviewProps {
  submission: ContactSubmission
  replyData: EmailReplyData
  locale?: string
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  submission,
  replyData,
  locale = 'fr',
}) => {
  const isRTL = locale === 'ar'

  // Convert markdown-style formatting to HTML
  const formattedMessage = useMemo(() => {
    let html = replyData.message
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Convert line breaks
      .replace(/\n/g, '<br />')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Underline
      .replace(/__(.+?)__/g, '<u>$1</u>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
      // Bullet lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul style="margin: 16px 0; padding-left: 24px;">$1</ul>')
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol style="margin: 16px 0; padding-left: 24px;">$1</ol>')

    return html
  }, [replyData.message])

  const emailContent = (isMobile: boolean = false) => (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm',
        isMobile ? 'max-w-sm mx-auto' : 'w-full'
      )}
    >
      {/* Email Client Header */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="font-medium w-20">From:</span>
            <span>HAPA Support &lt;support@hapa.mr&gt;</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">To:</span>
            <span>{submission.email}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">Subject:</span>
            <span>{replyData.subject}</span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6">
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333333',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {/* Header with HAPA Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
              }}
            >
              <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>HAPA</h1>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Haute Autorité de la Presse et de l'Audiovisuel
              </p>
            </div>
          </div>

          {/* Greeting */}
          <p style={{ marginBottom: '16px' }}>
            {locale === 'fr' ? 'Bonjour' : 'مرحبا'} {submission.name},
          </p>

          {/* Main Message */}
          <div
            dangerouslySetInnerHTML={{ __html: formattedMessage }}
            style={{
              marginBottom: '24px',
            }}
          />

          {/* Signature */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ marginBottom: '8px' }}>
              {locale === 'fr' ? 'Cordialement,' : 'مع أطيب التحيات،'}
            </p>
            <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {locale === 'fr' ? 'Équipe HAPA' : 'فريق HAPA'}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              support@hapa.mr | www.hapa.mr
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 8px' }}>
              {locale === 'fr'
                ? 'Ceci est une réponse à votre demande de contact.'
                : 'هذا رد على طلب الاتصال الخاص بك.'}
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} HAPA - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="mt-4">
          <Card className="p-4 bg-gray-50">
            {emailContent(false)}
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="mt-4">
          <Card className="p-4 bg-gray-50">
            {emailContent(true)}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Info */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>• This preview shows how the email will appear in most email clients</p>
        <p>• Actual rendering may vary slightly depending on the recipient's email client</p>
        <p>• The email will be sent in {locale === 'fr' ? 'French' : 'Arabic'}</p>
      </div>
    </div>
  )
}