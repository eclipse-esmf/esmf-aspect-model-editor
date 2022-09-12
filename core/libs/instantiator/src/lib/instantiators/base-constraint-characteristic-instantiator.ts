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

import {NamedNode, Quad, Util} from 'n3';
import {BaseMetaModelElement, DefaultConstraint} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Bamm, Bammc} from '@ame/vocabulary';

export class BaseConstraintCharacteristicInstantiator {
  public bamm: Bamm;
  public bammc: Bammc;

  protected get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  protected get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(
    protected metaModelElementInstantiator: MetaModelElementInstantiator,
    public nextProcessor?: BaseConstraintCharacteristicInstantiator
  ) {
    this.bamm = metaModelElementInstantiator.bamm;
    this.bammc = metaModelElementInstantiator.bammc;
  }

  create(quad: Quad): BaseMetaModelElement {
    const cachedElement = this.cachedFile.getElement<BaseMetaModelElement>(quad.object.value, this.isIsolated);
    if (cachedElement) {
      return cachedElement;
    }

    const propertyQuads: Array<Quad> = this.metaModelElementInstantiator.rdfModel.findAnyProperty(quad);
    const elementQuad = (
      Util.isBlankNode(quad.object) ? this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value) : propertyQuads
    ).find(q => q.predicate.equals(this.bamm.RdfType()));

    if (!this.shouldProcess(<NamedNode>elementQuad.object)) {
      return this.nextProcessor !== null ? this.nextProcessor.create(quad) : null;
    }

    // post init all common properties of the meta model element
    const element = this.processElement(propertyQuads);
    element.fileName = this.metaModelElementInstantiator.fileName;

    (<DefaultConstraint>element).setAnonymouseNode(Util.isBlankNode(quad.object));
    this.metaModelElementInstantiator.initBaseProperties(propertyQuads, element, this.metaModelElementInstantiator.rdfModel);

    return element;
  }

  /**
   * This method must be override from the respective constraint or characteristic instantiator implementation
   * in order to initialize the specific properties.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processElement(quads: Array<Quad>): BaseMetaModelElement {
    return null;
  }

  /**
   * This method must be override from the respective constraint or characteristic instantiator implementation in order to get called.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldProcess(namedNode: NamedNode): boolean {
    return true;
  }
}
