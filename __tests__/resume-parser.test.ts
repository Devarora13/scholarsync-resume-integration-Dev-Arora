import { ResumeParser } from "@/lib/resume-parser"

// Mock the external libraries for testing
jest.mock("pdf-parse", () => ({
  default: jest.fn(),
}))

jest.mock("mammoth", () => ({
  extractRawText: jest.fn(),
}))

describe("ResumeParser", () => {
  describe("extractInformation", () => {
    it("should extract basic information from resume text", () => {
      const mockText = `
        John Doe
        john.doe@example.com
        (555) 123-4567
        123 Main St, San Francisco, CA

        SKILLS
        JavaScript, TypeScript, React, Node.js, Python, Machine Learning

        EXPERIENCE
        Senior Software Engineer | Tech Corp | 2022 - Present
        Led development of scalable web applications using React and Node.js

        Software Engineer | StartupXYZ | 2020 - 2022
        Developed full-stack applications

        EDUCATION
        Master of Science in Computer Science | Stanford University | 2020
        Bachelor of Science in Computer Engineering | UC Berkeley | 2018
      `

      // Access the private method through type assertion for testing
      const parser = ResumeParser as any
      const result = parser.extractInformation(mockText)

      expect(result.name).toBe("John Doe")
      expect(result.email).toBe("john.doe@example.com")
      expect(result.phone).toBe("(555) 123-4567")
      expect(result.skills).toContain("JavaScript")
      expect(result.skills).toContain("TypeScript")
      expect(result.skills).toContain("React")
      expect(result.experience).toHaveLength(2)
      expect(result.education).toHaveLength(2)
    })

    it("should handle missing information gracefully", () => {
      const mockText = `
        Some random text without clear structure
        No clear name or contact information
      `

      const parser = ResumeParser as any
      const result = parser.extractInformation(mockText)

      expect(result.name).toBeDefined()
      expect(result.skills).toBeInstanceOf(Array)
      expect(result.experience).toBeInstanceOf(Array)
      expect(result.education).toBeInstanceOf(Array)
    })
  })

  describe("parseFile", () => {
    it("should reject unsupported file types", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" })

      await expect(ResumeParser.parseFile(mockFile)).rejects.toThrow(
        "Unsupported file type. Please upload PDF or DOCX files only."
      )
    })

    it("should handle PDF files", async () => {
      const pdfParse = require("pdf-parse")
      pdfParse.default.mockResolvedValue({ text: "Mock PDF content\nJohn Doe\njohn@example.com" })

      const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" })

      const result = await ResumeParser.parseFile(mockFile)

      expect(result).toBeDefined()
      expect(result.name).toBeDefined()
      expect(pdfParse.default).toHaveBeenCalled()
    })

    it("should handle DOCX files", async () => {
      const mammoth = require("mammoth")
      mammoth.extractRawText.mockResolvedValue({
        value: "Mock DOCX content\nJane Smith\njane@example.com",
      })

      const mockFile = new File(["test"], "test.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      const result = await ResumeParser.parseFile(mockFile)

      expect(result).toBeDefined()
      expect(result.name).toBeDefined()
      expect(mammoth.extractRawText).toHaveBeenCalled()
    })
  })
})
