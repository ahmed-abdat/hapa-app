'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createContactFormSchema } from '@/components/CustomForms/schemas'
import type { FormSubmissionResponse } from '@/components/CustomForms/types'
import { render } from '@react-email/render'
import ContactFormNotificationEmail from '@/emails/contact-form-notification'

export async function submitContactForm(data: any): Promise<FormSubmissionResponse> {
  try {
    // Validate with locale-specific schema
    const locale = data.locale || 'fr'
    const schema = createContactFormSchema(locale)
    const validatedData = schema.parse(data)
    
    // Get Payload instance
    const payload = await getPayload({ config })
    
    // Create form submission in database
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        formType: validatedData.formType,
        status: 'pending',
        locale: validatedData.locale,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || '',
        subject: validatedData.subject,
        message: validatedData.message,
        submittedAt: new Date().toISOString(),
      }
    })
    
    // Send email notification using React Email template
    try {
      const html = await render(ContactFormNotificationEmail({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        locale: validatedData.locale,
        submittedAt: new Date().toISOString()
      }))
      
      await payload.sendEmail({
        to: 'admin@hapa.mr',
        subject: locale === 'ar' 
          ? `رسالة اتصال جديدة: ${validatedData.subject}`
          : `Nouveau message de contact: ${validatedData.subject}`,
        html: html
      })
    } catch (emailError) {
      // Log email error but don't fail the submission
      console.error('Email notification failed:', emailError)
    }
    
    return {
      success: true,
      message: locale === 'ar' 
        ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.'
        : 'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
      submissionId: String(submission.id)
    }
    
  } catch (error) {
    console.error('Form submission error:', error)
    
    return {
      success: false,
      message: data.locale === 'ar'
        ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
        : 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
      errors: { general: error instanceof Error ? [error.message] : ['Unknown error'] }
    }
  }
}