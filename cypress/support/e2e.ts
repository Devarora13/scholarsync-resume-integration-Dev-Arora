// Import commands.ts using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import testing library commands
import '@testing-library/cypress/add-commands'

// Import cypress-real-events
import 'cypress-real-events/support'

// Custom commands and global configurations
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // for uncaught exceptions that we expect in our app
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Add custom data-testid support
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to login user (if authentication is added later)
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
    }
  }
}
