/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/parse-resume/route'
import { TextEncoder } from 'util'

;(global as any).TextEncoder = TextEncoder


// Mock File class with arrayBuffer() for Jest
class MockFile {
  name: string
  type: string
  size: number
  private _data: Uint8Array

  constructor(data: string | Uint8Array, name: string, type: string) {
    this.name = name
    this.type = type
    if (typeof data === 'string') {
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


// Mock security dependencies so validation passes during tests
jest.mock('@/lib/security', () => ({
  SecurityValidator: {
    validateRequest: jest.fn(() => Promise.resolve({ success: true })),
    recordFailure: jest.fn(),
    sanitizeInput: jest.fn((input) => input),
  },
  EnhancedRateLimit: {
    checkLimit: jest.fn(() => Promise.resolve({ success: true, remaining: 10, resetTime: null })),
  },
}))


describe('/api/parse-resume', () => {
  it('should reject non-POST requests', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const response = await handler(req)
    expect(response.status).toBe(405)
  })

  it('should reject requests without files', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {},
    })

    const response = await handler(req)
    expect(response.status).toBe(400)
  })

  it('should validate content-type', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'text/plain',
      },
    })

    const response = await handler(req)
    expect(response.status).toBe(400)
  })

  it('should handle file size limits', async () => {
    // Create a mock file that's too large
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024) // 10MB

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
        'content-length': largeBuffer.length.toString(),
      },
    })

    // Mock formData to provide file with size > 5MB
    const mockFormData = new FormData()
    const largeFile = new MockFile(
      largeBuffer, 
      'largefile.pdf',
      'application/pdf'
    )
    mockFormData.append('resume', largeFile)
    req.formData = async () => mockFormData

    const response = await handler(req)
    expect(response.status).toBe(400)
  })
})


describe('Resume Parser Integration', () => {
  it('should handle PDF parsing errors gracefully', async () => {
    const mockFormData = new FormData()
    const corruptedFile = new MockFile('corrupted data', 'resume.pdf', 'application/pdf')
    mockFormData.append('resume', corruptedFile)

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
    // Mock the formData method on req
    req.formData = async () => mockFormData

    const response = await handler(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Failed to parse')
  })

  it('should handle DOCX parsing errors gracefully', async () => {
    const mockFormData = new FormData()
    const corruptedFile = new MockFile(
      'corrupted data',
      'resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    mockFormData.append('resume', corruptedFile)

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
    req.formData = async () => mockFormData

    const response = await handler(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Failed to parse')
  })
})
