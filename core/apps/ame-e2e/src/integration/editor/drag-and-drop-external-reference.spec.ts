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

import {
  SELECTOR_closeSidebarButton,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
  SELECTOR_ecEntity,
  SELECTOR_ecProperty,
  SELECTOR_ecTrait,
  SELECTOR_openNamespacesButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {Aspect, Entity, Trait} from '@ame/meta-model';

describe('Test drag and drop', () => {
  function connectElements(parent: string, child: string, expected: boolean) {
    return cy
      .clickConnectShapes(parent, child)
      .then(() => cyHelp.hasAddShapeOverlay(parent).then(hasAddOverlay => expect(hasAddOverlay).equal(expected)));
  }

  function checkRelationParentChild(parentModel, parent: string, child: string) {
    expect(parentModel.name).to.equal(parent);
    expect(parentModel.properties).to.be.length(2);
    expect(parentModel.properties[1].property.name).to.equal(child);
  }

  function checkAspect(aspect) {
    expect(aspect.name).to.equal('AspectDefault');
    expect(aspect.properties).to.be.length(1);
    expect(aspect.properties[0].property.name).to.equal('property1');
    expect(aspect.properties[0].property.characteristic.name).to.equal('ExternalCharacteristic');
  }

  function checkASpectAndChildrenConstraint(aspect) {
    expect(aspect.name).to.equal('AspectDefault');
    expect(aspect.properties).to.be.length(1);
    expect(aspect.properties[0].property.name).to.equal('property1');
    expect(aspect.properties[0].property.characteristic.name).to.equal('Trait1');
    expect((<Trait>aspect.properties[0].property.characteristic).baseCharacteristic.name).to.equal('Characteristic1');
    expect((<Trait>aspect.properties[0].property.characteristic).constraints[0].name).to.equal('ExternalConstraint');
  }

  function checkAspectAndChildrenEntity(aspect) {
    expect(aspect.name).to.equal('AspectDefault');
    expect(aspect.properties).to.be.length(1);
    expect(aspect.properties[0].property.name).to.equal('property1');
    expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');
    expect(aspect.properties[0].property.characteristic.dataType.name).to.equal('ExternalEntity');
  }

  function checkAspectTree(aspect) {
    expect(aspect.name).to.equal('AspectDefault');
    expect(aspect.properties).to.be.length(2);
    expect(aspect.properties[0].property.name).to.equal('property1');
    expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');
    expect(aspect.properties[1].property.name).to.equal('externalPropertyWithChildren');
    expect(aspect.properties[1].property.characteristic.name).to.equal('ChildrenCharacteristic1');

    const entity = aspect.properties[1].property.characteristic.dataType;
    expect(entity.name).to.equal('ChildrenEntity1');
    expect(entity.properties).to.be.length(2);
    expect(entity.properties[0].property.name).to.equal('childrenProperty1');
    expect(entity.properties[1].property.name).to.equal('childrenProperty2');
    expect(entity.properties[0].property.characteristic.name).to.equal('ChildrenCharacteristic2');
    expect(entity.properties[0].property.characteristic.dataType.name).to.equal('ChildrenEntity2');
    expect(entity.properties[1].property.characteristic.name).to.equal('Boolean');
  }

  it('can add Property from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
      .then(() => cy.clickShape('externalProperty'))
      .then(() => connectElements('AspectDefault', 'externalProperty', true))
      .then(() => cy.getAspect())
      .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1 :externalProperty)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).not.contain(':externalProperty a bamm:Property');
      });
  });

  it('can add Characteristic from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-characteristic-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-characteristic-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecCharacteristic, 100, 300))
      .then(() => cy.clickShape('ExternalCharacteristic'))
      .then(() => connectElements('property1', 'ExternalCharacteristic', false))
      .then(() => cy.getAspect())
      .then(checkAspect)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :ExternalCharacteristic');
        expect(rdf).not.contain(':ExternalCharacteristic a bamm:Characteristic');
      });
  });

  it('can add Constraint from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-constraint-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-constraint-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-constraint-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecConstraint, 100, 300))
      .then(() => cy.clickShape('ExternalConstraint'))
      .then(() => cy.get(SELECTOR_closeSidebarButton).click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecTrait, 1100, 300).then(() => cy.clickShape('Trait1')))
      .then(() => cy.clickConnectShapes('property1', 'Trait1'))
      .then(() => cy.clickConnectShapes('Trait1', 'Characteristic1'))
      .then(() => cy.clickConnectShapes('Trait1', 'ExternalConstraint'))
      .then(() => cyHelp.hasAddShapeOverlay('Trait1').then(hasAddOverlay => expect(hasAddOverlay).equal(true)))
      .then(() => cy.getAspect())
      .then(checkASpectAndChildrenConstraint)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Trait1');
        expect(rdf).to.contain('bamm-c:baseCharacteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm-c:constraint :ExternalConstraint');

        expect(rdf).not.contain(':ExternalConstraint a bamm:Constraint');
      });
  });

  it('can add Entity from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-entity-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-entity-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecEntity, 100, 300))
      .then(() => cy.clickShape('ExternalEntity'))
      .then(() => connectElements('Characteristic1', 'ExternalEntity', false))
      .then(() => cy.getAspect())
      .then(checkAspectAndChildrenEntity)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm:dataType :ExternalEntity');

        expect(rdf).not.contain(':ExternalEntity a bamm:Entity');
      });
  });

  it('can add Property from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.different:1.0.0': ['external-property-reference.txt'],
    });

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

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
      .then(() => cy.clickShape('externalProperty'))
      .then(() => connectElements('AspectDefault', 'externalProperty', true))
      .then(() => cy.getAspect())
      .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1 ext-different:externalProperty)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');

        expect(rdf).not.contain(':externalProperty a bamm:Property');
      });
  });

  it('can add Characteristic from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.different:1.0.0': ['external-characteristic-reference.txt'],
    });

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

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecCharacteristic, 100, 300))
      .then(() => cy.clickShape('ExternalCharacteristic'))
      .then(() => connectElements('property1', 'ExternalCharacteristic', false))
      .then(() => cy.getAspect())
      .then(checkAspect)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic ext-different:ExternalCharacteristic');

        expect(rdf).not.contain(':ExternalCharacteristic a bamm:Characteristic');
      });
  });

  it('can add Constraint from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.different:1.0.0': ['external-constraint-reference.txt'],
    });

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
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecConstraint, 100, 300))
      .then(() => cy.clickShape('ExternalConstraint'))
      .then(() => cy.get(SELECTOR_closeSidebarButton).click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecTrait, 1100, 300).then(() => cy.clickShape('Trait1')))
      .then(() => cy.clickConnectShapes('property1', 'Trait1'))
      .then(() => cy.clickConnectShapes('Trait1', 'Characteristic1'))
      .then(() => cy.clickConnectShapes('Trait1', 'ExternalConstraint'))
      .then(() => cyHelp.hasAddShapeOverlay('Trait1').then(hasAddOverlay => expect(hasAddOverlay).equal(true)))
      .then(() => cy.getAspect())
      .then(checkASpectAndChildrenConstraint)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Trait1');
        expect(rdf).to.contain('bamm-c:baseCharacteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm-c:constraint ext-different:ExternalConstraint');

        expect(rdf).not.contain(':ExternalConstraint a bamm:Constraint');
      });
  });

  it('can add Entity from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.different:1.0.0': ['external-entity-reference.txt'],
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

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecEntity, 100, 300))
      .then(() => cy.clickShape('ExternalEntity'))
      .then(() => connectElements('Characteristic1', 'ExternalEntity', false))
      .then(() => cy.getAspect())
      .then(checkAspectAndChildrenEntity)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');
        expect(rdf).to.contain('bamm:dataType ext-different:ExternalEntity');

        expect(rdf).not.contain(':ExternalEntity a bamm:Entity');
      });
  });

  it("can add Property with children's from external reference same namespace", () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
      .then(() => cy.clickShape('externalPropertyWithChildren'))
      .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
      .then(() => cy.getAspect())
      .then(checkAspectTree)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:property1 :externalPropertyWithChildren)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');

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

  it("can add Property with children's from external reference different namespace", () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces', {
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
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
      .then(() => cy.clickShape('externalPropertyWithChildren'))
      .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
      .then(() => cy.getAspect())
      .then(checkAspectTree)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:bamm:io.openmanufacturing.digitaltwin:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:bamm:io.openmanufacturing.different:1.0.0#>.');
        expect(rdf).to.contain('bamm:properties (:property1 ext-different:externalPropertyWithChildren)');
        expect(rdf).to.contain(':property1 a bamm:Property');
        expect(rdf).to.contain('bamm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic');

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

  const dragExternalReferenceWithChildren = (selector: string, x: number, y: number) => {
    cy.getMxgraphAttributeService().then((service: MxGraphAttributeService) => {
      const container = service.graph.container;
      const {scrollLeft, scrollTop} = container;

      const graphX = scrollLeft + x;
      const graphY = scrollTop + y;

      if (Cypress.platform === 'darwin') {
        return cy
          .get(':nth-child(1) > ' + selector)
          .trigger('mousedown', {which: 1, force: true})
          .trigger('mousemove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
          .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('mouseup', {force: true}));
      }

      return cy
        .get(':nth-child(1) > ' + selector)
        .trigger('pointerdown', {which: 1, force: true})
        .trigger('pointermove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
        .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('pointerup', {force: true}));
    });
  };
});
