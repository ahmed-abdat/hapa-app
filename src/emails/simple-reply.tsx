import * as React from 'react'
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

interface SimpleReplyEmailProps {
  userName: string
  userEmail: string
  originalSubject: string
  originalMessage: string
  replyMessage: string
  locale: 'fr' | 'ar'
}

export const SimpleReplyEmail: React.FC<SimpleReplyEmailProps> = ({
  userName,
  userEmail,
  originalSubject,
  originalMessage,
  replyMessage,
  locale,
}) => {
  const isArabic = locale === 'ar'
  
  return (
    <Html dir={isArabic ? 'rtl' : 'ltr'}>
      <Head />
      <Preview>
        {isArabic 
          ? `رد من HAPA على رسالتك`
          : `Réponse HAPA à votre message`
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://hapa.mr/logo_hapa1.png"
              width="120"
              height="40"
              alt="HAPA"
              style={logo}
            />
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={greeting}>
              {isArabic ? `مرحباً ${userName}،` : `Bonjour ${userName},`}
            </Text>
            
            <Text style={paragraph}>
              {isArabic 
                ? 'شكراً لتواصلك معنا. إليك ردنا على استفسارك:'
                : 'Merci de nous avoir contactés. Voici notre réponse à votre demande:'
              }
            </Text>
          </Section>

          {/* Reply Content */}
          <Section style={replySection}>
            <Text style={replyContent}>
              {replyMessage}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Original Message Reference */}
          <Section style={originalSection}>
            <Text style={sectionTitle}>
              {isArabic ? 'رسالتك الأصلية:' : 'Votre message original:'}
            </Text>
            
            <Text style={originalSubjectText}>
              <strong>
                {isArabic ? 'الموضوع: ' : 'Sujet: '}
              </strong>
              {originalSubject}
            </Text>
            
            <Text style={originalMessageText}>
              {originalMessage}
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text style={contactText}>
              {isArabic 
                ? 'للمزيد من الاستفسارات، يمكنكم التواصل معنا:'
                : 'Pour toute question supplémentaire, vous pouvez nous contacter:'
              }
            </Text>
            
            <Text style={contactDetails}>
              🌐 <Link href="https://hapa.mr" style={link}>hapa.mr</Link><br />
              ✉️ <Link href="mailto:contact@hapa.mr" style={link}>contact@hapa.mr</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {isArabic 
                ? 'مع أطيب التحيات،'
                : 'Cordialement,'
              }
            </Text>
            <Text style={footerOrg}>
              <strong>
                {isArabic 
                  ? 'HAPA - الهيئة العليا للصحافة والإذاعة والتلفزيون'
                  : 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel'
                }
              </strong>
            </Text>
            <Text style={footerDisclaimer}>
              {isArabic 
                ? 'هذا رد رسمي من HAPA على رسالتك'
                : 'Ceci est une réponse officielle de HAPA à votre message'
              }
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Clean, professional styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#019851',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const logo = {
  margin: '0 auto',
  filter: 'brightness(0) invert(1)',
}

const section = {
  padding: '0 24px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '24px 0 12px',
}

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 24px',
}

const replySection = {
  backgroundColor: '#f8fafc',
  margin: '0 24px 24px',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const replyContent = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#1f2937',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const originalSection = {
  padding: '0 24px',
}

const sectionTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const originalSubjectText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 8px',
}

const originalMessageText = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 24px',
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '4px',
  whiteSpace: 'pre-wrap' as const,
}

const contactSection = {
  padding: '0 24px',
}

const contactText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 12px',
}

const contactDetails = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 24px',
  lineHeight: '20px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const link = {
  color: '#019851',
  textDecoration: 'none',
}

const footer = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '0 0 8px 8px',
}

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
}

const footerOrg = {
  fontSize: '14px',
  color: '#1f2937',
  margin: '0 0 16px',
}

const footerDisclaimer = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic' as const,
  margin: '0',
}

export default SimpleReplyEmail