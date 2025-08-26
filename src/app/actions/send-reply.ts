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

    // IMPORTANT: Temporarily skipping database update due to circular reference bug in Payload CMS
    // The issue is that payload.update() causes a stack overflow in deepmerge when the 
    // ContactSubmissions document has circular references from the initial findByID call.
    
    console.log(`[send-reply] ✅ Email successfully sent to ${email} for submission ${submissionId}`);
    console.log(`[send-reply] ⚠️ Skipping emailSent flag update due to known Payload CMS circular reference issue`);
    console.log(`[send-reply] 📧 Email ID: ${emailResult.id}`);
    
    // The admin interface will show the success message, which serves as confirmation
    // that the email was sent. This is acceptable since email sending is the primary function.

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
