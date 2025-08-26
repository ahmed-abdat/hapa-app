import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { getServerSideURL } from '@/utilities/getURL'
import { HAPA_CONTACT_INFO, getContactDisplay } from '@/emails/constants/contact-info'

interface EnhancedReplyEmailProps {
  userName: string
  subject: string
  message: string
  locale?: 'fr' | 'ar'
  includeFooter?: boolean
  isRichContent?: boolean
}

export const EnhancedReplyEmail = ({
  userName = 'Client',
  subject = 'Votre demande',
  message = '',
  locale = 'fr',
  includeFooter = true,
  isRichContent = false,
}: EnhancedReplyEmailProps) => {
  const isRTL = locale === 'ar'
  const direction = isRTL ? 'rtl' : 'ltr'
  const contactInfo = getContactDisplay(locale)

  // If message is already rich HTML from Lexical, use it directly
  // Otherwise, convert markdown-style formatting to HTML
  const rawFormattedMessage = isRichContent 
    ? message 
    : message
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #2563eb;">$1</a>')
      .replace(/\n/g, '<br />')
      .replace(/^- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul style="margin: 16px 0; padding-left: 24px;">$1</ul>')

  // Sanitize the HTML to prevent XSS attacks
  const formattedMessage = (() => {
    const window = new JSDOM('').window
    const purifyInstance = DOMPurify(window)
    
    return purifyInstance.sanitize(rawFormattedMessage, {
      ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br'],
      ALLOWED_ATTR: ['href', 'style'],
      ALLOW_DATA_ATTR: false,
    })
  })()

  const previewText = `${contactInfo.messages.replyToYourRequest}: ${subject}`
  const greeting = `${contactInfo.messages.greeting} ${userName},`
  const signature = `${contactInfo.messages.regards},`
  const teamName = contactInfo.messages.emailSignature
  const footerText = contactInfo.messages.replyToYourRequest

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={logoSection}>
            <Img
              src={`${getServerSideURL()}/hapa-logo.webp`}
              width="160"
              height="60"
              alt={contactInfo.organization}
              style={{
                display: 'block',
                margin: '0 auto 16px auto',
              }}
            />
            <Text style={tagline}>
              {contactInfo.organizationFull}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Main Content */}
          <Section style={{ ...content, direction, textAlign: isRTL ? 'right' : 'left' }}>
            <Text style={paragraph}>{greeting}</Text>

            <div
              dangerouslySetInnerHTML={{ __html: formattedMessage }}
              style={messageStyle}
            />

            <Text style={paragraph}>{signature}</Text>
            <Text style={signatureName}>{teamName}</Text>
          </Section>

          <Hr style={hr} />

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text style={contactText}>
              {contactInfo.labels.email}: <Link href={`mailto:${HAPA_CONTACT_INFO.email.primary}`} style={link}>{HAPA_CONTACT_INFO.email.primary}</Link>
            </Text>
            <Text style={contactText}>
              {contactInfo.labels.website}: <Link href={getServerSideURL()} style={link}>{HAPA_CONTACT_INFO.website.displayName}</Link>
            </Text>
            <Text style={contactText}>
              {contactInfo.labels.phone}: <Link href={HAPA_CONTACT_INFO.phone.tel_href} style={link}>{HAPA_CONTACT_INFO.phone.formatted}</Link>
            </Text>
          </Section>

          {/* Footer */}
          {includeFooter && (
            <Section style={footer}>
              <Text style={footerTextStyle}>{footerText}</Text>
              <Text style={footerTextStyle}>
                © {new Date().getFullYear()} {contactInfo.organization} - {contactInfo.messages.copyright}
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  )
}

export default EnhancedReplyEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '32px 20px',
  backgroundColor: '#f9fafb',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
}

const tagline = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
}

const content = {
  padding: '24px 48px',
}

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const messageStyle = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '24px 0',
}

const signatureName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '8px 0',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
}

const contactSection = {
  textAlign: 'center' as const,
  padding: '16px 48px',
}

const contactText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '4px 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'none',
}

const footer = {
  backgroundColor: '#f9fafb',
  textAlign: 'center' as const,
  padding: '24px',
  marginTop: '32px',
}

const footerTextStyle = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '4px 0',
}