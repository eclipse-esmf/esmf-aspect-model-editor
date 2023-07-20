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

import {InstantiatorListElement} from '@ame/rdf/utils';
import {DefaultAbstractProperty, OverWrittenProperty, OverWrittenPropertyKeys} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {syncElementWithChildren} from '../helpers';

export class AbstractPropertyInstantiator {
  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get currentCachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  public createAbstractProperty(listElement: InstantiatorListElement): OverWrittenProperty<DefaultAbstractProperty> {
    const property = this.currentCachedFile.getElement<DefaultAbstractProperty>(listElement.quad.value);
    return property ? {property, keys: this.resolveOverwrittenKeys(listElement)} : this.constructAbstractProperty(listElement);
  }

  public resolveOverwrittenKeys(element: InstantiatorListElement): OverWrittenPropertyKeys {
    return {
      optional: element.optional?.value === 'true',
      notInPayload: element.notInPayload?.value === 'true',
      payloadName: element.payloadName?.value,
    };
  }

  private constructAbstractProperty(listElement: InstantiatorListElement): OverWrittenProperty<DefaultAbstractProperty> {
    const samm = this.metaModelElementInstantiator.samm;
    const property = new DefaultAbstractProperty(null, null, null, null);
    const quads = this.rdfModel.findAnyProperty(listElement.quad) || [];
    property.setExternalReference(this.rdfModel.isExternalRef);
    property.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, property, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(property);

    for (const quad of quads) {
      if (samm.isExampleValueProperty(quad.predicate.value)) {
        property.exampleValue = quad.object.value;
      }

      if (samm.isExtendsProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getProperty({quad: quad.object}, extractedAbstractProperty => {
          property.extendedElement = extractedAbstractProperty?.property;
          property.extendedElement ? property.children.push(property.extendedElement) : null;
        });
      }
    }

    syncElementWithChildren(property);
    return {
      property,
      keys: this.resolveOverwrittenKeys(listElement),
    };
  }
}
