/* global cy, describe, it, context, beforeEach */

describe('user happy path', () => {
  context('before login', () => {
    it('should navigate to the home screen successfully', () => {
      cy.visit('http://localhost:3000/login');
      cy.url().should('include', '/login');
      cy.get('button[name="login-button"]').should('exist');
    });

    it('should go to the register page successfully', () => {
      cy.visit('http://localhost:3000/login');
      cy.contains('Register').should('exist').click();
      cy.url().should('include', '/register');
    });

    it('should register successfully and go to dashboard', () => {
      cy.visit('http://localhost:3000/register');
      cy.get('input[placeholder="Name"]').type('John');
      cy.get('input[placeholder="Email"]').type('3@example.com');
      cy.get('input[placeholder="Password"]').type('123');
      cy.get('input[placeholder="Confirm Password"]').type('123');
      cy.get('button[name="register-button"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  
  context('after login with session', () => {
    beforeEach(() => {
      cy.session('admin-session', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[placeholder="Email"]').type('3@example.com');
        cy.get('input[placeholder="Password"]').type('123');
        cy.get('button[name="login-button"]').click();
        cy.url().should('include', '/dashboard');
      });
    });

    
    it('should create a new game successfully', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Create New Game').should('exist').click();
      cy.get('input[placeholder="Game Name"]', { timeout: 5000 }).should('be.visible').type('yes');
      cy.get('button[name="create game"]', { timeout: 5000 }).should('be.visible').click();
    });

  });

  context('after creating a game', () => {
    beforeEach(() => {
      cy.session('admin-session-gameoption', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[placeholder="Email"]').type('3@example.com');
        cy.get('input[placeholder="Password"]').type('123');
        cy.get('button[name="login-button"]').click();
        cy.contains('Create New Game').should('exist').click();
        cy.get('input[placeholder="Game Name"]', { timeout: 5000 }).should('be.visible').type('yes');
        cy.get('button[name="create game"]', { timeout: 5000 }).should('be.visible').click();
        
      });
    });

    it('should start a game succcessfully', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.get('button[name="start game"]').click();
      cy.get('button[name="close button"]').click();
    });
    
    it('should end a game successfully', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.get('button[name="start game"]').click();
      cy.get('[name="End session"]').should('exist').click();
    });
    

    it('should load the results page successfully', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.get('button[name="start game"]').click();
      cy.get('button[name="close button"]').click();
      cy.get('[name="End session"]').should('exist').click();
      cy.get('[name="view results"]').should('exist').click()

    })

    it('should log out of the application', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.get('button[name="start game"]').click();
      cy.get('button[name="close button"]').click();
      cy.get('[name="End session"]').should('exist').click();
      cy.get('[name="view results"]').should('exist').click();
      cy.get('button[name="logoutdashboardbutton"]').click();
    })
    
    it('should log back in after logging out', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.get('button[name="logoutdashboardbutton"]').click();
      cy.visit('http://localhost:3000/login');
      cy.get('input[placeholder="Email"]').type('3@example.com');
      cy.get('input[placeholder="Password"]').type('123');
      cy.get('button[name="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });
      
  });
});