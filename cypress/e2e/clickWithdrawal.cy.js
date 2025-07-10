/// <reference types="cypress" />

/*
 End-to-end test: Agent earns clicks, submits withdrawal; Admin approves; Agent sees status approved.

 ENV VARIABLES required in cypress.env.json or OS env:
   AGENT_EMAIL, AGENT_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
*/

const AGENT = {
  email: Cypress.env('AGENT_EMAIL'),
  password: Cypress.env('AGENT_PASSWORD'),
};

const ADMIN = {
  email: Cypress.env('ADMIN_EMAIL'),
  password: Cypress.env('ADMIN_PASSWORD'),
};

const clickBannerSelector = '[data-testid="click-banner"]';

function login(email, password) {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
}

function logout() {
  cy.get('[data-testid="logout-btn"]').click();
}

describe('Click-Earnings Withdrawal Flow', () => {
  it('Agent earns clicks, withdraws and admin approves', () => {
    // ----- Agent: earn enough clicks -----
    login(AGENT.email, AGENT.password);

    cy.contains('Dashboard');

    // click banner 10 times (assumes 0.20 each, ₱2) – adjust loops as needed
    for (let i = 0; i < 10; i++) {
      cy.get(clickBannerSelector).click();
      cy.wait(300); // debounce
    }

    // Go to Withdraw page
    cy.contains('Withdraw').click();
    cy.get('select[name="source"]').select('Click Earnings');

    // Withdraw ₱100 (assumes agent already has balance ≥100 from DB seed)
    cy.get('input[name="amount"]').clear().type('100');
    cy.get('select[name="method"]').select('GCash');
    cy.get('input[name="accountNumber"]').type('09171234567');
    cy.get('input[name="accountName"]').type('Test User');
    cy.get('button[type="submit"]').click();

    // Expect toast success and a pending row
    cy.contains('Withdrawal request submitted').should('exist');
    cy.contains('Pending').should('exist');

    logout();

    // ----- Admin approves -----
    login(ADMIN.email, ADMIN.password);
    cy.contains('Earnings & Withdrawals').click();
    cy.contains('Click Earnings').click();

    // Approve the first pending withdrawal
    cy.get('table tbody tr').first().within(() => {
      cy.contains('Approve').click();
    });

    cy.contains('Withdrawal approved successfully');

    logout();

    // ----- Agent sees approved -----
    login(AGENT.email, AGENT.password);
    cy.contains('Withdraw').click();
    cy.contains('Approved').should('exist');
  });
});
