/**
 * Custom R2 client configuration with SSL handling
 */

import { S3Client } from '@aws-sdk/client-s3'
import https from 'https'

// Force disable SSL verification globally for R2 development
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  
  // Override global HTTPS agent for development
  https.globalAgent = new https.Agent({
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
    // Remove secureProtocol to allow automatic protocol negotiation
    maxSockets: Infinity,
  })
  
  // Global HTTPS agent overridden for R2 compatibility in development
}

// Create custom HTTPS agent with completely disabled SSL verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Completely disable SSL verification
  maxSockets: 25,
  keepAlive: false, // Disable keep-alive to avoid SSL session reuse issues
  timeout: 30000,
  checkServerIdentity: () => undefined, // Disable server identity check
  // Allow automatic TLS protocol negotiation instead of forcing specific version
})

/**
 * Get configured R2 client for Payload CMS
 */
export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 configuration missing: Check environment variables')
  }
  
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
    maxAttempts: 3,
    requestHandler: {
      httpsAgent,
      requestTimeout: 30000,
      connectionTimeout: 10000,
    },
  })
}

/**
 * R2 configuration for Payload CMS s3Storage plugin
 */
export function getR2StorageConfig() {
  return {
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
    maxAttempts: 3,
    requestHandler: {
      httpsAgent,
      requestTimeout: 30000,
      connectionTimeout: 10000,
    },
  }
}