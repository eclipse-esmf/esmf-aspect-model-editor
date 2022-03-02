/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DataFactory} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {BammCharacteristicInstantiator} from './bamm-characteristic-instantiator';
import {OverWrittenProperty, DefaultProperty, OverWrittenPropertyKeys, Characteristic, BaseMetaModelElement} from '@bame/meta-model';
import {InstantiatorListElement, RdfModel} from '@bame/rdf/utils';

export class PropertyInstantiator {
  private readonly predefinedCharacteristics;

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get currentCachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.predefinedCharacteristics = new BammCharacteristicInstantiator(metaModelElementInstantiator).predefinedCharacteristics;
  }

  public createProperty(listElement: InstantiatorListElement): OverWrittenProperty {
    const property = this.currentCachedFile.getElement<DefaultProperty>(listElement.quad.value, this.isIsolated);
    return property ? {property, keys: this.resolveOverwrittenKeys(listElement)} : this.constructProperty(listElement);
  }

  public resolveOverwrittenKeys(element: InstantiatorListElement): OverWrittenPropertyKeys {
    return {
      optional: element.optional?.value === 'true',
      notInPayload: element.notInPayload?.value === 'true',
      payloadName: element.payloadName?.value,
    };
  }

  private constructProperty(listElement: InstantiatorListElement): OverWrittenProperty {
    const bamm = this.metaModelElementInstantiator.bamm;
    const property = new DefaultProperty(null, null, null, null);
    const quads = this.resolveQuads(listElement, this.rdfModel);
    property.setExternalReference(this.rdfModel.isExternalRef);

    this.metaModelElementInstantiator.initBaseProperties(quads, property, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(property, this.isIsolated);

    for (const quad of quads) {
      if (bamm.isCharacteristicProperty(quad.predicate.value)) {
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
        });
      }

      if (bamm.isExampleValueProperty(quad.predicate.value)) {
        property.exampleValue = quad.object.value;
      }
    }

    return {
      property,
      keys: this.resolveOverwrittenKeys(listElement),
    };
  }

  private resolveQuads(element: InstantiatorListElement, rdfModel: RdfModel) {
    return element.quad ? rdfModel.findAnyProperty(DataFactory.namedNode(element.quad.value)) : [];
  }
}
