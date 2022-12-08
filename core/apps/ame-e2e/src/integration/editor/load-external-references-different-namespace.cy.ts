/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {DefaultQuantifiable, Trait} from '@ame/meta-model';
import {SELECTOR_dialogStartButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test drag and drop', () => {
  it('Loading property element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-property-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].property.name).to.equal('externalPropertyWithChildren');

        expect(aspect.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic1');

        const entity = aspect.properties[0].property.characteristic.dataType;
        expect(entity.name).to.equal('ChildrenEntity1');

        expect(entity.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity.properties[1].property.name).to.equal('childrenProperty2');

        expect(entity.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].property.characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].property.characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (different:externalPropertyWithChildren)');

        expect(rdf).not.contain(':externalPropertyWithChildren a bamm:Property');
        expect(rdf).not.contain(':ChildrenCharacteristic1 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a bamm:Entity');
      });
  });

  it('Loading operation element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': ['external-operation-reference-with-children.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-operation-reference-with-children.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-operation-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-operation-reference-with-children')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(1);
        expect(aspect.operations[0].name).to.equal('externalOperationWithChildren');
        expect(aspect.operations[0].input).to.be.length(2);

        expect(aspect.operations[0].input[0].property.name).to.equal('childProperty1');
        expect(aspect.operations[0].input[0].property.characteristic.name).to.equal('ChildrenCharacteristic1');

        const entity1 = aspect.operations[0].input[0].property.characteristic.dataType;
        expect(entity1.name).to.equal('ChildrenEntity1');
        expect(entity1.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity1.properties[1].property.name).to.equal('childrenProperty2');
        expect(entity1.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity1.properties[1].property.characteristic.name).to.equal('Boolean');

        expect(aspect.operations[0].input[1].property.name).to.equal('childProperty2');
        expect(aspect.operations[0].input[1].property.characteristic.name).to.equal('ChildrenCharacteristic1');
        const entity2 = aspect.operations[0].input[1].property.characteristic.dataType;
        expect(entity2.name).to.equal('ChildrenEntity1');
        expect(entity2.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity2.properties[1].property.name).to.equal('childrenProperty2');
        expect(entity2.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity2.properties[1].property.characteristic.name).to.equal('Boolean');

        expect(aspect.operations[0].output.property.name).to.equal('childProperty3');
        expect(aspect.operations[0].output.property.characteristic.name).to.equal('ChildrenCharacteristic1');
        const entity3 = aspect.operations[0].output.property.characteristic.dataType;
        expect(entity3.name).to.equal('ChildrenEntity1');
        expect(entity3.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity3.properties[1].property.name).to.equal('childrenProperty2');
        expect(entity3.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity3.properties[1].property.characteristic.name).to.equal('Boolean');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:operations (different:externalOperationWithChildren)');

        expect(rdf).not.contain(':externalOperationWithChildren a bamm:Operation');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty3 a bamm:Property');
        expect(rdf).not.contain(':ChildrenCharacteristic1 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a bamm:Entity');
      });
  });

  it('Loading characteristic element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': ['external-characteristic-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-characteristic-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-characteristic-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].property.name).to.equal('property1');

        expect(aspect.properties[0].property.characteristic.name).to.equal('ExternalCharacteristicWithChildren');

        const entity = aspect.properties[0].property.characteristic.dataType;
        expect(entity.name).to.equal('ChildrenEntity1');

        expect(entity.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity.properties[1].property.name).to.equal('childrenProperty2');

        expect(entity.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].property.characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].property.characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic different:ExternalCharacteristicWithChildren');

        expect(rdf).not.contain(':ExternalCharacteristicWithChildren a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a bamm:Entity');
      });
  });

  it('Loading entity element with there children from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': ['external-entity-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-entity-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-entity-reference-with-childrens')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        console.log(aspect);

        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].property.name).to.equal('property1');

        expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');

        const entity = aspect.properties[0].property.characteristic.dataType;
        expect(entity.name).to.equal('ExternalEntityWithChildren');

        expect(entity.properties[0].property.name).to.equal('childrenProperty1');
        expect(entity.properties[1].property.name).to.equal('childrenProperty2');

        expect(entity.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
        expect(entity.properties[1].property.characteristic.name).to.equal('Boolean');

        expect(entity.properties[0].property.characteristic.dataType.name).to.equal('ChildrenEntity2');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm:dataType different:ExternalEntityWithChildren');

        expect(rdf).not.contain(':ExternalEntityWithChildren a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a bamm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a bamm:Entity');
      });
  });

  it('Loading unit element from external file with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': ['external-unit-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-unit-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-unit-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-external-unit-reference')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].property.name).to.equal('property1');

        expect(aspect.properties[0].property.characteristic.name).to.equal('Quantifiable1');

        const unit = (<DefaultQuantifiable>aspect.properties[0].property.characteristic).unit;
        expect(unit.name).to.equal('ExternalUnit');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:dataType xsd:string');
        expect(rdf).to.contain('bamm:characteristic :Quantifiable1');
        expect(rdf).to.contain(':Quantifiable1 a bamm-c:Quantifiable');
        expect(rdf).to.contain('bamm-c:unit different:ExternalUnit');

        expect(rdf).not.contain(':ExternalUnit a unit:Unit');
      });
  });

  it('Loading different elements from several external files with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.different:1.0.0': [
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
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-entity-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-characteristic-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-property-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-operation-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-trait-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-trait-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.different:1.0.0:external-constraint-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-constraint-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-several-external-reference')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(1000))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(2);
        expect(aspect.operations[0].name).to.equal('operation1');
        expect(aspect.operations[1].name).to.equal('externalOperation');

        expect(aspect.properties).to.be.length(5);
        expect(aspect.properties[0].property.name).to.equal('property1');
        expect(aspect.properties[1].property.name).to.equal('property2');
        expect(aspect.properties[2].property.name).to.equal('property3');
        expect(aspect.properties[3].property.name).to.equal('property4');
        expect(aspect.properties[4].property.name).to.equal('externalProperty');

        expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');
        expect(aspect.properties[1].property.characteristic.name).to.equal('ExternalCharacteristic');
        expect(aspect.properties[2].property.characteristic.name).to.equal('ExternalTrait');
        expect(aspect.properties[3].property.characteristic.name).to.equal('Property4Trait');

        expect((<Trait>aspect.properties[2].property.characteristic).constraints[0].name).to.equal('ConstraintInTrait');
        expect((<Trait>aspect.properties[2].property.characteristic).baseCharacteristic.name).to.equal('CharacteristicInTrait');
        expect((<Trait>aspect.properties[3].property.characteristic).constraints[0].name).to.equal('Constraint1');
        expect((<Trait>aspect.properties[3].property.characteristic).baseCharacteristic.name).to.equal('Characteristic1');

        expect(aspect.properties[0].property.characteristic.dataType.name).to.equal('ExternalEntity');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1 :property2 :property3 :property4 different:externalProperty)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm:dataType different:ExternalEntity');
        expect(rdf).to.contain(':property2 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic different:ExternalCharacteristic');
        expect(rdf).to.contain(':property3 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic different:ExternalTrait');
        expect(rdf).to.contain(':property4 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Property4Trait');
        expect(rdf).to.contain(':Property4Trait a bamm-c:Trait');
        expect(rdf).to.contain('bamm-c:baseCharacteristic :Characteristic1');
        expect(rdf).to.contain('bamm-c:constraint :Constraint1');
        expect(rdf).to.contain(':Constraint1 a bamm:Constraint');

        expect(rdf).not.contain(':externalProperty a bamm:Property');
        expect(rdf).not.contain(':ExternalEntity a bamm:Entity');
        expect(rdf).not.contain(':ExternalCharacteristic a bamm:Characteristic');
        expect(rdf).not.contain(':ExternalTraita bamm-c:Trait');
      });
  });
});
