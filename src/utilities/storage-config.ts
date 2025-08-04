/**
 * Storage configuration - Cloudflare R2 only
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 only, no fallback
 * Files are organized via custom filename patterns:
 * - Form uploads: form_{type}_{timestamp}_{index}.ext → uploads/
 * - General media: {sanitized_name}.ext → uploads/
 * Organization is achieved through filename prefixes rather than folder structure
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
      return s3Storage({
        collections: {
          media: {
            disableLocalStorage: true,
            // Use a simple prefix for now - we'll organize via filename
            prefix: 'uploads/',
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