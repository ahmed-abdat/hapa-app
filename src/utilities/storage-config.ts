/**
 * Storage configuration - Cloudflare R2 only
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 only, no fallback
 */
/**
 * Get form-specific prefix for organized R2 storage
 */
function getFormPrefix(filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  
  // Detect file type and form context from filename or request context
  const isScreenshot = filename.toLowerCase().includes('screenshot') || filename.toLowerCase().includes('capture')
  const isAttachment = !isScreenshot
  
  const fileType = isScreenshot ? 'screenshots' : 'attachments'
  
  // Default to forms folder with date organization
  return `forms/media-submissions/${year}/${month}/${fileType}/`
}

export function getStorageConfig() {
  const useR2 = Boolean(
    process.env.R2_ACCESS_KEY_ID && 
    process.env.R2_SECRET_ACCESS_KEY && 
    process.env.R2_BUCKET_NAME && 
    process.env.R2_ACCOUNT_ID
  )
  
  if (useR2) {
    try {
      return s3Storage({
        collections: {
          media: {
            disableLocalStorage: true,
            prefix: ({ filename }) => {
              // Check if this is a form upload based on filename pattern
              if (filename && (filename.includes('form_screenshot_') || filename.includes('form_attachment_'))) {
                return getFormPrefix(filename)
              }
              // General media (CMS uploads) go in media folder
              return 'media/general/'
            },
          },
        },
        config: getR2StorageConfig(),
        bucket: process.env.R2_BUCKET_NAME || '',
        disableLocalStorage: true,
      })
    } catch (error) {
      // R2 Storage initialization failed
      throw error // Fail fast if R2 is not configured properly
    }
  } else {
    // R2 Storage environment variables not configured
    throw new Error('R2 Storage not configured - deployment will fail')
  }
}