import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { GoogleScholarScraper } from "@/lib/scholar-scraper"

// Fallback mock data for when scraping fails
const createFallbackData = (profileUrl: string) => ({
  name: "Scholar Profile",
  affiliation: "Institution not available",
  email: undefined,
  totalCitations: 0,
  hIndex: 0,
  i10Index: 0,
  researchInterests: ["Research interests not available"],
  publications: [{
    title: "Publications data temporarily unavailable",
    authors: "Please try again later or check if the profile is public",
    journal: "Note: Some profiles may be private or restricted",
    year: new Date().getFullYear().toString(),
    citations: 0
  }]
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const { profileUrl } = await request.json()

    if (!profileUrl) {
      return NextResponse.json({ error: "Profile URL is required" }, { status: 400 })
    }

    // Validate URL format
    if (!GoogleScholarScraper.isValidScholarUrl(profileUrl)) {
      return NextResponse.json({ error: "Invalid Google Scholar profile URL format" }, { status: 400 })
    }

    try {
      // Try to scrape the Google Scholar profile
      const scholarData = await GoogleScholarScraper.scrapeProfile(profileUrl)
      return NextResponse.json(scholarData)
    } catch (scrapingError) {
      console.warn("Scraping failed, using fallback data:", scrapingError)
      
      // If scraping fails due to blocking or other issues, return fallback data with a warning
      const fallbackData = createFallbackData(profileUrl)
      
      return NextResponse.json({
        ...fallbackData,
        warning: "Unable to fetch live data from Google Scholar. This may be due to rate limiting or privacy settings. The profile URL appears valid."
      })
    }

  } catch (error) {
    console.error("Scholar profile API error:", error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to process Google Scholar profile request" }, { status: 500 })
  }
}
