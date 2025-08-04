/**
 * Storage configuration - Cloudflare R2 only
 * SIMPLE FIX: Revert to original working configuration
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 only, no fallback
 * Let Media.ts hook handle ALL path organization
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
            // CRITICAL: No prefix here - let Media collection hook handle it
            // This allows Media.ts to organize files by type: images/, docs/, videos/, audio/
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