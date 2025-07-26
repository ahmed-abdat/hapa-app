/**
 * Storage configuration - Cloudflare R2 only
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 only, no fallback
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
            prefix: undefined, // Let the Media collection hook handle prefixes
          },
        },
        config: getR2StorageConfig(),
        bucket: process.env.R2_BUCKET_NAME || '',
        disableLocalStorage: true,
      })
    } catch (error) {
      console.error('R2 Storage initialization failed:', error instanceof Error ? error.message : error)
      throw error // Fail fast if R2 is not configured properly
    }
  } else {
    console.error('R2 Storage environment variables not configured. Required: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID')
    throw new Error('R2 Storage not configured - deployment will fail')
  }
}