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

import {SELECTOR_dialogStartButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test models with intersected names', () => {
  describe('PredefinedAndCustomCharacteristicsSameName', () => {
    it('should load "PredefinedAndCustomCharacteristicsSameName" model', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('predefined-and-custom-characteristics-same-name')
        .as('rdfString')
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
        .then(() => cy.shapeExists('PredefinedAndCustomCharacteristicsSameName'))
        .then(() => cy.getAspect())
        .then(aspect => {
          expect(aspect.name).to.equal('PredefinedAndCustomCharacteristicsSameName');
          expect(aspect.properties).to.have.lengthOf(16);
        });
    });

    it('should have properties connected with the appropriate "Boolean" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomBoolean'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedBoolean'};
      const predefinedCharacteristicParams = {
        name: 'Boolean',
        fields: [{label: 'preferredName = Boolean @en'}, {label: 'dataType = boolean'}],
      };
      const customCharacteristicParams = {
        name: 'Boolean',
        fields: [{label: "description = Custom 'Boolean' characteristic. @en"}, {label: 'dataType = boolean'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "Language" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomLanguage'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedLanguage'};
      const predefinedCharacteristicParams = {
        name: 'Language',
        fields: [{label: 'preferredName = Language @en'}, {label: 'dataType = string'}],
      };
      const customCharacteristicParams = {
        name: 'Language',
        fields: [{label: "description = Custom 'Language' characteristic. @en"}, {label: 'dataType = string'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "Locale" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomLocale'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedLocale'};
      const predefinedCharacteristicParams = {
        name: 'Locale',
        fields: [{label: 'preferredName = Locale @en'}, {label: 'dataType = string'}],
      };
      const customCharacteristicParams = {
        name: 'Locale',
        fields: [{label: "description = Custom 'Locale' characteristic. @en"}, {label: 'dataType = string'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "MultiLanguageText" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomMultiLanguageText'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedMultiLanguageText'};
      const predefinedCharacteristicParams = {
        name: 'MultiLanguageText',
        fields: [{label: 'preferredName = Multi-Language Text @en'}, {label: 'dataType = langString'}],
      };
      const customCharacteristicParams = {
        name: 'MultiLanguageText',
        fields: [{label: "description = Custom 'MultiLanguageText' characteristic. @en"}, {label: 'dataType = langString'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "MimeType" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomMimeType'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedMimeType'};
      const predefinedCharacteristicParams = {
        name: 'MimeType',
        fields: [{label: 'preferredName = MIME Type @en'}, {label: 'dataType = string'}],
      };
      const customCharacteristicParams = {
        name: 'MimeType',
        fields: [{label: "description = Custom 'MimeType' characteristic. @en"}, {label: 'dataType = string'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "ResourcePath" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomResourcePath'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedResourcePath'};
      const predefinedCharacteristicParams = {
        name: 'ResourcePath',
        fields: [{label: 'preferredName = Resource Path @en'}, {label: 'dataType = anyURI'}],
      };
      const customCharacteristicParams = {
        name: 'ResourcePath',
        fields: [{label: "description = Custom 'ResourcePath' characteristic. @en"}, {label: 'dataType = anyURI'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "Text" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomText'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedText'};
      const predefinedCharacteristicParams = {
        name: 'Text',
        fields: [{label: 'preferredName = Text @en'}, {label: 'dataType = string'}],
      };
      const customCharacteristicParams = {
        name: 'Text',
        fields: [{label: "description = Custom 'Text' characteristic. @en"}, {label: 'dataType = string'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    it('should have properties connected with the appropriate "Timestamp" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomTimestamp'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedTimestamp'};
      const predefinedCharacteristicParams = {
        name: 'Timestamp',
        fields: [{label: 'preferredName = Timestamp @en'}, {label: 'dataType = dateTime'}],
      };
      const customCharacteristicParams = {
        name: 'Timestamp',
        fields: [{label: "description = Custom 'Timestamp' characteristic. @en"}, {label: 'dataType = dateTime'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });

    // Can be added back after fixing https://rb-tracker.bosch.com/tracker01/browse/RBS-10152
    // The appropriate elements should be added to the model used for testing
    it.skip('should have properties connected with the appropriate "UnitReference" characteristic', () => {
      const propertyForCustomCharacteristicParams = {name: 'withCustomUnitReference'};
      const propertyForPredefinedCharacteristicParams = {name: 'withPredefinedUnitReference'};
      const predefinedCharacteristicParams = {
        name: 'UnitReference',
        fields: [{label: 'preferredName = Unit Reference @en'}, {label: 'dataType = curie'}],
      };
      const customCharacteristicParams = {
        name: 'UnitReference',
        fields: [{label: "description = Custom 'UnitReference' characteristic. @en"}, {label: 'dataType = curie'}],
      };

      cy.isConnected(propertyForCustomCharacteristicParams, customCharacteristicParams).should('be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, predefinedCharacteristicParams).should('be.true');
      cy.isConnected(propertyForCustomCharacteristicParams, predefinedCharacteristicParams).should('not.be.true');
      cy.isConnected(propertyForPredefinedCharacteristicParams, customCharacteristicParams).should('not.be.true');
    });
  });
});
