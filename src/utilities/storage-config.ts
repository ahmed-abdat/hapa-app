/**
 * Storage configuration - Cloudflare R2 only
 */

import { s3Storage } from '@payloadcms/storage-s3'
import { getR2StorageConfig } from './r2-client'

/**
 * Get storage configuration - R2 primary, local fallback only
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
      console.warn('R2 Storage initialization failed, using Vercel Blob fallback:', error instanceof Error ? error.message : error)
      return null
    }
  } else {
    return null
  }
}