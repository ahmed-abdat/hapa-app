'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render'
import { createElement } from 'react'
import SimpleReplyEmail from '@/emails/simple-reply'

export async function sendContactFormReply(submissionId: string, replyMessage: string) {
  try {
    const payload = await getPayload({ config })
    
    // Get the contact submission
    const submission = await payload.findByID({
      collection: 'contact-submissions',
      id: submissionId
    })
    
    if (!submission) {
      return {
        success: false,
        message: 'Soumission introuvable',
      }
    }
    
    // Render simple email template
    const html = await render(
      createElement(SimpleReplyEmail, {
        userName: submission.name,
        userEmail: submission.email,
        originalSubject: submission.subject,
        originalMessage: submission.message || '',
        replyMessage: replyMessage,
        locale: submission.locale || 'fr',
      })
    )
    
    // Send email
    await payload.sendEmail({
      to: submission.email,
      subject: submission.locale === 'ar' 
        ? `رد من HAPA: ${submission.subject}`
        : `Réponse HAPA: ${submission.subject}`,
      html: html
    })
    
    // Update submission record
    await payload.update({
      collection: 'contact-submissions',
      id: submissionId,
      data: {
        replyMessage: replyMessage,
        emailSent: true,
        emailSentAt: new Date().toISOString()
      }
    })
    
    return {
      success: true,
      message: submission.locale === 'ar' 
        ? 'تم إرسال الرد بنجاح'
        : 'Réponse envoyée avec succès',
    }
    
  } catch (error) {
    console.error('Reply email error:', error)
    
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de la réponse',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}