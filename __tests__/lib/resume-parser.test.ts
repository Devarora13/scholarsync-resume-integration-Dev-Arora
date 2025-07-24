import { ResumeParser } from "@/lib/resume-parser"
import { TextEncoder} from 'util';
;(global as any).TextEncoder = TextEncoder

// Mock the external libraries for testing
jest.mock("pdf-parse", () => ({
  default: jest.fn(),
}))

jest.mock("mammoth", () => ({
  extractRawText: jest.fn(),
}))

// MockFile class to fix file.arrayBuffer() issue in Node/Jest env
class MockFile {
  name: string
  type: string
  size: number
  private _data: Uint8Array

  constructor(data: string | Uint8Array, name: string, type: string) {
    this.name = name
    this.type = type
    if (typeof data === "string") {
      this._data = new TextEncoder().encode(data)
    } else {
      this._data = data
    }
    this.size = this._data.length
  }

  async arrayBuffer() {
    return this._data.buffer
  }
}

describe("ResumeParser", () => {
  describe("parseFile", () => {
    it("should reject unsupported file types", async () => {
      const mockFile = new MockFile("test", "test.txt", "text/plain")

      await expect(ResumeParser.parseFile(mockFile as any)).rejects.toThrow(
        "Unsupported file type. Please upload PDF or DOCX files only."
      )
    })

    it("should handle PDF files", async () => {
      const pdfParse = require("pdf-parse")
      pdfParse.default.mockResolvedValue({ text: "Mock PDF content\nJohn Doe\njohn@example.com" })

      const mockFile = new MockFile("test", "test.pdf", "application/pdf")

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

      const mockFile = new MockFile(
        "test",
        "test.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )

      const result = await ResumeParser.parseFile(mockFile)

      expect(result).toBeDefined()
      expect(result.name).toBeDefined()
      expect(mammoth.extractRawText).toHaveBeenCalled()
    })
  })

  describe("skills extraction", () => {
    it("should extract skills from skillsKeywords", () => {
      const text = "I have experience with JavaScript, React, and Python programming."
      const result = (ResumeParser as any).extractSkills(text)

      expect(result).toContain("JavaScript")
      expect(result).toContain("React")
      expect(result).toContain("Python")
    })

    it("should not extract non-skill words", () => {
      const text = "I work at a company and have some experience."
      const result = (ResumeParser as any).extractSkills(text)

      expect(result).not.toContain("company")
      expect(result).not.toContain("work")
      expect(result).not.toContain("some")
    })
  })

  describe("name extraction", () => {
    it("should extract name from first line", () => {
      const lines = ["John Doe", "john.doe@email.com", "123-456-7890"]
      const result = (ResumeParser as any).extractName(lines)

      expect(result).toBe("John Doe")
    })

    it("should skip headers and find actual name", () => {
      const lines = ["Resume", "CV", "John Smith", "john@email.com"]
      const result = (ResumeParser as any).extractName(lines)

      expect(result).toBe("John Smith")
    })

    it("should return fallback when no name found", () => {
      const lines = ["Resume", "Profile", "Contact Information"]
      const result = (ResumeParser as any).extractName(lines)

      expect(result).toBe("Name not found")
    })
  })

  describe("email extraction", () => {
    it("should extract valid email addresses", () => {
      const text = "Contact me at john.doe@example.com for more information."
      const result = (ResumeParser as any).extractEmail(text)

      expect(result).toBe("john.doe@example.com")
    })

    it("should return undefined when no email found", () => {
      const text = "No email address in this text."
      const result = (ResumeParser as any).extractEmail(text)

      expect(result).toBeUndefined()
    })
  })

  describe("phone extraction", () => {
    it("should extract phone numbers", () => {
      const text = "Call me at (123) 456-7890 or text anytime."
      const result = (ResumeParser as any).extractPhone(text)

      expect(result).toBe("(123) 456-7890")
    })

    it("should extract different phone formats", () => {
      const text = "Phone: 123-456-7890"
      const result = (ResumeParser as any).extractPhone(text)

      expect(result).toBe("123-456-7890")
    })

    it("should return undefined when no phone found", () => {
      const text = "No phone number here."
      const result = (ResumeParser as any).extractPhone(text)

      expect(result).toBeUndefined()
    })
  })
})
