/**
 * Production-ready rate limiting utilities
 * Supports both in-memory and Redis-based rate limiting
 */

import { logger } from '@/utilities/logger'

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string // Custom key generation
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitEntry {
  count: number
  windowStart: number
  lastRequest: number
  successCount?: number
  failedCount?: number
}

/**
 * In-memory rate limiter implementation
 * For production, consider using Redis for distributed rate limiting
 */
export class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor(private config: RateLimitConfig) {
    // Clean up expired entries every window duration
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, config.windowMs)
  }

  /**
   * Check if request is allowed under rate limit
   */
  check(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry) {
      // First request
      this.store.set(key, {
        count: 1,
        windowStart: now,
        lastRequest: now,
        successCount: 0,
        failedCount: 0
      })

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Reset window if expired
    if (now - entry.windowStart >= this.config.windowMs) {
      this.store.set(key, {
        count: 1,
        windowStart: now,
        lastRequest: now,
        successCount: 0,
        failedCount: 0
      })

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const resetTime = entry.windowStart + this.config.windowMs
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter
      }
    }

    // Update count
    entry.count++
    entry.lastRequest = now
    this.store.set(key, entry)

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.windowStart + this.config.windowMs
    }
  }

  /**
   * Record request result (success/failure)
   */
  recordResult(identifier: string, success: boolean): void {
    if (this.config.skipSuccessfulRequests && success) return
    if (this.config.skipFailedRequests && !success) return

    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const entry = this.store.get(key)

    if (entry) {
      if (success) {
        entry.successCount = (entry.successCount || 0) + 1
      } else {
        entry.failedCount = (entry.failedCount || 0) + 1
      }
      this.store.set(key, entry)
    }
  }

  /**
   * Get current stats for an identifier
   */
  getStats(identifier: string): RateLimitEntry | null {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    return this.store.get(key) || null
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    this.store.delete(key)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart >= this.config.windowMs) {
        this.store.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      logger.log(`🧹 Rate limiter cleaned up ${cleanedCount} expired entries`)
    }
  }

  /**
   * Get store size (for monitoring)
   */
  getStoreSize(): number {
    return this.store.size
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

/**
 * Factory function to create rate limiters for different use cases
 */
export function createRateLimiter(config: RateLimitConfig): InMemoryRateLimiter {
  return new InMemoryRateLimiter(config)
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for form submissions
   */
  formSubmission: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 submissions per 15 minutes
    keyGenerator: (ip) => `form_submission:${ip}`,
  }),

  /**
   * More lenient rate limiter for file uploads
   */
  fileUpload: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 uploads per 5 minutes
    keyGenerator: (ip) => `file_upload:${ip}`,
  }),

  /**
   * API rate limiter
   */
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (ip) => `api:${ip}`,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  }),

  /**
   * Authentication rate limiter (stricter for failed attempts)
   */
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes
    keyGenerator: (ip) => `auth:${ip}`,
    skipSuccessfulRequests: true, // Only count failed attempts
  }),
}

/**
 * Express/Next.js middleware helper
 */
export function createRateLimitMiddleware(limiter: InMemoryRateLimiter) {
  return (identifier: string) => {
    const result = limiter.check(identifier)
    
    if (!result.allowed) {
      logger.warn('🚫 Rate limit exceeded', {
        identifier,
        limit: result.limit,
        retryAfter: result.retryAfter
      })
    }

    return result
  }
}

/**
 * Helper to extract client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for deployments behind proxies)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown'
  
  return clientIP.trim()
}

/**
 * Redis-based rate limiter (for production environments)
 * Requires Redis connection - this is a blueprint/interface
 */
export interface RedisRateLimiter {
  check(identifier: string): Promise<RateLimitResult>
  recordResult(identifier: string, success: boolean): Promise<void>
  reset(identifier: string): Promise<void>
  getStats(identifier: string): Promise<RateLimitEntry | null>
}

/**
 * Production-ready rate limiting function
 */
export async function checkRateLimit(
  identifier: string,
  limiterType: keyof typeof rateLimiters = 'formSubmission'
): Promise<RateLimitResult> {
  const limiter = rateLimiters[limiterType]
  return limiter.check(identifier)
}