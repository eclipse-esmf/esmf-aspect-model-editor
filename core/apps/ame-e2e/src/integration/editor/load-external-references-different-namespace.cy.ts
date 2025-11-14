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

// TODO redo all interceptors
describe.skip('Test drag and drop', () => {
  it('Loading property element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-property-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-property-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].name).to.equal('externalPropertyWithChildren');

        expect(aspect.properties[0].characteristic.name).to.equal('ChildrenCharacteristic1');

        const entity = aspect.properties[0].characteristic.dataType;
        expect(entity.name).to.equal('ChildrenEntity1');

        expect(entity.properties[0].name).to.equal('childrenProperty1');
        expect(entity.properties[1].name).to.equal('childrenProperty2');

        expect(entity.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (different:externalPropertyWithChildren)');

        expect(rdf).not.contain(':externalPropertyWithChildren a samm:Property');
        expect(rdf).not.contain(':ChildrenCharacteristic1 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
      });
  });

  it('Loading model with "Entity" -> "Property (external, with children, different namespace)" relations', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-property-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/entity-external-property-with-children-reference')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        const aspectParams = {name: 'AspectDefault'};
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);

        const localPropertyParams = {name: 'property1'};
        const localProperty = aspect.properties[0];
        expect(localProperty.name).to.equal(localPropertyParams.name);
        cy.isConnected(aspectParams, localPropertyParams).should('be.true');

        const localCharacteristicParams = {name: 'Characteristic1'};
        const localCharacteristic = localProperty.characteristic;
        expect(localCharacteristic.name).to.equal(localCharacteristicParams.name);
        cy.isConnected(localPropertyParams, localCharacteristicParams).should('be.true');

        const localEntityParams = {name: 'Entity1'};
        const localEntity = localCharacteristic.dataType;
        expect(localEntity.name).to.equal(localEntityParams.name);
        cy.isConnected(localCharacteristicParams, localEntityParams).should('be.true');

        const externalPropertyParams = {name: 'childrenProperty1'};
        const externalProperty = localEntity.properties[0];
        expect(externalProperty.name).to.equal(externalPropertyParams.name);
        cy.isConnected(localEntityParams, externalPropertyParams).should('be.true');
      });
  });

  it('Loading operation element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-operation-reference-with-children.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {
          namespace: 'org.eclipse.different:1.0.0',
          'file-name': 'external-operation-reference-with-children.txt',
        },
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-operation-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-operation-reference-with-children')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(1);
        expect(aspect.operations[0].name).to.equal('externalOperationWithChildren');
        expect(aspect.operations[0].input).to.be.length(2);

        expect(aspect.operations[0].input[0].name).to.equal('childProperty1');
        expect(aspect.operations[0].input[0].characteristic.name).to.equal('ChildrenCharacteristic1');

        const entity1 = aspect.operations[0].input[0].characteristic.dataType;
        expect(entity1.name).to.equal('ChildrenEntity1');
        expect(entity1.properties[0].name).to.equal('childrenProperty1');
        expect(entity1.properties[1].name).to.equal('childrenProperty2');
        expect(entity1.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity1.properties[1].characteristic.name).to.equal('Boolean');

        expect(aspect.operations[0].input[1].name).to.equal('childProperty2');
        expect(aspect.operations[0].input[1].characteristic.name).to.equal('ChildrenCharacteristic1');
        const entity2 = aspect.operations[0].input[1].characteristic.dataType;
        expect(entity2.name).to.equal('ChildrenEntity1');
        expect(entity2.properties[0].name).to.equal('childrenProperty1');
        expect(entity2.properties[1].name).to.equal('childrenProperty2');
        expect(entity2.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity2.properties[1].characteristic.name).to.equal('Boolean');

        expect(aspect.operations[0].output.name).to.equal('childProperty3');
        expect(aspect.operations[0].output.characteristic.name).to.equal('ChildrenCharacteristic1');
        const entity3 = aspect.operations[0].output.characteristic.dataType;
        expect(entity3.name).to.equal('ChildrenEntity1');
        expect(entity3.properties[0].name).to.equal('childrenProperty1');
        expect(entity3.properties[1].name).to.equal('childrenProperty2');
        expect(entity3.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity3.properties[1].characteristic.name).to.equal('Boolean');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:operations (different:externalOperationWithChildren)');

        expect(rdf).not.contain(':externalOperationWithChildren a samm:Operation');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain(':childrenProperty3 a samm:Property');
        expect(rdf).not.contain(':ChildrenCharacteristic1 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
      });
  });

  it('Loading characteristic element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-characteristic-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-characteristic-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-characteristic-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].name).to.equal('property1');

        expect(aspect.properties[0].characteristic.name).to.equal('ExternalCharacteristicWithChildren');

        const entity = aspect.properties[0].characteristic.dataType;
        expect(entity.name).to.equal('ChildrenEntity1');

        expect(entity.properties[0].name).to.equal('childrenProperty1');
        expect(entity.properties[1].name).to.equal('childrenProperty2');

        expect(entity.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic different:ExternalCharacteristicWithChildren');

        expect(rdf).not.contain(':ExternalCharacteristicWithChildren a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
      });
  });

  it('Loading entity element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-entity-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-entity-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-entity-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].name).to.equal('property1');

        expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');

        const entity = aspect.properties[0].characteristic.dataType;
        expect(entity.name).to.equal('ExternalEntityWithChildren');

        expect(entity.properties[0].name).to.equal('childrenProperty1');
        expect(entity.properties[1].name).to.equal('childrenProperty2');

        expect(entity.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
        expect(rdf).to.contain('samm:dataType different:ExternalEntityWithChildren');

        expect(rdf).not.contain(':ExternalEntityWithChildren a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
      });
  });

  it('Loading unit element from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': ['external-unit-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-unit-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-unit-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-unit-reference')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].name).to.equal('property1');

        expect(aspect.properties[0].characteristic.name).to.equal('Quantifiable1');

        const unit = aspect.properties[0].characteristic.unit;
        expect(unit.name).to.equal('ExternalUnit');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:dataType xsd:string');
        expect(rdf).to.contain('samm:characteristic :Quantifiable1');
        expect(rdf).to.contain(':Quantifiable1 a samm-c:Quantifiable');
        expect(rdf).to.contain('samm-c:unit different:ExternalUnit');

        expect(rdf).not.contain(':ExternalUnit a unit:Unit');
      });
  });

  it('Loading different elements from several external files with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.different:1.0.0': [
        'external-entity-reference.txt',
        'external-characteristic-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
        'external-trait-reference.txt',
        'external-constraint-reference.txt',
      ],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-entity-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-characteristic-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-property-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-operation-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-trait-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-trait-reference.txt',
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-constraint-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-constraint-reference.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-several-external-reference')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(2);
        expect(aspect.operations[0].name).to.equal('operation1');
        expect(aspect.operations[1].name).to.equal('externalOperation');

        expect(aspect.properties).to.be.length(5);
        expect(aspect.properties[0].name).to.equal('property1');
        expect(aspect.properties[1].name).to.equal('property2');
        expect(aspect.properties[2].name).to.equal('property3');
        expect(aspect.properties[3].name).to.equal('property4');
        expect(aspect.properties[4].name).to.equal('externalProperty');

        expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');
        expect(aspect.properties[1].characteristic.name).to.equal('ExternalCharacteristic');
        expect(aspect.properties[2].characteristic.name).to.equal('ExternalTrait');
        expect(aspect.properties[3].characteristic.name).to.equal('Property4Trait');

        expect(aspect.properties[2].characteristic.constraints[0].name).to.equal('ConstraintInTrait');
        expect(aspect.properties[2].characteristic.baseCharacteristic.name).to.equal('CharacteristicInTrait');
        expect(aspect.properties[3].characteristic.constraints[0].name).to.equal('Constraint1');
        expect(aspect.properties[3].characteristic.baseCharacteristic.name).to.equal('Characteristic1');

        expect(aspect.properties[0].characteristic.dataType.name).to.equal('ExternalEntity');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix different: <urn:samm:org.eclipse.different:1.0.0#>.');
        expect(rdf).to.contain('samm:properties (:property1 :property2 :property3 :property4 different:externalProperty)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
        expect(rdf).to.contain('samm:dataType different:ExternalEntity');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain('samm:characteristic different:ExternalCharacteristic');
        expect(rdf).to.contain(':property3 a samm:Property');
        expect(rdf).to.contain('samm:characteristic different:ExternalTrait');
        expect(rdf).to.contain(':property4 a samm:Property');
        expect(rdf).to.contain('samm:characteristic :Property4Trait');
        expect(rdf).to.contain(':Property4Trait a samm-c:Trait');
        expect(rdf).to.contain('samm-c:baseCharacteristic :Characteristic1');
        expect(rdf).to.contain('samm-c:constraint :Constraint1');
        expect(rdf).to.contain(':Constraint1 a samm:Constraint');

        expect(rdf).not.contain(':externalProperty a samm:Property');
        expect(rdf).not.contain(':ExternalEntity a samm:Entity');
        expect(rdf).not.contain(':ExternalCharacteristic a samm:Characteristic');
        expect(rdf).not.contain(':ExternalTraita samm-c:Trait');
      });
  });
});
