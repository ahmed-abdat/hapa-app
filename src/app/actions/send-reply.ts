"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { render } from "@react-email/render";
import { createElement } from "react";
import SimpleReplyEmail from "@/emails/simple-reply";
import EnhancedReplyEmail from "@/emails/templates/enhanced-reply";

interface SendReplyOptions {
  submissionId: string;
  replyMessage: string;
  subject?: string;
  useEnhancedTemplate?: boolean;
}

export async function sendReplyAction(options: SendReplyOptions) {
  const { submissionId, replyMessage, subject, useEnhancedTemplate = true } = options;
  
  try {
    const payload = await getPayload({ config });

    // Get the contact submission
    const submission = await payload.findByID({
      collection: "contact-submissions",
      id: submissionId,
    });

    if (!submission) {
      return {
        success: false,
        error: "Soumission introuvable",
      };
    }

    const locale = submission.preferredLanguage || submission.locale || "fr";
    
    // Render enhanced or simple email template based on preference
    const html = await render(
      useEnhancedTemplate
        ? createElement(EnhancedReplyEmail, {
            userName: submission.name,
            subject: submission.subject || "Votre demande",
            message: replyMessage,
            locale: locale as 'fr' | 'ar',
            includeFooter: true,
          })
        : createElement(SimpleReplyEmail, {
            userName: submission.name,
            userEmail: submission.email,
            originalSubject: submission.subject,
            originalMessage: submission.message || "",
            replyMessage: replyMessage,
            locale: locale,
          })
    );

    // Determine email subject
    const emailSubject = subject || (
      locale === "ar"
        ? `رد من HAPA: ${submission.subject}`
        : `Réponse HAPA: ${submission.subject}`
    );

    // Send email using direct Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${process.env.EMAIL_FROM_NAME || 'HAPA Support'} <${process.env.EMAIL_FROM}>`,
        to: submission.email,
        subject: emailSubject,
        html: html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Email API failed: ${emailResult.message}`);
    }

    // Update submission record
    await payload.update({
      collection: "contact-submissions",
      id: submissionId,
      data: {
        replyMessage: replyMessage,
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        status: 'resolved', // Auto-update status when reply is sent
      },
    });

    return {
      success: true,
      message: locale === "ar"
        ? "تم إرسال الرد بنجاح"
        : "Réponse envoyée avec succès",
    };
  } catch (error) {
    console.error("Reply email error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Keep the old function for backward compatibility
export async function sendContactFormReply(
  submissionId: string,
  replyMessage: string
) {
  return sendReplyAction({
    submissionId,
    replyMessage,
    useEnhancedTemplate: false, // Use simple template for backward compatibility
  });
}
