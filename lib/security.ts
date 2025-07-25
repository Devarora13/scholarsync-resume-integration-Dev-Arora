import crypto from "crypto"

import type { NextRequest } from "next/server"

// Security configuration
const SECURITY_CONFIG = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  allowedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB for file uploads
  allowedFileTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  bruteForceThreshold: 5, // Max failed attempts
  bruteForceWindow: 15 * 60 * 1000, // 15 minutes
}

// Store for tracking security events
const securityStore = new Map<
  string,
  {
    failedAttempts: number
    lastFailure: number
    suspiciousActivity: number
    blockedUntil?: number
  }
>()

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/[^\s<>"{}|\\^`[\]]+$/,
  filename: /^[^<>:"|\\*?\/\x00-\x1f]+$/, // Allow most chars but block dangerous ones
  scholarUrl: /^https:\/\/scholar\.google\.[a-z]{2,}\/citations\?user=[a-zA-Z0-9\-_]+/,
}

export interface SecurityResult {
  success: boolean
  error?: string
  code?: string
}

export class SecurityValidator {
  private static getClientId(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") || // Cloudflare
      "anonymous"
    )
  }

  // CORS validation
  static validateCORS(request: NextRequest): SecurityResult {
    const origin = request.headers.get("origin")

    if (!origin) {
      // Allow requests without origin (same-origin, mobile apps, etc.)
      return { success: true }
    }

    if (SECURITY_CONFIG.allowedOrigins.includes(origin)) {
      return { success: true }
    }

    return {
      success: false,
      error: "CORS policy violation: Origin not allowed",
      code: "CORS_VIOLATION",
    }
  }

  // Content-Type validation
  static validateContentType(request: NextRequest): SecurityResult {
    const contentType = request.headers.get("content-type")

    if (request.method === "GET") {
      return { success: true }
    }

    // Allow both JSON and multipart/form-data for file uploads
    const allowedContentTypes = [
      "application/json",
      "multipart/form-data"
    ]

    if (!contentType) {
      return {
        success: false,
        error: "Content-Type header is required",
        code: "MISSING_CONTENT_TYPE",
      }
    }

    // Check if content type matches any allowed type
    const isValidContentType = allowedContentTypes.some(allowedType => 
      contentType.includes(allowedType)
    )

    if (!isValidContentType) {
      return {
        success: false,
        error: "Invalid content type. Expected application/json or multipart/form-data",
        code: "INVALID_CONTENT_TYPE",
      }
    }

    return { success: true }
  }

  // Request size validation
  static validateRequestSize(request: NextRequest): SecurityResult {
    const contentLength = request.headers.get("content-length")

    if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.maxRequestSize) {
      return {
        success: false,
        error: "Request too large",
        code: "REQUEST_TOO_LARGE",
      }
    }

    return { success: true }
  }

  // Input sanitization and validation
  static sanitizeInput(input: any): any {
    if (typeof input === "string") {
      // Remove potentially dangerous characters
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim()
        .slice(0, 10000) // Limit string length
    }

    if (Array.isArray(input)) {
      return input.slice(0, 100).map((item) => this.sanitizeInput(item)) // Limit array size
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {}
      let fieldCount = 0

      for (const [key, value] of Object.entries(input)) {
        if (fieldCount >= 50) break // Limit object fields

        const cleanKey = key.replace(/[^\w-]/g, "").slice(0, 100)
        if (cleanKey) {
          sanitized[cleanKey] = this.sanitizeInput(value)
          fieldCount++
        }
      }

      return sanitized
    }

    return input
  }

  // Validate specific data types
  static validateData(data: any): SecurityResult {
    try {
      // Check for null or undefined
      if (!data) {
        return {
          success: false,
          error: "No data provided",
          code: "NO_DATA",
        }
      }

      // Validate Scholar URL if provided
      if (data.scholarUrl && !VALIDATION_PATTERNS.scholarUrl.test(data.scholarUrl)) {
        return {
          success: false,
          error: "Invalid Google Scholar URL format",
          code: "INVALID_SCHOLAR_URL",
        }
      }

      // Validate file data if provided
      if (data.file) {
        if (data.file.size > SECURITY_CONFIG.maxFileSize) {
          return {
            success: false,
            error: "File too large. Maximum size is 5MB",
            code: "FILE_TOO_LARGE",
          }
        }

        if (!SECURITY_CONFIG.allowedFileTypes.includes(data.file.type)) {
          return {
            success: false,
            error: "Invalid file type. Only PDF, DOCX, and TXT files are allowed",
            code: "INVALID_FILE_TYPE",
          }
        }
      }

      return { success: true }
    } catch {
      return {
        success: false,
        error: "Data validation failed",
        code: "VALIDATION_ERROR",
      }
    }
  }

  // Brute force protection
  static checkBruteForce(request: NextRequest): SecurityResult {
    const clientId = this.getClientId(request)
    const now = Date.now()
    const entry = securityStore.get(clientId)

    if (!entry) {
      return { success: true }
    }

    // Check if client is currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        success: false,
        error: "Too many failed attempts. Please try again later",
        code: "RATE_LIMITED",
      }
    }

    // Clean up expired entries
    if (entry.lastFailure < now - SECURITY_CONFIG.bruteForceWindow) {
      securityStore.delete(clientId)
      return { success: true }
    }

    return { success: true }
  }

  // Record security events
  static recordFailure(request: NextRequest, reason: string): void {
    const clientId = this.getClientId(request)
    const now = Date.now()
    const entry = securityStore.get(clientId) || {
      failedAttempts: 0,
      lastFailure: 0,
      suspiciousActivity: 0,
    }

    entry.failedAttempts++
    entry.lastFailure = now

    // Block if too many failures
    if (entry.failedAttempts >= SECURITY_CONFIG.bruteForceThreshold) {
      entry.blockedUntil = now + SECURITY_CONFIG.bruteForceWindow
    }

    securityStore.set(clientId, entry)

    // Log security event
    console.warn(`Security event: ${reason} from ${clientId}`, {
      clientId,
      failedAttempts: entry.failedAttempts,
      timestamp: new Date().toISOString(),
    })
  }

  // Generate request signature for integrity
  static generateSignature(data: string): string {
    return crypto
      .createHash("sha256")
      .update(data + (process.env.APP_SECRET || "default-secret"))
      .digest("hex")
  }

  // Comprehensive security check
  static async validateRequest(request: NextRequest, data?: any): Promise<SecurityResult> {
    // Check brute force protection
    const bruteForceCheck = this.checkBruteForce(request)
    if (!bruteForceCheck.success) {
      return bruteForceCheck
    }

    // Validate CORS
    const corsCheck = this.validateCORS(request)
    if (!corsCheck.success) {
      this.recordFailure(request, "CORS violation")
      return corsCheck
    }

    // Validate content type
    const contentTypeCheck = this.validateContentType(request)
    if (!contentTypeCheck.success) {
      this.recordFailure(request, "Invalid content type")
      return contentTypeCheck
    }

    // Validate request size
    const sizeCheck = this.validateRequestSize(request)
    if (!sizeCheck.success) {
      this.recordFailure(request, "Request too large")
      return sizeCheck
    }

    // Validate data if provided
    if (data) {
      const dataCheck = this.validateData(data)
      if (!dataCheck.success) {
        this.recordFailure(request, "Invalid data")
        return dataCheck
      }
    }

    return { success: true }
  }
}

// Enhanced rate limiting with different tiers
export class EnhancedRateLimit {
  private static limits = {
    upload: { requests: 5, window: 60000 }, // 5 uploads per minute
    parse: { requests: 10, window: 60000 }, // 10 parse requests per minute
    scholar: { requests: 3, window: 60000 }, // 3 scholar requests per minute (external API)
    suggestions: { requests: 20, window: 60000 }, // 20 suggestion requests per minute
    default: { requests: 50, window: 60000 }, // 50 general requests per minute
  }

  private static store = new Map<string, Map<string, { count: number; resetTime: number }>>()

  static async checkLimit(
    request: NextRequest,
    type: "upload" | "parse" | "scholar" | "suggestions" | "default" = "default"
  ): Promise<{ success: boolean; remaining: number; resetTime?: number }> {
    const clientId =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "anonymous"

    const limit = this.limits[type]
    const now = Date.now()
    const windowStart = now - limit.window

    // Get or create client store
    if (!this.store.has(clientId)) {
      this.store.set(clientId, new Map())
    }
    const clientStore = this.store.get(clientId)!

    // Clean up old entries
    for (const [key, value] of clientStore.entries()) {
      if (value.resetTime < windowStart) {
        clientStore.delete(key)
      }
    }

    const current = clientStore.get(type)

    if (!current) {
      clientStore.set(type, { count: 1, resetTime: now + limit.window })
      return { success: true, remaining: limit.requests - 1 }
    }

    if (current.resetTime < now) {
      clientStore.set(type, { count: 1, resetTime: now + limit.window })
      return { success: true, remaining: limit.requests - 1 }
    }

    if (current.count >= limit.requests) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      }
    }

    current.count++
    return { success: true, remaining: limit.requests - current.count }
  }
}
