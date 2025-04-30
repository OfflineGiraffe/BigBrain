/* global cy, describe, it, context, beforeEach */

describe('editing game data', () => {
  context('use registers an account', () => {
    it('should go to the register page successfully', () => {
      cy.visit('http://localhost:3000/login');
      cy.contains('Register').should('exist').click();
      cy.url().should('include', '/register');
    });
  
    it('should register successfully and go to dashboard', () => {
      cy.visit('http://localhost:3000/register');
      cy.get('input[placeholder="Name"]').type('John');
      cy.get('input[placeholder="Email"]').type('newperson@example.com');
      cy.get('input[placeholder="Password"]').type('123');
      cy.get('input[placeholder="Confirm Password"]').type('123');
      cy.get('button[name="register-button"]').click();
      cy.url().should('include', '/dashboard');
    });
  });
  
    
  context('add game to dashboard', () => {
    beforeEach(() => {
      cy.session('admin-session', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[placeholder="Email"]').type('newperson@example.com');
        cy.get('input[placeholder="Password"]').type('123');
        cy.get('button[name="login-button"]').click();
        cy.url().should('include', '/dashboard');
      });
    });
  
      
    it('should create a new game successfully', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Create New Game').should('exist').click();
      cy.get('input[placeholder="Game Name"]', { timeout: 5000 }).should('be.visible').type('Quiz');
      cy.get('button[name="create game"]', { timeout: 5000 }).should('be.visible').click();
    });
  
  });
  
  context('after creating a game', () => {
    beforeEach(() => {
      cy.session('admin-session-gameoption', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[placeholder="Email"]').type('newperson@example.com');
        cy.get('input[placeholder="Password"]').type('123');
        cy.get('button[name="login-button"]').click();
        cy.contains('Create New Game').should('exist').click();
        cy.get('input[placeholder="Game Name"]', { timeout: 5000 }).should('be.visible').type('Quiz');
      });
    });
  
    it('should open the edit game page', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
    });

    it('should change game name', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
      cy.contains('Edit Game Info').should('exist').click();
      cy.get('input[placeholder="Game Name"]').type('A better quiz');
      cy.get('[data-testid="edit-game-main"]').click();
      cy.contains('A better quiz').should('exist');
    });

    it('should add a question to game with an error encountered', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
      cy.contains('Add Question').should('exist').click();
      cy.get('input[placeholder="Duration in Seconds"]').type('50');
      cy.get('input[placeholder="Amount of Points Allocated to Question"]').type('10');
      cy.get('textarea[placeholder="Displayed Question"]').type('Is the sky blue?');
      cy.contains('YouTube URL').should('exist').click();
      cy.get('input[placeholder="YouTube Video URL"]').type('https://www.youtube.com/watch?v=V83DKxsLTso');
      cy.contains('Judgement').should('exist').click();
      cy.get('[data-testid="add-question-main"]').click();
      cy.contains('Correct Answer must be Selected').should('exist');
      cy.contains('True').should('exist').click();
      cy.get('[data-testid="add-question-main"]').click();
      cy.contains('Is the sky blue?').should('exist');
    });

    it('should edit a question of a game', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
      cy.contains('Edit Question').should('exist').click();
      cy.get('input[placeholder="Duration in Seconds"]').clear();
      cy.get('input[placeholder="Duration in Seconds"]').type('20');
      cy.get('textarea[placeholder="Displayed Question"]').clear();
      cy.get('textarea[placeholder="Displayed Question"]').type('Is the sky purple?');
      cy.contains('False').should('exist').click();
      cy.get('[data-testid="edit-question-main"]').click();
      cy.contains('Is the sky purple?').should('exist');
      cy.contains('20').should('exist');
    });

    it('remove question attachment', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
      cy.contains('Remove Attachment').should('exist').click();
      cy.get('[data-testid="question-attachment-title"]').should('not.exist');
    });

    it('delete question', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Edit Game').should('exist').click();
      cy.url().should('include', '/game');
      cy.contains('Delete Question').should('exist').click();
      cy.contains('No Questions Found.').should('exist');
    });

    it('delete game', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Delete Game').should('exist').click();
      cy.contains('No Games Found.').should('exist');
    });

    it('user logs out', () => {
      cy.visit('http://localhost:3000/dashboard');
      cy.contains('Logout').should('exist').click();
      cy.url().should('include', '/login');
    });
        
  });
});