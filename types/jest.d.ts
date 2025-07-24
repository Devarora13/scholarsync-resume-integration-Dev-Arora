/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveProperty(property: string, value?: any): R
      toContain(item: any): R
      toBe(value: any): R
      toBeDefined(): R
      toBeUndefined(): R
      toHaveLength(length: number): R
    }
  }
}

export {}
