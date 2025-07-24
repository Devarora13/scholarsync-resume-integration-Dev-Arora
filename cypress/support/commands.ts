/// <reference types="cypress" />

// Custom commands for E2E testing
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

Cypress.Commands.add('login', (email: string, password: string) => {
  // Implementation for future authentication
  cy.session([email, password], () => {
    // Login logic would go here when authentication is implemented
    cy.log(`Logging in user: ${email}`)
  })
})
