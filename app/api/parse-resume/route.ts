import { type NextRequest, NextResponse } from "next/server"

import { ResumeParser } from "@/lib/resume-parser"
import { SecurityValidator, EnhancedRateLimit } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    // Enhanced security and rate limiting
    const securityCheck = await SecurityValidator.validateRequest(request)
    if (!securityCheck.success) {
      return NextResponse.json(
        { error: securityCheck.error },
        { status: securityCheck.code === "RATE_LIMITED" ? 429 : 403 }
      )
    }

    const rateLimitResult = await EnhancedRateLimit.checkLimit(request, "parse")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many parsing requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime?.toString() || "",
          },
        }
      )
    }

    // Parse form data securely
    let formData
    try {
      formData = await request.formData()
    } catch {
      SecurityValidator.recordFailure(request, "Invalid form data")
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const file = formData.get("resume") as File

    if (!file) {
      SecurityValidator.recordFailure(request, "No file uploaded")
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Enhanced file validation
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      SecurityValidator.recordFailure(request, "Invalid file type")
      return NextResponse.json(
        {
          error: "Invalid file type. Please upload PDF, DOCX, or TXT files only.",
        },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      SecurityValidator.recordFailure(request, "File too large")
      return NextResponse.json(
        {
          error: "File size too large. Maximum size is 5MB.",
        },
        { status: 400 }
      )
    }

    // Validate file name
    if (file.name.length > 255 || !/^[a-zA-Z0-9\-_.\s]+$/.test(file.name)) {
      SecurityValidator.recordFailure(request, "Invalid filename")
      return NextResponse.json(
        {
          error: "Invalid filename. Use only alphanumeric characters, hyphens, underscores, and dots.",
        },
        { status: 400 }
      )
    }

    // Parse the resume using our real parser
    const parsedData = await ResumeParser.parseFile(file)

    // Sanitize parsed data
    const sanitizedData = SecurityValidator.sanitizeInput(parsedData)

    console.log("Parsed Resume Data:", sanitizedData)

    // Add security headers to response
    const response = NextResponse.json(sanitizedData)
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())

    return response
  } catch (error) {
    console.error("Resume parsing error:", error)
    SecurityValidator.recordFailure(request, "Parsing failed")

    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ error: "Resume parsing failed. Please try a different file." }, { status: 500 })
    }

    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
