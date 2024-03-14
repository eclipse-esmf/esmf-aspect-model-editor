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

import {DataFactory, NamedNode, Quad, Quad_Object, Util} from 'n3';
import {DefaultEntity, DefaultEntityValue, Entity, LangStringProperty, OverWrittenProperty} from '@ame/meta-model';
import {EntityInstantiator} from './entity-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Samm} from '@ame/vocabulary';
import {syncElementWithChildren} from '../helpers';
import {InstantiatorListElement} from '@ame/rdf/models';

export class EntityValueInstantiator {
  private get samm(): Samm {
    return this.metaModelElementInstantiator.samm;
  }

  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get namespaceCacheService() {
    return this.metaModelElementInstantiator.namespaceCacheService;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  createEntityValue(quads: Quad[], object: Quad_Object) {
    if (!quads.length) {
      const {externalReference} = this.metaModelElementInstantiator.getExternalElement<DefaultEntityValue>(
        object,
        this.rdfModel.isExternalRef,
      );
      if (externalReference) {
        return externalReference;
      }
    }

    const subject = quads[0].subject.value;
    const cachedElement = this.cachedFile.getElement<DefaultEntityValue>(subject);
    if (cachedElement) {
      return cachedElement;
    }

    const defaultEntityValue = new DefaultEntityValue(null, null, null, null, []);
    defaultEntityValue.name = subject.split('#')?.[1];
    defaultEntityValue.aspectModelUrn = subject;
    defaultEntityValue.entity = this.getEntity(quads) as DefaultEntity;
    defaultEntityValue.fileName = this.metaModelElementInstantiator.fileName;
    defaultEntityValue.setExternalReference(this.rdfModel.isExternalRef);

    if (defaultEntityValue.entity) defaultEntityValue.children.push(defaultEntityValue.entity);

    // saving into cache earlier to prevent infinite loop
    this.cachedFile.resolveElement(defaultEntityValue);

    const properties = quads.filter(({predicate}) => !this.samm.RdfType().equals(predicate));
    for (const property of properties) {
      const processQuad = Util.isBlankNode(property.object) ? this.processBlankNode : this.processNode;
      processQuad.call(this, property, defaultEntityValue);
    }

    return this.cachedFile.resolveElement(defaultEntityValue);
  }

  private getEntity(quads: Quad[]): Entity {
    const quad = quads.find(({predicate}) => this.samm.RdfType().equals(predicate));
    if (!quad) {
      return null;
    }
    const entity = this.namespaceCacheService.findElementOnExtReference<Entity>(quad.object.value);
    if (entity) {
      return entity;
    }

    return (
      this.cachedFile.getElement(quad.object.value) ||
      new EntityInstantiator(this.metaModelElementInstantiator).createEntity(
        this.metaModelElementInstantiator.rdfModel.findAnyProperty(DataFactory.namedNode(quad.object.value)),
      )
    );
  }

  private processBlankNode(property: Quad, defaultEntityValue: DefaultEntityValue): void {
    const blankQuads = this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(property.object.value);
    for (const blankQuad of blankQuads) {
      this.processQuadValue(blankQuad, defaultEntityValue, property.predicate);
    }
  }

  private processNode(property: Quad, defaultEntityValue: DefaultEntityValue): void {
    this.processQuadValue(property, defaultEntityValue);
  }

  private processQuadValue(quad: Quad, defaultEntityValue: DefaultEntityValue, predicateOverride?: any): void {
    const isLiteral = Util.isLiteral(quad.object);
    const processMethod = isLiteral ? this.processLiteralValue : this.processNonLiteralValue;
    processMethod.call(this, quad, defaultEntityValue, predicateOverride);
  }

  private processLiteralValue(quad: Quad, defaultEntityValue: DefaultEntityValue, predicateOverride?: any): void {
    this.resolveProperty(predicateOverride || quad.predicate, (overwrittenProperty: OverWrittenProperty) => {
      const propertyValue = this.getPropertyValue(quad);
      defaultEntityValue.addProperty(overwrittenProperty, propertyValue);
      syncElementWithChildren(defaultEntityValue);
    });
  }

  private processNonLiteralValue(quad: Quad, defaultEntityValue: DefaultEntityValue, predicateOverride?: any): void {
    const value = this.cachedFile.getElement<DefaultEntityValue>(quad.object.value);
    if (value) {
      this.resolveProperty(predicateOverride || quad.predicate, (overwrittenProperty: OverWrittenProperty) => {
        defaultEntityValue.addProperty(overwrittenProperty, value);
        syncElementWithChildren(defaultEntityValue);
      });
      return;
    }
    this.queueEntityValueInstantiation(quad, defaultEntityValue);
  }

  private resolveProperty(predicate: any, callback: (property: OverWrittenProperty) => void): void {
    this.metaModelElementInstantiator.getProperty({quad: predicate}, callback);
  }

  private getPropertyValue(property: Quad): string | LangStringProperty | DefaultEntityValue {
    if (this.rdfModel.hasLocalTag(property)) {
      return {
        language: this.rdfModel.getLocale(property),
        value: property.object.value,
      };
    }

    return property.object.value;
  }

  private queueEntityValueInstantiation(quad: Quad, defaultEntityValue: DefaultEntityValue): void {
    this.metaModelElementInstantiator.addInstantiatorFunctionToQueue(this.instantiateEntityValue.bind(this, quad, defaultEntityValue));
  }

  private instantiateEntityValue(property: Quad, defaultEntityValue: DefaultEntityValue) {
    if (property.object.equals(this.samm.RdfNil())) {
      return;
    }

    const value = new EntityValueInstantiator(this.metaModelElementInstantiator).createEntityValue(
      this.metaModelElementInstantiator.rdfModel.findAnyProperty(property.object as NamedNode),
      property.object,
    );
    this.metaModelElementInstantiator.getProperty({quad: property.predicate}, (overwrittenProperty: OverWrittenProperty) => {
      defaultEntityValue.addProperty(overwrittenProperty, value);
      defaultEntityValue.children.push(value);
      value.parents.push(defaultEntityValue);
    });
  }
}
