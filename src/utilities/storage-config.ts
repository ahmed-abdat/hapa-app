/**
 * Storage configuration - Cloudflare R2 only
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 only, no fallback
 * Files are organized hierarchically:
 * - Form uploads: forms/media-submissions/{year}/{month}/{type}/
 * - General media: media/general/
 * Organization achieved through static prefix configuration
 */

export function getStorageConfig() {
  const useR2 = Boolean(
    process.env.R2_ACCESS_KEY_ID && 
    process.env.R2_SECRET_ACCESS_KEY && 
    process.env.R2_BUCKET_NAME && 
    process.env.R2_ACCOUNT_ID
  )
  
  if (useR2) {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      
      return s3Storage({
        collections: {
          media: {
            disableLocalStorage: true,
            // Static prefix for form uploads - will be organized by custom filenames
            prefix: `forms/media-submissions/${year}/${month}/`,
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