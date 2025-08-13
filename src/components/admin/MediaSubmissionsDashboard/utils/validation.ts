/**
 * Security and validation utilities for the media submissions dashboard
 * Provides input validation, URL sanitization, and type guards
 */

import type { MediaContentSubmission } from "@/payload-types";

/**
 * Validates if a URL is safe for file operations
 * Prevents XSS and ensures URLs are from trusted sources
 */
export function validateFileUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Allow only HTTPS in production, HTTP only for localhost in development
    const isSecureProtocol = parsedUrl.protocol === 'https:' || 
      (process.env.NODE_ENV === 'development' && parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost');
    
    if (!isSecureProtocol) {
      return false;
    }

    // Allow trusted domains only
    const trustedDomains = [
      'localhost',
      process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, ''),
      // Add Cloudflare R2 domain
      process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/^https?:\/\//, ''),
      // Add any other trusted file storage domains
    ].filter(Boolean);

    return trustedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates and sanitizes submission status values
 */
export function validateSubmissionStatus(status: string): MediaContentSubmission["submissionStatus"] | null {
  const validStatuses: MediaContentSubmission["submissionStatus"][] = [
    "pending", "reviewing", "resolved", "dismissed"
  ];
  
  return validStatuses.includes(status as MediaContentSubmission["submissionStatus"]) 
    ? (status as MediaContentSubmission["submissionStatus"])
    : null;
}

/**
 * Validates and sanitizes priority values
 */
export function validatePriority(priority: string): MediaContentSubmission["priority"] | null {
  if (priority === "" || priority === "none" || priority === "null" || priority === "undefined") {
    return null;
  }
  
  const validPriorities: NonNullable<MediaContentSubmission["priority"]>[] = [
    "low", "medium", "high", "urgent"
  ];
  
  return validPriorities.includes(priority as NonNullable<MediaContentSubmission["priority"]>) 
    ? (priority as NonNullable<MediaContentSubmission["priority"]>)
    : null;
}

/**
 * Sanitizes text content to prevent XSS attacks
 * Basic HTML escaping for text display
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Safely formats a date string with fallback
 */
export function safeFormatDate(dateString: string | Date | undefined, formatter: (date: Date) => string): string {
  if (!dateString) return "Date non disponible";
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    
    return formatter(date);
  } catch {
    return "Erreur de format de date";
  }
}

/**
 * Type guard to validate submission object structure
 */
export function isValidSubmission(submission: any): submission is MediaContentSubmission {
  return (
    submission &&
    (typeof submission.id === 'string' || typeof submission.id === 'number') &&
    typeof submission.submittedAt === 'string' &&
    ['pending', 'reviewing', 'resolved', 'dismissed'].includes(submission.submissionStatus) &&
    ['complaint', 'report'].includes(submission.formType)
  );
}

/**
 * Validates file object structure for safe operations
 */
export function isValidFileObject(file: any): boolean {
  return (
    file &&
    typeof file.filename === 'string' &&
    typeof file.url === 'string' &&
    typeof file.mimeType === 'string' &&
    typeof file.filesize === 'number' &&
    file.filename.length > 0 &&
    file.url.length > 0
  );
}

/**
 * Sanitizes filename for display (removes path traversal attempts)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\.{2,}/g, '.') // Remove path traversal attempts
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255); // Limit length
}