import mammoth from "mammoth"

interface ParsedResumeData {
  name: string
  email?: string
  phone?: string
  location?: string
  skills: string[]
  experience: Array<{
    position: string
    company: string
    duration: string
    description?: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
  }>
}

export class ResumeParser {
  private static readonly emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  // Comprehensive international phone regex
  private static readonly phoneRegex =
    /(?:\+?[1-9]\d{0,3}[-.\s]?)?(?:\(?[0-9]{1,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,5}/g
  private static readonly skillsKeywords = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Next.js",
    "Django",
    "Flask",
    "Spring",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "Linux",
    "HTML",
    "CSS",
    "Sass",
    "Less",
    "Webpack",
    "Vite",
    "Jest",
    "Cypress",
    "Selenium",
    "GraphQL",
    "REST",
    "API",
    "Microservices",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Data Analysis",
    "Data Science",
    "Artificial Intelligence",
    "Computer Vision",
    "Natural Language Processing",
    "NLP",
    "DevOps",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
    "Agile",
    "Scrum",
    "Project Management",
  ]

  /**
   * Entrypoint: parse the uploaded file (PDF/DOCX)
   */
  static async parseFile(file: File): Promise<ParsedResumeData> {
    const buffer = await file.arrayBuffer()
    let text: string
    if (file.type === "application/pdf") {
      text = await this.parsePDF(buffer)
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await this.parseDOCX(buffer)
    } else {
      throw new Error("Unsupported file type. Please upload PDF or DOCX files only.")
    }

    // Improved line splitting for PDFs
    const lines = text
      .split(/\r?\n|\r| {2,}/g)
      .map((l) => l.trim())
      .filter(Boolean)

    return this.extractInformation(text, lines)
  }

  /**
   * PDF to plain text using pdf-parse
   */
  private static async parsePDF(buffer: ArrayBuffer): Promise<string> {
    try {
      const pdfParse = await import("pdf-parse")
      const data = await pdfParse.default(Buffer.from(buffer))
      return data.text
    } catch {
      throw new Error("Failed to parse PDF file. Please ensure the file is not corrupted.")
    }
  }

  /**
   * DOCX to plain text using mammoth
   */
  private static async parseDOCX(buffer: ArrayBuffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      return result.value
    } catch {
      throw new Error("Failed to parse DOCX file. Please ensure the file is not corrupted.")
    }
  }

  /**
   * Main data extraction from raw text and lines array
   */
  private static extractInformation(text: string, lines: string[]): ParsedResumeData {
    return {
      name: this.extractName(lines),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      location: this.extractLocation(lines),
      skills: this.extractSkills(text),
      experience: this.extractExperience(lines, text),
      education: this.extractEducation(lines, text),
    }
  }

  /**
   * Tries to find the user's name (1st real line, or "Name: ...")
   */
  private static extractName(lines: string[] | undefined): string {
    if (!Array.isArray(lines) || lines.length === 0) {
      return "Name not found"
    }

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const l = lines[i].trim()
      if (
        l.length > 2 &&
        l.length < 60 &&
        !this.emailRegex.test(l) &&
        !this.phoneRegex.test(l) &&
        !l.toLowerCase().includes("resume") &&
        !l.toLowerCase().includes("cv") &&
        !l.toLowerCase().includes("curriculum vitae") &&
        !l.toLowerCase().includes("profile") &&
        !l.toLowerCase().includes("objective") &&
        !l.toLowerCase().includes("summary") &&
        !l.toLowerCase().includes("contact") &&
        !l.includes("http") &&
        !l.includes("www") &&
        !l.includes("@") &&
        l.split(" ").length >= 2 &&
        l.split(" ").length <= 4 &&
        /^[A-Za-z\s.'-]+$/.test(l)
      ) {
        return l
      }
    }

    for (const l of lines) {
      const m = l.match(/(?:name|full name)[:\s]+([A-Za-z\s.'-]+)/i)
      if (m && m[1].trim().length > 2) {
        return m[1].trim()
      }
    }

    return "Name not found"
  }

  /**
   * Finds the first matching email pattern in string
   */
  private static extractEmail(text: string): string | undefined {
    const matches = text.match(this.emailRegex)
    return matches ? matches[0] : undefined
  }

  /**
   * Finds the best matching phone pattern in string
   */
  private static extractPhone(text: string): string | undefined {
    const matches = text.match(this.phoneRegex)
    if (!matches) return undefined

    // Find the longest match (likely the most complete phone number)
    let bestMatch = matches[0]
    for (const match of matches) {
      if (match.length > bestMatch.length) {
        bestMatch = match
      }
    }

    return bestMatch.trim()
  }

  /**
   * Simple location pattern based on common address/keywords
   */
  private static extractLocation(lines: string[] | undefined): string | undefined {
    if (!Array.isArray(lines)) {
      return undefined
    }

    const locationKeywords = ["street", "avenue", "drive", "road", "city", "state", "zip", "country"]

    for (const l of lines) {
      const lower = l.toLowerCase()
      if (locationKeywords.some((k) => lower.includes(k)) || /\b\d{5}(-\d{4})?\b/.test(l)) {
        return l
      }
    }

    return undefined
  }

  /**
   * More robust skills extraction from block
   */
  private static extractSkills(text: string): string[] {
    const found = new Set<string>()
    let skillsText = text
    // Find skills section if possible
    const skillsSectionStart = text.search(/(?:skills?|technologies?|technical skills?|competencies|expertise)[:\s\n]/i)
    if (skillsSectionStart !== -1) {
      const after = text.substring(skillsSectionStart)
      const sectionEnd = after.search(/\n\s*(?:experience|education|projects|awards|certifications)/i)
      skillsText = sectionEnd !== -1 ? after.substring(0, sectionEnd) : after
    }

    for (const skill of this.skillsKeywords) {
      const skillLower = skill.toLowerCase()
      if (skillsText.toLowerCase().includes(skillLower)) {
        found.add(skill)
      }
    }

    // Additional patterns for comma/bullet/semicolon lists
    const skillPatterns = [
      /(?:skills?|technologies?|programming languages?|frameworks?|tools?|databases?)[:\s]+([^.]+?)(?:\n\n|\n[A-Z]|$)/gi,
      /•\s*([A-Za-z][^•\n]+)/g,
      /-\s*([A-Za-z][^-\n]+)/g,
      /\*\s*([A-Za-z][^*\n]+)/g,
    ]
    for (const pattern of skillPatterns) {
      const matches = skillsText.matchAll(pattern)
      for (const match of matches) {
        const skillsList = match[1].split(/[,;|\n]/)
        for (const skill of skillsList) {
          const cleanSkill = skill.trim().replace(/[•\-*()]/g, "")
          if (
            cleanSkill.length > 1 &&
            cleanSkill.length < 30 &&
            !cleanSkill.toLowerCase().includes("experience") &&
            !cleanSkill.toLowerCase().includes("years")
          ) {
            found.add(cleanSkill)
          }
        }
      }
    }
    return Array.from(found).slice(0, 25)
  }

  /**
   * Section header matcher (case-insensitive, trims, allows colon, all-caps)
   */
  private static isSectionHeader(line: string, keywords: string[]): boolean {
    const clean = line
      .replace(/[:\s]+$/, "")
      .trim()
      .toLowerCase()
    return (
      keywords.some((kw) => clean === kw) ||
      keywords.some((kw) => line.toUpperCase() === kw.toUpperCase()) ||
      keywords.some((kw) => clean.includes(kw))
    )
  }

  /**
   * Extract a section block by heading (robust against PDF line mess)
   */
  private static extractSection(lines: string[] | undefined, keywords: string[], nextKeywords: string[]): string[] {
    if (!Array.isArray(lines) || lines.length === 0) return []
    let sectionStart = -1
    let sectionEnd = -1
    for (let i = 0; i < lines.length; i++) {
      if (this.isSectionHeader(lines[i], keywords)) {
        sectionStart = i + 1
        break
      }
    }
    if (sectionStart === -1) return []
    for (let i = sectionStart; i < lines.length; i++) {
      if (this.isSectionHeader(lines[i], nextKeywords)) {
        sectionEnd = i
        break
      }
    }
    return lines.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd)
  }

  /**
   * Extract work experience section — robust for PDFs!
   */
  private static extractExperience(
    lines: string[] | undefined,
    fullText: string
  ): Array<{
    position: string
    company: string
    duration: string
    description?: string
  }> {
    if (!Array.isArray(lines)) lines = []

    const sectionKeywords = ["experience", "work experience", "professional experience", "employment", "work history"]
    const nextSection = ["education", "skills", "projects", "awards", "certifications", "references", "languages"]
    let experienceLines = this.extractSection(lines, sectionKeywords, nextSection)

    // If not found, fallback: extract as block with regex from text
    if (experienceLines.length === 0) {
      const rx = new RegExp(
        "(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)[\\s:]*([\\s\\S]*?)(?:EDUCATION|SKILLS|PROJECTS|AWARDS|CERTIFICATES|$)",
        "i"
      )
      const m = fullText.match(rx)
      if (m && m[1]) {
        experienceLines = m[1]
          .split(/\r?\n|\r| {2,}/g)
          .map((l) => l.trim())
          .filter(Boolean)
      }
    }

    const experience: any[] = []
    let currentJob: any = null
    let jobDescription: string[] = []
    for (let i = 0; i < experienceLines.length; i++) {
      const line = experienceLines[i].trim()
      if (!line) continue
      // New job: has date or title pattern
      const datePattern =
        /(20\d{2}|19\d{2}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*?20\d{2}|\bpresent\b|\bcurrent\b)/i
      const hasDate = datePattern.test(line)
      const nextLine = i + 1 < experienceLines.length ? experienceLines[i + 1] : ""
      const isJobTitle =
        hasDate ||
        (line.length > 5 &&
          line.length < 100 &&
          !line.startsWith("•") &&
          !line.startsWith("-") &&
          !line.startsWith("*") &&
          (nextLine.toLowerCase().includes("company") ||
            nextLine.toLowerCase().includes("corp") ||
            nextLine.toLowerCase().includes("inc") ||
            nextLine.toLowerCase().includes("ltd") ||
            nextLine.includes("|") ||
            nextLine.includes("-")))
      if (isJobTitle) {
        if (currentJob) {
          if (jobDescription.length > 0) currentJob.description = jobDescription.join(" ").trim()
          experience.push(currentJob)
          jobDescription = []
        }
        let position = "",
          company = "",
          duration = ""
        if (line.includes("|")) {
          const parts = line.split("|").map((p) => p.trim())
          position = parts[0] || ""
          company = parts[1] || ""
          duration = this.extractDuration(line) || parts[2] || ""
        } else if (line.includes(" - ") && hasDate) {
          const parts = line.split(" - ")
          position = parts[0].trim()
          duration = this.extractDuration(line) || ""
          company = parts[1]?.replace(duration, "").trim() || ""
        } else {
          position = line
          if (i + 1 < experienceLines.length) {
            company = experienceLines[i + 1].trim()
            i++
          }
          duration = this.extractDuration(`${position} ${company}`) || ""
        }
        currentJob = {
          position: position || "Position not specified",
          company: company || "Company not specified",
          duration: duration || "Duration not specified",
        }
      } else if (
        currentJob &&
        (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || (line.length > 20 && !hasDate))
      ) {
        jobDescription.push(line.replace(/^[•\-*]\s*/, ""))
      }
    }
    if (currentJob) {
      if (jobDescription.length > 0) currentJob.description = jobDescription.join(" ").trim()
      experience.push(currentJob)
    }
    return experience.slice(0, 10)
  }

  /**
   * Extract education section — robust for PDFs!
   */
  private static extractEducation(
    lines: string[] | undefined,
    fullText: string
  ): Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
  }> {
    if (!Array.isArray(lines)) lines = []

    const sectionKeywords = ["education", "academic", "qualifications", "university", "college", "degree"]
    const nextSection = ["experience", "skills", "projects", "awards", "certifications", "references", "languages"]
    let educationLines = this.extractSection(lines, sectionKeywords, nextSection)
    if (educationLines.length === 0) {
      const rx = new RegExp(
        "(?:EDUCATION|QUALIFICATIONS|UNIVERSITY|COLLEGE)[\\s:]*([\\s\\S]*?)(?:EXPERIENCE|SKILLS|PROJECTS|AWARDS|CERTIFICATES|$)",
        "i"
      )
      const m = fullText.match(rx)
      if (m && m[1]) {
        educationLines = m[1]
          .split(/\r?\n|\r| {2,}/g)
          .map((l) => l.trim())
          .filter(Boolean)
      }
    }

    const education: any[] = []
    for (let i = 0; i < educationLines.length; i++) {
      const line = educationLines[i].trim()
      if (!line || line.length < 5) continue
      const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/)
      const gpaMatch = line.match(/gpa[:\s]+(\d+\.?\d*)/i)
      const degreeKeywords = [
        "bachelor",
        "master",
        "phd",
        "doctorate",
        "associate",
        "diploma",
        "certificate",
        "b.s.",
        "b.a.",
        "m.s.",
        "m.a.",
        "b.tech",
        "m.tech",
        "b.e.",
        "m.e.",
      ]
      const hasDegree = degreeKeywords.some((keyword) => line.toLowerCase().includes(keyword))
      const institutionKeywords = ["university", "college", "institute", "school", "academy"]
      const hasInstitution = institutionKeywords.some((keyword) => line.toLowerCase().includes(keyword))
      if (yearMatch || hasDegree || hasInstitution) {
        let degree = "",
          institution = "",
          year = "",
          gpa = ""
        if (line.includes("|")) {
          const parts = line.split("|").map((p) => p.trim())
          degree = parts[0] || ""
          institution = parts[1] || ""
          year = yearMatch ? yearMatch[0] : ""
        } else if (line.includes(" - ")) {
          const parts = line.split(" - ").map((p) => p.trim())
          degree = parts[0] || ""
          institution = parts[1] || ""
          year = yearMatch ? yearMatch[0] : ""
        } else {
          if (hasDegree) {
            degree = line
            year = yearMatch ? yearMatch[0] : ""
            if (i + 1 < educationLines.length) {
              const nextLine = educationLines[i + 1].trim()
              if (institutionKeywords.some((keyword) => nextLine.toLowerCase().includes(keyword))) {
                institution = nextLine
                i++
              }
            }
          } else if (hasInstitution) {
            institution = line
            year = yearMatch ? yearMatch[0] : ""
            if (i > 0) {
              const prevLine = educationLines[i - 1].trim()
              if (degreeKeywords.some((keyword) => prevLine.toLowerCase().includes(keyword))) {
                degree = prevLine
              }
            }
          }
        }
        if (gpaMatch) gpa = gpaMatch[1]
        if (degree || institution || year) {
          education.push({
            degree: degree || "Degree not specified",
            institution: institution || "Institution not specified",
            year: year || "Year not specified",
            gpa: gpa || undefined,
          })
        }
      }
    }
    const uniqueEducation = education.filter(
      (edu, index, self) =>
        index === self.findIndex((e) => e.degree === edu.degree && e.institution === edu.institution)
    )
    return uniqueEducation.slice(0, 5)
  }

  /**
   * Extracts "Jan 2021 - Present", etc.
   */
  private static extractDuration(line: string): string | undefined {
    const datePattern =
      /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\b|\b\d{4}\b|\bpresent\b|\bcurrent\b)/gi
    const dates = line.match(datePattern)
    if (dates && dates.length >= 1) {
      return dates.join(" - ")
    }
    return undefined
  }
}
