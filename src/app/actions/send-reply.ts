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

interface SendReplyResult {
  success: boolean;
  message?: string;
  error?: string;
  emailId?: string;
}

export async function sendReplyAction(options: SendReplyOptions): Promise<SendReplyResult> {
  const { submissionId, replyMessage, subject, useEnhancedTemplate = true } = options;
  
  try {
    // Check for required environment variables
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return {
        success: false,
        error: "Email service is not configured. Please contact the administrator.",
      };
    }

    const payload = await getPayload({ config });

    // Get the contact submission
    let submission;
    try {
      submission = await payload.findByID({
        collection: "contact-submissions",
        id: submissionId,
        depth: 0, // Prevent deep population that might cause circular references
      });
    } catch (dbError) {
      return {
        success: false,
        error: "Failed to retrieve submission from database",
      };
    }

    if (!submission) {
      return {
        success: false,
        error: "Soumission introuvable",
      };
    }

    // Extract only the needed fields to avoid circular references with defensive null checks
    const { 
      email = '', 
      name = 'User', 
      subject: originalSubject = '', 
      message: originalMessage = '', 
      preferredLanguage, 
      locale: submissionLocale 
    } = submission || {};
    
    // Validate required fields
    if (!email) {
      return {
        success: false,
        error: "No email address found for this submission",
      };
    }
    
    const locale = preferredLanguage || submissionLocale || "fr";
    
    // Use plain text message
    const emailContent = replyMessage;
    
    // Render enhanced or simple email template based on preference
    let html: string;
    try {
      html = await render(
        useEnhancedTemplate
          ? createElement(EnhancedReplyEmail, {
              userName: name,
              subject: originalSubject || "Votre demande",
              message: emailContent,
              locale: locale as 'fr' | 'ar',
              includeFooter: true,
            })
          : createElement(SimpleReplyEmail, {
              userName: name,
              userEmail: email,
              originalSubject: originalSubject,
              originalMessage: originalMessage || "",
              replyMessage: emailContent,
              locale: locale,
            })
      );
    } catch (renderError) {
      return {
        success: false,
        error: "Failed to render email template. Please try again or use a different template.",
      };
    }

    // Determine email subject
    const emailSubject = subject || (
      locale === "ar"
        ? `رد من HAPA: ${originalSubject}`
        : `Réponse HAPA: ${originalSubject}`
    );

    // Send email using direct Resend API
    
    const emailPayload = {
      from: `${process.env.EMAIL_FROM_NAME || 'HAPA Support'} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: emailSubject,
      html: html,
    };
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Email API failed: ${emailResult.message || emailResult.error || 'Unknown error'}`);
    }

    // Try the absolute simplest update possible to avoid deepmerge issues
    try {
      // Just update the emailSent flag, nothing else
      await payload.update({
        collection: "contact-submissions",
        id: submissionId,
        data: {
          emailSent: true,
          emailSentAt: new Date().toISOString(), // Back to ISO string as the field expects string
        },
        depth: 0,
        overrideAccess: true, // Allow server action to update without user context
      });
    } catch (updateError) {
      // Log for monitoring but don't fail the operation since email was sent
      console.error("[send-reply] Failed to update emailSent flag after sending email:", updateError);
    }

    return {
      success: true,
      message: locale === "ar"
        ? "تم إرسال الرد بنجاح"
        : "Réponse envoyée avec succès",
      emailId: emailResult.id, // Include the Resend email ID for tracking
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while sending email",
    };
  }
}
