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

interface ContactFormEmailProps {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  locale: 'fr' | 'ar'
  submittedAt: string
}

export const ContactFormNotificationEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  phone,
  subject,
  message,
  locale,
  submittedAt,
}) => {
  const isArabic = locale === 'ar'
  
  return (
    <Html dir={isArabic ? 'rtl' : 'ltr'}>
      <Head />
      <Preview>
        {isArabic 
          ? `رسالة جديدة من ${name} - ${subject}`
          : `Nouveau message de ${name} - ${subject}`
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with HAPA branding */}
          <Section style={header}>
            <Img
              src="https://hapa.mr/logo_hapa1.png"
              width="120"
              height="40"
              alt="HAPA"
              style={logo}
            />
          </Section>

          {/* Title */}
          <Heading style={h1}>
            {isArabic ? '📧 رسالة اتصال جديدة' : '📧 Nouveau Message de Contact'}
          </Heading>

          {/* Contact Information Card */}
          <Section style={card}>
            <Text style={cardTitle}>
              {isArabic ? 'معلومات المرسل' : 'Informations de l\'expéditeur'}
            </Text>
            
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>
                    {isArabic ? 'الاسم:' : 'Nom:'}
                  </td>
                  <td style={valueCell}>
                    <strong>{name}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>
                    {isArabic ? 'البريد الإلكتروني:' : 'Email:'}
                  </td>
                  <td style={valueCell}>
                    <Link href={`mailto:${email}`} style={link}>
                      {email}
                    </Link>
                  </td>
                </tr>
                {phone && (
                  <tr>
                    <td style={labelCell}>
                      {isArabic ? 'الهاتف:' : 'Téléphone:'}
                    </td>
                    <td style={valueCell} dir="ltr">
                      <Link href={`tel:${phone}`} style={link}>
                        {phone}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>
                    {isArabic ? 'التاريخ:' : 'Date:'}
                  </td>
                  <td style={valueCell}>
                    {new Date(submittedAt).toLocaleString(isArabic ? 'ar-MR' : 'fr-MR')}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Subject */}
          <Section style={card}>
            <Text style={cardTitle}>
              {isArabic ? 'الموضوع' : 'Sujet'}
            </Text>
            <Text style={subjectText}>{subject}</Text>
          </Section>

          {/* Message */}
          <Section style={card}>
            <Text style={cardTitle}>
              {isArabic ? 'الرسالة' : 'Message'}
            </Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          {/* Action Buttons */}
          <Section style={buttonContainer}>
            <Link
              href="https://hapa.mr/admin/collections/form-submissions"
              style={button}
            >
              {isArabic ? 'عرض في لوحة التحكم' : 'Voir dans le tableau de bord'}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {isArabic 
                ? 'هذا البريد الإلكتروني تم إرساله تلقائياً من نظام HAPA'
                : 'Cet email a été envoyé automatiquement depuis le système HAPA'
              }
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} HAPA - Haute Autorité de la Presse et de l&apos;Audiovisuel
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

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
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#019851',
  padding: '24px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  filter: 'brightness(0) invert(1)', // Makes logo white
}

const h1 = {
  color: '#019851',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '16px 20px',
  textAlign: 'center' as const,
}

const card = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 20px 16px',
  border: '1px solid #e5e7eb',
}

const cardTitle = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '12px',
}

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const labelCell = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  width: '140px',
  verticalAlign: 'top' as const,
}

const valueCell = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
  verticalAlign: 'top' as const,
}

const subjectText = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const messageText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '0 20px',
}

const button = {
  backgroundColor: '#019851',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const link = {
  color: '#019851',
  textDecoration: 'none',
}

const footer = {
  padding: '0 20px',
  marginTop: '32px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '8px 0',
}

export default ContactFormNotificationEmail