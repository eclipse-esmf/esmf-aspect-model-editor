import {SettingsDialogSelectors, SNACK_BAR} from '../../support/constants';

describe('Auto Save', () => {
  it('should open settings dialog', () => {
    cy.visitDefault()
      .then(() => cy.startModelling())
      .then(() => {
        cy.get('#settings').click();
        cy.get(SettingsDialogSelectors.autoSaveInput).should('exist');
      });
  });

  it('should set timer to 2 seconds', () => {
    cy.get(SettingsDialogSelectors.autoSaveInput)
      .clear({force: true})
      .type('2')
      .focused()
      .blur()
      .then(() => cy.get(SNACK_BAR).should('exist'));
  });

  it('should stop timer for saving', () => {
    cy.get(SettingsDialogSelectors.autoSaveInput).clear().type('2').blur();
    cy.get(SettingsDialogSelectors.autoSaveToggle).click();
    cy.wait(2000).then(() => cy.get(SNACK_BAR).should('not.exist'));
  });
});
