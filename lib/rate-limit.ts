import type { NextRequest } from "next/server"

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(request: NextRequest, limit = 10, windowMs = 60000) {
  const clientId =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(clientId)

  if (!current) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (current.resetTime < now) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0 }
  }

  current.count++
  return { success: true, remaining: limit - current.count }
}
