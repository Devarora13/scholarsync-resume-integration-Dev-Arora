import * as cheerio from "cheerio"

interface ScholarPublication {
  title: string
  authors: string
  journal: string
  year: string
  citations: number
}

interface ScholarData {
  name: string
  affiliation: string
  email?: string
  totalCitations: number
  hIndex: number
  i10Index: number
  researchInterests: string[]
  publications: ScholarPublication[]
}

export class GoogleScholarScraper {
  private static readonly BASE_URL = "https://scholar.google.com"

  /**
   * Scrape Google Scholar profile data
   */
  static async scrapeProfile(profileUrl: string): Promise<ScholarData> {
    try {
      // Extract user ID from URL
      const userIdMatch = profileUrl.match(/user=([^&]+)/)
      if (!userIdMatch) {
        throw new Error("Invalid Google Scholar profile URL format")
      }

      const userId = userIdMatch[1]

      // Construct the profile URL
      const url = `${this.BASE_URL}/citations?user=${userId}&hl=en`

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fetch the page with retry mechanism
      let response: Response
      let retries = 3

      while (retries > 0) {
        try {
          response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            method: "GET",
          })

          if (response.ok) break

          if (response.status === 429) {
            // Rate limited, wait longer
            await new Promise((resolve) => setTimeout(resolve, 5000))
          }

          retries--
          if (retries === 0) {
            throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`)
          }

          await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (fetchError) {
          retries--
          if (retries === 0) {
            throw fetchError
          }
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      const html = await response!.text()

      // Check if we got blocked or redirected
      if (
        html.includes("Our systems have detected unusual traffic") ||
        html.includes("blocked") ||
        html.length < 1000
      ) {
        throw new Error("Google Scholar temporarily blocked this request. Please try again later.")
      }

      const $ = cheerio.load(html)

      // Extract profile information
      const profileData = this.extractProfileData($)

      // Validate that we got meaningful data
      if (!profileData.name || profileData.name === "Name not found") {
        throw new Error("Could not extract profile data. The profile might be private or the URL might be incorrect.")
      }

      return profileData
    } catch (error) {
      console.error("Error scraping Google Scholar profile:", error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error(
        "Failed to scrape Google Scholar profile. The profile might be private or the URL might be incorrect."
      )
    }
  }

  /**
   * Extract profile data from the parsed HTML
   */
  private static extractProfileData($: cheerio.CheerioAPI): ScholarData {
    console.log("Starting profile data extraction...")

    // Extract name
    const name = $("#gsc_prf_in").text().trim() || "Name not found"
    console.log("Extracted name:", name)

    // Extract affiliation
    const affiliation = $(".gsc_prf_il").first().text().trim() || "Affiliation not found"
    console.log("Extracted affiliation:", affiliation)

    // Extract email (if public)
    const email = $(".gsc_prf_il").eq(1).text().trim()
    const emailMatch = email.match(/verified email at (.+)/i)
    const extractedEmail = emailMatch ? emailMatch[1] : undefined
    console.log("Extracted email:", extractedEmail || "No public email found")

    // Extract citation metrics
    const citationStats = this.extractCitationStats($)
    console.log("Citation stats:", citationStats)

    // Extract research interests
    const researchInterests = this.extractResearchInterests($)
    console.log("Research interests:", researchInterests)

    // Extract publications
    const publications = this.extractPublications($)
    console.log("Publications found:", publications.length)
    console.log("First few publications:", publications.slice(0, 3))

    const profileData = {
      name,
      affiliation,
      email: extractedEmail,
      totalCitations: citationStats.totalCitations,
      hIndex: citationStats.hIndex,
      i10Index: citationStats.i10Index,
      researchInterests,
      publications,
    }

    console.log("Complete profile data extracted:", profileData)

    return profileData
  }

  /**
   * Extract citation statistics
   */
  private static extractCitationStats($: cheerio.CheerioAPI): {
    totalCitations: number
    hIndex: number
    i10Index: number
  } {
    const stats = {
      totalCitations: 0,
      hIndex: 0,
      i10Index: 0,
    }

    try {
      console.log(" Extracting citation statistics...")

      // Find the citation table
      const citationTable = $("#gsc_rsb_st")
      console.log("Citation table found:", citationTable.length > 0)

      const rows = citationTable.find("tr")
      console.log("Number of stat rows found:", rows.length)

      rows.each((index, row) => {
        const cells = $(row).find("td")
        if (cells.length >= 2) {
          const label = $(cells[0]).text().toLowerCase()
          const valueText = $(cells[1]).text().replace(/,/g, "")
          const value = parseInt(valueText) || 0

          console.log(`Row ${index}: "${label}" = "${valueText}" (parsed: ${value})`)

          if (label.includes("citations")) {
            stats.totalCitations = value
          } else if (label.includes("h-index")) {
            stats.hIndex = value
          } else if (label.includes("i10-index")) {
            stats.i10Index = value
          }
        }
      })

      console.log("Final citation stats:", stats)
    } catch (error) {
      console.error("Error extracting citation stats:", error)
    }

    return stats
  }

  /**
   * Extract research interests
   */
  private static extractResearchInterests($: cheerio.CheerioAPI): string[] {
    const interests: string[] = []
    try {
      const interestElements = $("#gsc_prf_int a.gs_ibl")
      interestElements.each((index, element) => {
        const interest = $(element).text().trim()
        if (interest.length > 0) {
          interests.push(interest)
        }
      })
    } catch (error) {
      console.error("Error extracting research interests:", error)
    }
    return interests
  }

  /**
   * Extract publications
   */
  private static extractPublications($: cheerio.CheerioAPI): ScholarPublication[] {
    const publications: ScholarPublication[] = []

    try {
      console.log("Extracting publications...")

      const publicationRows = $(".gsc_a_tr")
      console.log("Publication rows found:", publicationRows.length)

      publicationRows.each((index, row) => {
        if (index >= 20) return false // Limit to 20 publications

        const $row = $(row)

        // Extract title
        const titleElement = $row.find(".gsc_a_at")
        const title = titleElement.text().trim()

        if (!title) {
          console.log(`Row ${index}: No title found, skipping`)
          return
        }

        // Extract authors and journal info
        const authorsJournalElement = $row.find(".gs_gray").first()
        const authorsJournal = authorsJournalElement.text().trim()

        // Extract year
        const yearElement = $row.find(".gsc_a_y .gs_ibl")
        const year = yearElement.text().trim() || "Year not specified"

        // Extract citations
        const citationsElement = $row.find(".gsc_a_c .gs_ibl")
        const citationsText = citationsElement.text().trim()
        const citations = citationsText ? parseInt(citationsText) || 0 : 0

        // Parse authors and journal
        let authors = "Authors not specified"
        let journal = "Journal not specified"

        if (authorsJournal) {
          // Try to split authors and journal
          const parts = authorsJournal.split(" - ")
          if (parts.length >= 2) {
            authors = parts[0].trim()
            journal = parts.slice(1).join(" - ").trim()
          } else {
            authors = authorsJournal
          }
        }

        const publication = {
          title,
          authors,
          journal,
          year,
          citations,
        }

        console.log(`Publication ${index}:`, {
          title: title.substring(0, 50) + (title.length > 50 ? "..." : ""),
          authors: authors.substring(0, 30) + (authors.length > 30 ? "..." : ""),
          journal: journal.substring(0, 30) + (journal.length > 30 ? "..." : ""),
          year,
          citations,
        })

        publications.push(publication)
      })

      console.log("Total publications extracted:", publications.length)
    } catch (error) {
      console.error("Error extracting publications:", error)
    }

    return publications
  }

  /**
   * Validate Google Scholar URL format
   */
  static isValidScholarUrl(url: string): boolean {
    const scholarUrlPattern = /scholar\.google\.(com|co\.[a-z]{2}|[a-z]{2})\/citations.*user=/
    return scholarUrlPattern.test(url)
  }

  /**
   * Extract user ID from Google Scholar URL
   */
  static extractUserId(url: string): string | null {
    const match = url.match(/user=([^&]+)/)
    return match ? match[1] : null
  }
}
