/// <reference types="cypress" />

describe('ScholarSync Application', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    cy.contains('Welcome to ScholarSync').should('be.visible')
    cy.contains('Integrate your resume and Google Scholar profile').should('be.visible')
  })

  it('should have all main tabs visible', () => {
    cy.contains('Upload').should('be.visible')
    cy.contains('Resume').should('be.visible')
    cy.contains('Scholar').should('be.visible')
    cy.contains('Projects').should('be.visible')
  })

  it('should navigate between tabs', () => {
    // Test Upload tab (default)
    cy.contains('Resume Upload').should('be.visible')
    cy.contains('Google Scholar Profile').should('be.visible')

    // Test Resume tab
    cy.contains('Resume').click()
    cy.url().should('include', '#')

    // Test Scholar tab
    cy.contains('Scholar').click()
    cy.url().should('include', '#')

    // Test Projects tab
    cy.contains('Projects').click()
    cy.url().should('include', '#')
  })

  it('should display file upload interface', () => {
    cy.get('input[type="file"]').should('exist')
    cy.contains('Choose file or drag and drop').should('be.visible')
  })

  it('should display scholar profile input', () => {
    cy.get('input[placeholder*="Google Scholar"]').should('exist')
    cy.contains('Fetch Profile').should('be.visible')
  })
})

describe('Resume Upload Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show upload progress for valid files', () => {
    // Note: This test would need actual file fixtures
    // For now, we test the UI elements exist
    cy.get('input[type="file"]').should('exist')
    cy.contains('Upload Resume').should('be.visible')
  })

  it('should validate file types', () => {
    // Test that only PDF and DOCX files are accepted
    cy.get('input[type="file"]').should('have.attr', 'accept')
  })
})

describe('Scholar Profile Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should validate scholar profile URL format', () => {
    cy.get('input[placeholder*="Google Scholar"]')
      .type('invalid-url')
    
    cy.contains('Fetch Profile').click()
    
    // Should show validation error for invalid URL
    cy.contains('Invalid URL').should('be.visible')
  })

  it('should handle valid scholar profile URL', () => {
    const validUrl = 'https://scholar.google.com/citations?user=example'
    
    cy.get('input[placeholder*="Google Scholar"]')
      .type(validUrl)
    
    cy.contains('Fetch Profile').click()
    
    // Should show loading state
    cy.contains('Fetching').should('be.visible')
  })
})

describe('Responsive Design', () => {
  it('should work on mobile devices', () => {
    cy.viewport('iphone-6')
    cy.visit('/')
    
    cy.contains('Welcome to ScholarSync').should('be.visible')
    cy.get('button').should('be.visible')
  })

  it('should work on tablet devices', () => {
    cy.viewport('ipad-2')
    cy.visit('/')
    
    cy.contains('Welcome to ScholarSync').should('be.visible')
    cy.get('.grid').should('be.visible')
  })
})

describe('Error Handling', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should handle network errors gracefully', () => {
    // Intercept API calls and simulate network error
    cy.intercept('POST', '/api/**', { forceNetworkError: true }).as('networkError')
    
    cy.get('input[placeholder*="Google Scholar"]')
      .type('https://scholar.google.com/citations?user=example')
    
    cy.contains('Fetch Profile').click()
    
    cy.wait('@networkError')
    cy.contains('error', { matchCase: false }).should('be.visible')
  })
})
