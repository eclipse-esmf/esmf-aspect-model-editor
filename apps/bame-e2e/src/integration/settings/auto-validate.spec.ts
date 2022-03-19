import {SettingsDialogSelectors, SNACK_BAR} from '../../support/constants';

describe('Auto Validate', () => {
  it('should open settings dialog', () => {
    cy.visitDefault()
      .then(() => cy.startModelling())
      .then(() => {
        cy.get('#settings').click();
        cy.get(SettingsDialogSelectors.autoValidateInput).should('exist');
      });
  });

  it('should set timer to 2 seconds', () => {
    cy.get(SettingsDialogSelectors.autoValidateInput)
      .clear()
      .type('2')
      .focused()
      .blur()
      .then(() => cy.get(SNACK_BAR).should('exist'));
  });

  it('should stop timer for validation', () => {
    cy.get(SettingsDialogSelectors.autoValidateInput)
      .clear()
      .type('2')
      .focused()
      .blur()
      .then(() => cy.get(SettingsDialogSelectors.autoValidateToggle).click())
      .then(() => cy.get(SNACK_BAR).should('not.exist'));
  });
});
