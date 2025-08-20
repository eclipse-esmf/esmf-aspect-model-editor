/* eslint-disable cypress/no-unnecessary-waiting */
/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/// <reference types="Cypress" />

import 'cypress-real-events';
import {
  BUTTON_renameModelConfirm,
  FIELD_descriptionen,
  FIELD_error,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_renameModelInput,
  FIELD_see,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  PROP_configuration,
  SELECTOR_configuredProperty,
  SELECTOR_configuredPropertyCheckBox,
  SELECTOR_configuredPropertyPayload,
  SELECTOR_configureProp,
  SELECTOR_elementBtn,
  SELECTOR_resizeGutter,
  SELECTOR_saveProperties,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Aspect', () => {
  it('can add new aspect model', () => {
    cy.visitDefault();
    cy.startModelling().then(() => cy.get(SELECTOR_elementBtn).click());
  });

  it('can add properties', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.addNewProperty(2))
      .then(() => cyHelp.addNewProperty(3))
      .then(() => cyHelp.addNewProperty(4));
  });

  it('can check that all fields are visible and check order', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for Aspect'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('This is an aspect model'))
      .then(() => cy.get(FIELD_see).clear().should('be.visible'))
      .then(() => cy.get(PROP_configuration).should('have.text', 'Properties Configuration'))
      .then(() => cy.get(SELECTOR_configureProp).should('be.visible').should('have.text', 'Configure'))
      .then(() => {
        cy.get(SELECTOR_resizeGutter).realHover();
        cy.get(SELECTOR_resizeGutter).should('be.visible');
      })
      .then(() => cyHelp.clickSaveButton());
  });

  it('can rename aspect name', () => {
    cy.shapeExists('NewAspect')
      .then(() => cyHelp.renameElement('NewAspect', 'NewAspect1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewAspect1');
        expect(rdf).to.contain(':NewAspect1 a samm:Aspect');
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.name).to.equal('NewAspect1'));
    cy.shapeExists('NewAspect1').then(() => cyHelp.renameElement('NewAspect1', 'NewAspect'));
  });

  it('should validate edit aspect name field', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.get(FIELD_name).clear().type('newAspect#'))
      .then(() => cy.get(FIELD_error).should('be.visible'))
      .then(() => cy.get(FIELD_name).clear())
      .then(() => cy.get(FIELD_name).clear().type('NewAspect'));
  });

  it('can edit preferredName', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for Aspect'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('NewAspect', META_MODEL_preferredName)
          .should('eq', `${META_MODEL_preferredName} = New Preffered Name for Aspect @en`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:preferredName "New Preffered Name for Aspect"@en'))
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.getPreferredName('en')).to.equal('New Preffered Name for Aspect'));
  });

  it('can edit aspect model description', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('New description for the aspect model'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('NewAspect', META_MODEL_description)
          .should('eq', `${META_MODEL_description} = New description for the aspect model @en`),
      )
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:description "New description for the aspect model"@en')))
      .then(() => cy.getAspect().then(aspect => expect(aspect.getDescription('en')).to.equal('New description for the aspect model')));
  });

  it('can edit see aspect field', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.addSeeElements('http://www.seeA.de', 'http://www.seeB.de', 'http://www.seeC.de'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('NewAspect', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = http://www.seeA.de,http://www.seeB.de,http://www.seeC.de`),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:see <http://www.seeA.de>, <http://www.seeB.de>, <http://www.seeC.de>')),
      )
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.see).to.have.length(3);
          expect(aspect.see[2]).to.equal('http://www.seeC.de');
        }),
      );
    cy.dbClickShape('NewAspect')
      .then(() => cy.removeSeeElements('http://www.seeB.de'))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getCellLabel('NewAspect', META_MODEL_see).should('eq', `${META_MODEL_see} = http://www.seeA.de,http://www.seeC.de`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <http://www.seeA.de>, <http://www.seeC.de>'))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.see).to.have.length(2);
          expect(aspect.see[1]).to.equal('http://www.seeC.de');
        }),
      );
  });

  it('can edit see http attributes to urns', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677', 'urn:irdi:iec:0112/2///62683#ACC011#001'))
      .then(() => cyHelp.clickSaveButton())

      .then(() =>
        cy
          .getCellLabel('NewAspect', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>, <urn:irdi:iec:0112/2///62683#ACC011#001>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.see).to.have.length(2);
        expect(aspect.see[1]).to.equal('urn:irdi:iec:0112/2///62683#ACC011#001');
      });

    cy.dbClickShape('NewAspect')
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677'))
      .then(() => cyHelp.clickSaveButton())

      .then(() => cy.getCellLabel('NewAspect', META_MODEL_see).should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.see).to.have.length(1);
        expect(aspect.see[0]).to.equal('urn:irdi:eclass:0173-1#02-AAO677');
      });
  });

  it('can configure properties', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.dbClickShape('NewAspect'))
      .then(() => cy.get(SELECTOR_configureProp).should('be.visible').should('have.text', 'Configure'))
      .then(() => cy.get(SELECTOR_configureProp).focus().click())
      .then(() => cy.get(SELECTOR_configuredProperty).should('be.visible'))
      .then(() => cy.get(SELECTOR_configuredPropertyCheckBox).focus().click())
      .then(() => cy.get(SELECTOR_configuredPropertyPayload).type('payload'))
      .then(() => cy.get(SELECTOR_saveProperties).focus().click());
  });

  it('should check outgoing edges', () => {
    cy.shapeExists('NewAspect').then(() => cy.dbClickShape('NewAspect'));
    cy.contains('Incoming edges').should('not.exist');
    cy.contains('Outgoing edges (4)').should('exist');
  });

  it('can delete property1 and property3', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('property1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click())
      .then(() => cy.clickShape('property3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click())
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:properties (:property2 :property4)')));
  });

  it('can delete existing aspect', () => {
    cy.intercept('GET', 'http://localhost:9090/ame/api/models/namespaces', {
      'org.eclipse.different': [
        {
          version: '1.0.0',
          models: [
            {
              model: 'external-property-reference.txt',
              aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#ChildrenEntity2',
              existing: true,
            },
          ],
        },
      ],
    });
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('NewAspect'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get(FIELD_renameModelInput).type('sharedModel'))
      .then(() => cy.get(BUTTON_renameModelConfirm).click().wait(500))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).not.to.contain('NewAspect')));
  });
});
