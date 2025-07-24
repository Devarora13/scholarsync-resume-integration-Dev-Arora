import { type NextRequest, NextResponse } from "next/server"

import { GoogleScholarScraper } from "@/lib/scholar-scraper"
import { SecurityValidator, EnhancedRateLimit } from "@/lib/security"

// Fallback mock data for when scraping fails
const createFallbackData = (_profileUrl: string) => ({
  name: "Scholar Profile",
  affiliation: "Institution not available",
  email: undefined,
  totalCitations: 0,
  hIndex: 0,
  i10Index: 0,
  researchInterests: ["Research interests not available"],
  publications: [
    {
      title: "Publications data temporarily unavailable",
      authors: "Please try again later or check if the profile is public",
      journal: "Note: Some profiles may be private or restricted",
      year: new Date().getFullYear().toString(),
      citations: 0,
    },
  ],
})

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

    // More restrictive rate limiting for external API calls
    const rateLimitResult = await EnhancedRateLimit.checkLimit(request, "scholar")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many Scholar requests. Please try again later.",
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

    // Parse and validate request body
    let requestData
    try {
      requestData = await request.json()
    } catch {
      SecurityValidator.recordFailure(request, "Invalid JSON")
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Sanitize input
    const sanitizedData = SecurityValidator.sanitizeInput(requestData)
    const { profileUrl } = sanitizedData

    if (!profileUrl) {
      SecurityValidator.recordFailure(request, "Missing profile URL")
      return NextResponse.json({ error: "Profile URL is required" }, { status: 400 })
    }

    // Validate URL format with enhanced security
    if (typeof profileUrl !== "string" || profileUrl.length > 500) {
      SecurityValidator.recordFailure(request, "Invalid URL format")
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    if (!GoogleScholarScraper.isValidScholarUrl(profileUrl)) {
      SecurityValidator.recordFailure(request, "Invalid Scholar URL")
      return NextResponse.json(
        {
          error: "Invalid Google Scholar profile URL format. Please provide a valid Scholar profile URL.",
        },
        { status: 400 }
      )
    }

    try {
      // Try to scrape the Google Scholar profile
      const scholarData = await GoogleScholarScraper.scrapeProfile(profileUrl)

      // Sanitize scraped data
      const sanitizedScholarData = SecurityValidator.sanitizeInput(scholarData)

      // Add security headers
      const response = NextResponse.json(sanitizedScholarData)
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())

      return response
    } catch (scrapingError) {
      console.warn("Scraping failed, using fallback data:", scrapingError)

      // If scraping fails due to blocking or other issues, return fallback data with a warning
      const fallbackData = createFallbackData(profileUrl)
      const sanitizedFallbackData = SecurityValidator.sanitizeInput(fallbackData)

      const response = NextResponse.json({
        ...sanitizedFallbackData,
        warning:
          "Unable to fetch live data from Google Scholar. This may be due to rate limiting or privacy settings. The profile URL appears valid.",
      })

      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())

      return response
    }
  } catch (error) {
    console.error("Scholar profile API error:", error)
    SecurityValidator.recordFailure(request, "Scholar API error")

    // Return sanitized error messages
    return NextResponse.json(
      {
        error: "Failed to process Google Scholar profile request. Please try again later.",
      },
      { status: 500 }
    )
  }
}
