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
import {NAMESPACES_URL} from '../../support/api-mocks';

import {cyHelp} from '../../support/helpers';

// TODO redo all interceptors
describe.skip('Test load external reference with cross references', () => {
  it('Loading different elements from cross referenced file one way', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.digitaltwin:1.0.0': [
        'external-entity-reference.txt',
        'external-characteristic-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
      'org.eclipse.different:1.0.0': [
        'external-entity-reference.txt',
        'external-characteristic-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
    });

    // Same Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-entity-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-characteristic-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-property-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-operation-reference.txt',
      },
    );

    // Different Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-entity-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-characteristic-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-property-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-operation-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/cross-references/model-with-cross-referenced-element')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cyHelp.checkAspectDefaultExists())
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(2);
        expect(aspect.operations[0].name).to.equal('externalOperationWithCrossRef1');
        expect(aspect.operations[1].name).to.equal('externalOperationWithCrossRef2');

        expect(aspect.operations[0].input).to.be.length(1);
        expect(aspect.operations[0].input[0].name).to.equal('externalPropertyWithCrossRef1');

        expect(aspect.operations[1].input).to.be.length(1);
        expect(aspect.operations[1].input[0].name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.operations[0].output.name).to.equal('externalPropertyWithCrossRef1');
        expect(aspect.operations[1].output.name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.properties).to.be.length(2);
        expect(aspect.properties[0].name).to.equal('externalPropertyWithCrossRef1');
        expect(aspect.properties[1].name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.properties[0].characteristic.name).to.equal('ExternalCharacteristicWithCrossRef1');
        expect(aspect.properties[1].characteristic.name).to.equal('ExternalCharacteristicWithCrossRef2');

        const entity1 = aspect.properties[0].characteristic.dataType;
        const entity2 = aspect.properties[1].characteristic.dataType;
        expect(entity1.name).to.equal('ExternalEntityWithCrossRef1');
        expect(entity2.name).to.equal('ExternalEntityWithCrossRef2');

        expect(entity1.properties).to.be.length(2);
        expect(entity2.properties).to.be.length(2);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:externalPropertyWithCrossRef1 different:externalPropertyWithCrossRef2)');
        expect(rdf).to.contain('samm:operations (:externalOperationWithCrossRef1 different:externalOperationWithCrossRef2)');

        expect(rdf).not.contain(':externalPropertyWithCrossRef1 a samm:Property');
        expect(rdf).not.contain(':externalPropertyWithCrossRef2 a samm:Property');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef1 a samm:Characteristic');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef2 a samm:Characteristic');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef1 a samm:Entity');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef2 a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain(':childrenProperty3 a samm:Property');
        expect(rdf).not.contain(':childrenProperty4 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Text');
        expect(rdf).not.contain('samm:characteristic samm-c:boolean');
      });
  });

  it('Loading different elements from cross referenced file mixing', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.digitaltwin:1.0.0': [
        'external-entity-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
      'org.eclipse.different:1.0.0': ['external-characteristic-reference.txt'],
    });

    // Same Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-entity-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-property-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.digitaltwin:1.0.0', 'file-name': 'external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-operation-reference.txt',
      },
    );

    // Different Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-characteristic-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/cross-references/model-with-cross-referenced-element-with-mixing-namespaces')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cyHelp.checkAspectDefaultExists())
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(1);
        expect(aspect.operations[0].name).to.equal('externalOperationWithCrossRef');

        expect(aspect.operations[0].input).to.be.length(1);
        expect(aspect.operations[0].input[0].name).to.equal('externalPropertyWithCrossRef');

        expect(aspect.operations[0].output.name).to.equal('externalPropertyWithCrossRef');

        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].name).to.equal('externalPropertyWithCrossRef');
        expect(aspect.properties[0].characteristic.name).to.equal('ExternalCharacteristicWithCrossRef');

        const entity = aspect.properties[0].characteristic.dataType;
        expect(entity.name).to.equal('ExternalEntityWithCrossRef');
        expect(entity.properties).to.be.length(2);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:externalPropertyWithCrossRef)');
        expect(rdf).to.contain('samm:operations (:externalOperationWithCrossRef)');

        expect(rdf).not.contain(':externalPropertyWithCrossRef a samm:Property');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef a samm:Characteristic');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Text');
        expect(rdf).not.contain('samm:characteristic samm-c:boolean');
      });
  });
});
