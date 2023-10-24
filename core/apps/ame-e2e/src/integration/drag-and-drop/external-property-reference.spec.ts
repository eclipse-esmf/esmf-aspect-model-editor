/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  SELECTOR_ecProperty,
  SELECTOR_fileMenuFindElements,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_openNamespacesButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {MxGraphAttributeService} from '@ame/mx-graph';

describe('Test drag and drop ext properties', () => {
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
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.examples:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.examples:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalProperty'))
        .then(() => connectElements('AspectDefault', 'externalProperty', true))
        .then(() => cy.getAspect())
        .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1 :externalProperty)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':externalProperty a samm:Property');
        })
    );
  });

  it('can add Property from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalProperty'))
        .then(() => connectElements('AspectDefault', 'externalProperty', true))
        .then(() => cy.getAspect())
        .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples:1.0.0#>.');
          expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
          expect(rdf).to.contain('samm:properties (:property1 ext-different:externalProperty)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');

          expect(rdf).not.contain(':externalProperty a samm:Property');
        })
    );
  });

  it("can add Property with children's from external reference same namespace", () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.examples:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.examples:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalPropertyWithChildren'))
        .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
        .then(() => cy.getAspect())
        .then(checkAspectTree)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1 :externalPropertyWithChildren)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':externalPropertyWithChildren a samm:Property');
          expect(rdf).not.contain(':ChildrenCharacteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
          expect(rdf).not.contain(':childrenProperty1 a samm:Property');
          expect(rdf).not.contain(':childrenProperty2 a samm:Property');
          expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
          expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
          expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
        })
    );
  });

  it("can add Property with children's from external reference different namespace", () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalPropertyWithChildren'))
        .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
        .then(() => cy.getAspect())
        .then(checkAspectTree)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples:1.0.0#>.');
          expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
          expect(rdf).to.contain('samm:properties (:property1 ext-different:externalPropertyWithChildren)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':externalPropertyWithChildren a samm:Property');
          expect(rdf).not.contain(':ChildrenCharacteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
          expect(rdf).not.contain(':childrenProperty1 a samm:Property');
          expect(rdf).not.contain(':childrenProperty2 a samm:Property');
          expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
          expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
          expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
        })
    );
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
