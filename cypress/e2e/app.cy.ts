const testEmail = `test${Math.random().toString(36).substring(2, 15)}@test.com`

describe('Navigation', () => {
    it('should navigate to register page', () => {
        // Start from the index page
        cy.visit('http://localhost:3000/')
    
        // Find a link with an href attribute containing "about" and click it
        cy.get('a[href*="register"]').click()
    
        // The new url should include "/about"
        cy.url().should('include', '/register')
    
        // The new page should contain an h1 with "About"
        cy.get('h1').contains('Join Us')
    })

    it('should navigate to otp page', () => {
        // Start from the index page
        cy.visit('http://localhost:3000/register')
    
        // Find a link with an href attribute containing "about" and click it
        cy.get('input[name="email"]').type(testEmail)

        cy.get('button[type="submit"]').click()
    
        // The new url should include "/about"
        cy.url().should('include', '/otp')
    
        // The new page should contain an h1 with "About"
        cy.get('h1').contains('Verify Account')
    })

    it('should display duplicate email error', () => {
        // Start from the index page
        cy.visit('http://localhost:3000/register')
    
        // Find a link with an href attribute containing "about" and click it
        cy.get('input[name="email"]').type(testEmail)

        cy.get('button[type="submit"]').click()

        cy.get('p').contains('Email already exists')
    })
})