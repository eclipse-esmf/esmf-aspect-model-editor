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
  FIELD_inputValues,
  FIELD_name,
  FIELD_output,
  SELECTOR_ecOperation,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {Aspect} from '@ame/meta-model';

describe('Test edit operation', () => {
  it('can add input and output properties', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.dragElement(SELECTOR_ecOperation, 100, 300))
      .then(() => cy.clickConnectShapes('AspectDefault', 'operation1'))
      .then(() => cyHelp.hasAddInputAndOutputShapeOverlay('operation1'))
      .then(hasInputAndOutputOverlay => expect(hasInputAndOutputOverlay).equal(true))
      .then(() => cy.clickAddInputShapeIcon('operation1'))
      .then(() => cy.clickAddInputShapeIcon('operation1'))
      .then(() => cy.clickAddInputShapeIcon('operation1'))
      .then(() => cy.clickAddOutputShapeIcon('operation1'))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('operation1');
          expect(aspect.operations[0].input).to.have.length(3);
          expect(aspect.operations[0].input[0].property.name).to.equal('property2');
          expect(aspect.operations[0].input[1].property.name).to.equal('property3');
          expect(aspect.operations[0].input[2].property.name).to.equal('property4');
          expect(aspect.operations[0].output.property.name).to.equal('property5');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:operation1)');
          expect(rdf).to.contain(':operation1 a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:property2 :property3 :property4)');
          expect(rdf).to.contain('bamm:output :property5');
          expect(rdf).to.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':property4 a bamm:Property');
          expect(rdf).to.contain(':property5 a bamm:Property');
        })
      );
  });

  it('can edit name', () => {
    cy.shapeExists('operation1')
      .then(() => cy.dbClickShape('operation1'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('newOperation', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(3);
          expect(aspect.operations[0].input[0].property.name).to.equal('property2');
          expect(aspect.operations[0].input[1].property.name).to.equal('property3');
          expect(aspect.operations[0].input[2].property.name).to.equal('property4');
          expect(aspect.operations[0].output.property.name).to.equal('property5');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:property2 :property3 :property4)');
          expect(rdf).to.contain('bamm:output :property5');
          expect(rdf).to.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':property4 a bamm:Property');
          expect(rdf).to.contain(':property5 a bamm:Property');
        })
      );
  });

  it('can delete input property2 and property4', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.clickShape('property2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.clickShape('property4'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(1);
          expect(aspect.operations[0].input[0].property.name).to.equal('property3');
          expect(aspect.operations[0].output.property.name).to.equal('property5');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:property3)');
          expect(rdf).to.contain('bamm:output :property5');
          expect(rdf).not.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).not.contain(':property4 a bamm:Property');
          expect(rdf).to.contain(':property5 a bamm:Property');
        })
      );
  });

  it('can delete output property5', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.clickShape('property5'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(1);
          expect(aspect.operations[0].input[0].property.name).to.equal('property3');
          expect(aspect.operations[0].output).to.be.null;
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:property3)');
          expect(rdf).not.contain('bamm:output :property5');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).not.contain(':property5 a bamm:Property');
        })
      );
  });

  it('can add input and output property in edit view', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() =>
        cy
          .get(FIELD_inputValues)
          .clear({force: true})
          .type('addInputProperty1', {force: true})
          .get('mat-option')
          .contains('addInputProperty1')
          .click({force: true})
      )
      .then(() =>
        cy
          .get(FIELD_inputValues)
          .clear({force: true})
          .type('addInputProperty2', {force: true})
          .get('mat-option')
          .contains('addInputProperty2')
          .click({force: true})
      )
      .then(() =>
        cy
          .get(FIELD_output)
          .clear({force: true})
          .type('addOutputProperty1', {force: true})
          .get('mat-option')
          .contains('addOutputProperty1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(3);
          expect(aspect.operations[0].input[0].property.name).to.equal('property3');
          expect(aspect.operations[0].input[1].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].input[2].property.name).to.equal('addInputProperty2');
          expect(aspect.operations[0].output.property.name).to.equals('addOutputProperty1');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:property3 :addInputProperty1 :addInputProperty2)');
          expect(rdf).to.contain('bamm:output :addOutputProperty1');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
        })
      );
  });

  it('can delete input and property3 and addInputProperty2 in edit view', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=input]').eq(0).click({force: true}))
      .then(() => cy.get('[data-cy=input]').eq(1).click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(1);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addOutputProperty1');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1)');
          expect(rdf).to.contain('bamm:output :addOutputProperty1');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
        })
      );
  });

  it('can delete output in edit view', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=clear-output-button]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_output)
          .clear({force: true})
          .type('addNewOutputProperty1', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(1);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty1');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1)');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty1');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty1 a bamm:Property');
        })
      );
  });

  it('change property from input to output and back', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=clear-output-button]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_inputValues)
          .clear({force: true})
          .type('addNewOutputProperty1', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty1')
          .click({force: true})
      )
      .then(() =>
        cy
          .get(FIELD_output)
          .clear({force: true})
          .type('addNewOutputProperty2', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty2')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(2);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].input[1].property.name).to.equal('addNewOutputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty2');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1 :addNewOutputProperty1)');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty2');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty2 a bamm:Property');
        })
      )
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=input]').eq(1).click({force: true}))
      .then(() => cy.get('[data-cy=clear-output-button]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_output)
          .clear({force: true})
          .type('addNewOutputProperty1', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(1);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty1');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1)');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty1');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty2 a bamm:Property');
        })
      );
  });

  it('Can use same property for input and output and if one is deleted the other remains', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() =>
        cy
          .get(FIELD_inputValues)
          .clear({force: true})
          .type('addNewOutputProperty1', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(2);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].input[1].property.name).to.equal('addNewOutputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty1');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1 :addNewOutputProperty1)');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty1');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty1 a bamm:Property');
        })
      )
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=clear-output-button]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_output)
          .clear({force: true})
          .type('addNewOutputProperty2', {force: true})
          .get('mat-option')
          .contains('addNewOutputProperty2')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(2);
          expect(aspect.operations[0].input[0].property.name).to.equal('addInputProperty1');
          expect(aspect.operations[0].input[1].property.name).to.equal('addNewOutputProperty1');
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty2');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input (:addInputProperty1 :addNewOutputProperty1)');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty2');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addNewOutputProperty1 a bamm:Property');
        })
      );
  });

  it('can delete all input properties in edit view', () => {
    cy.shapeExists('newOperation')
      .then(() => cy.dbClickShape('newOperation'))
      .then(() => cy.get('[data-cy=input]').eq(0).click({force: true}))
      .then(() => cy.get('[data-cy=input]').eq(0).click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.operations[0].name).to.equal('newOperation');
          expect(aspect.operations[0].input).to.have.length(0);
          expect(aspect.operations[0].output.property.name).to.equals('addNewOutputProperty2');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:operations (:newOperation)');
          expect(rdf).to.contain(':newOperation a bamm:Operation');
          expect(rdf).to.contain('bamm:input ()');
          expect(rdf).to.contain('bamm:output :addNewOutputProperty2');
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty1 a bamm:Property');
          expect(rdf).to.contain(':addInputProperty2 a bamm:Property');
          expect(rdf).to.contain(':addOutputProperty1 a bamm:Property');
        })
      );
  });
});
