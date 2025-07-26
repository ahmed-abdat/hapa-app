/**
 * Custom R2 client configuration with SSL handling
 */

import { S3Client } from '@aws-sdk/client-s3'
import https from 'https'

// R2 requires custom SSL handling for development compatibility
// This is necessary because R2 sometimes has SSL certificate issues in development
const isR2DevMode = process.env.NODE_ENV !== 'production'

if (isR2DevMode) {
  console.log('🔧 R2 configured for development with relaxed SSL validation')
}

// Create optimized HTTPS agent for R2 with enhanced performance and security
const httpsAgent = new https.Agent({
  // Enhanced SSL verification - always validate in production
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  
  // Connection optimization for high performance
  maxSockets: process.env.NODE_ENV === 'production' ? 50 : 25,
  maxFreeSockets: 10, // Keep more sockets open for reuse
  keepAlive: true,
  keepAliveMsecs: 30000, // Keep alive for 30 seconds
  timeout: 45000, // Increased timeout for large file operations
  
  // Enhanced timeout handling (commented out - not supported in this version)
  // freeSocketTimeout: 15000, // Close unused sockets after 15s
  
  // SSL optimization for R2 endpoints
  servername: process.env.R2_ACCOUNT_ID ? `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  
  // Development-only SSL bypass with proper security boundary
  checkServerIdentity: process.env.NODE_ENV === 'production' 
    ? undefined 
    : () => undefined,
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
    
    // Enhanced S3 client configuration
    forcePathStyle: true,
    maxAttempts: 5, // Increased retries for better reliability
    retryMode: 'adaptive', // AWS SDK adaptive retry mode
    
    // Performance-optimized request handling
    requestHandler: {
      httpsAgent,
      requestTimeout: 60000, // Increased for large file operations
      connectionTimeout: 15000, // Better cold start handling
    },
    
    // Client-side configuration optimizations (commented out - not supported)
    // clientConfig: {
    //   region: 'auto',
    //   // Disable unnecessary AWS features for R2
    //   disableHostPrefix: true,
    // }
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
    
    // Enhanced configuration matching the main client
    forcePathStyle: true,
    maxAttempts: 5, // Increased retries for reliability
    retryMode: 'adaptive', // Adaptive retry mode for better error handling
    
    // Performance-optimized request handling
    requestHandler: {
      httpsAgent,
      requestTimeout: 60000, // Increased for large file operations
      connectionTimeout: 15000, // Better cold start handling
    },
    
    // Client-side optimizations
    clientConfig: {
      region: 'auto',
      disableHostPrefix: true, // Disable unnecessary AWS features for R2
    }
  }
}