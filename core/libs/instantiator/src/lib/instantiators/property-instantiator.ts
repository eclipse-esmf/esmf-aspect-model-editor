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

import {syncElementWithChildren} from '../helpers';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {PredefinedCharacteristicInstantiator} from './predefined-characteristic-instantiator';
import {BaseMetaModelElement, Characteristic, DefaultProperty, OverWrittenProperty, OverWrittenPropertyKeys} from '@ame/meta-model';
import {InstantiatorListElement} from '@ame/rdf/models';

export class PropertyInstantiator {
  private readonly predefinedCharacteristics;

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get currentCachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.predefinedCharacteristics = new PredefinedCharacteristicInstantiator(metaModelElementInstantiator).predefinedCharacteristics;
  }

  public createProperty(listElement: InstantiatorListElement): OverWrittenProperty {
    const property = this.currentCachedFile.getElement<DefaultProperty>(listElement.quad.value);
    return property ? {property, keys: this.resolveOverwrittenKeys(listElement)} : this.constructProperty(listElement);
  }

  public resolveOverwrittenKeys(element: InstantiatorListElement): OverWrittenPropertyKeys {
    return {
      optional: element.optional?.value === 'true',
      notInPayload: element.notInPayload?.value === 'true',
      payloadName: element.payloadName?.value
    };
  }

  private constructProperty(listElement: InstantiatorListElement): OverWrittenProperty {
    const samm = this.metaModelElementInstantiator.samm;
    const property = new DefaultProperty(null, null, null, null);
    const quads = this.rdfModel.findAnyProperty(listElement.quad) || [];
    property.setExternalReference(this.rdfModel.isExternalRef);
    property.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, property, this.rdfModel);
    if (listElement.blankNode) {
      property.aspectModelUrn = listElement.quad.value;
    }
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(property);

    for (const quad of quads) {
      if (samm.isCharacteristicProperty(quad.predicate.value)) {
        const objectValue = quad.object.value;
        const recursiveModelElement = this.metaModelElementInstantiator.recursiveModelElements.get(quad.object.value);

        this.metaModelElementInstantiator.loadCharacteristic(quad, property.isExternalReference(), (characteristic: Characteristic) => {
          if (
            recursiveModelElement &&
            recursiveModelElement.length > 0 &&
            !this.predefinedCharacteristics.hasOwnProperty(characteristic.aspectModelUrn)
          ) {
            this.metaModelElementInstantiator.recursiveModelElements.set(quad.object.value, recursiveModelElement);
          } else {
            this.metaModelElementInstantiator.recursiveModelElements.set(objectValue, new Array<BaseMetaModelElement>());
            property.characteristic = characteristic;
          }

          if (property.characteristic) property.children.push(property.characteristic);
          syncElementWithChildren(property);
        });
      }

      if (samm.isExampleValueProperty(quad.predicate.value)) {
        property.exampleValue = quad.object.value;
      }

      if (samm.isExtendsProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getProperty({quad: quad.object}, extractedProperty => {
          property.extendedElement = extractedProperty?.property;
          if (property.extendedElement) {
            property.name = `[${property.extendedElement.name}]`;
            property.children.push(property.extendedElement);
            syncElementWithChildren(property);
          }
        });
      }
    }

    return {
      property,
      keys: this.resolveOverwrittenKeys(listElement)
    };
  }
}
