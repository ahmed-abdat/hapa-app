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

    // Update the emailSent flag - try the absolute minimal approach
    try {
      // First, just try updating the boolean flag alone
      await payload.update({
        collection: "contact-submissions",
        id: submissionId,
        data: {
          emailSent: true,
        },
        depth: 0, // No relationships
        overrideAccess: true,
      });
      
      console.log("[send-reply] Successfully updated emailSent flag for submission:", submissionId);
      
      // If the first update succeeded, try to add the timestamp separately
      try {
        await payload.update({
          collection: "contact-submissions",
          id: submissionId,
          data: {
            emailSentAt: new Date().toISOString(),
          },
          depth: 0,
          overrideAccess: true,
        });
        console.log("[send-reply] Successfully updated emailSentAt timestamp");
      } catch (timestampError) {
        console.warn("[send-reply] Failed to update timestamp but emailSent flag was set:", timestampError);
      }
      
    } catch (updateError) {
      // Log the detailed error for debugging
      console.error("[send-reply] Failed to update emailSent flag after sending email:", updateError);
      console.error("[send-reply] Stack trace:", updateError instanceof Error ? updateError.stack : 'No stack trace');
      
      // Check if it's specifically a stack overflow
      if (updateError instanceof RangeError && updateError.message.includes('Maximum call stack size exceeded')) {
        console.error("[send-reply] STACK OVERFLOW detected in database update operation");
        console.error("[send-reply] This suggests a circular reference in the data or collection hooks");
      }
      
      // Email was sent successfully, so don't fail the entire operation
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
