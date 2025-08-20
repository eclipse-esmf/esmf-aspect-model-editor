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

import {DefaultAspect, DefaultEntity, DefaultProperty, PropertyPayload, PropertyUrn, Type} from '@esmf/aspect-model-loader';
import {ScalarValue} from 'libs/aspect-model-loader/src/lib/aspect-meta-model/scalar-value';
import {DataFactory} from 'n3';
import {ListElement, ListElementType, PropertyListElement, ResolvedListElements, SourceElementType} from '.';

// TODO refactor this function so it's more clear what happens here
export class RdfListHelper {
  static resolveNewElements(source: SourceElementType & {dataType?: Type}, elements: ListElementType[]): ResolvedListElements {
    const overWrittenListElements: PropertyListElement[] = [];
    let propertiesPayload: Record<PropertyUrn, PropertyPayload>;

    if (source instanceof DefaultEntity || source instanceof DefaultAspect) {
      propertiesPayload = source.propertiesPayload;
    }

    const listElements = elements.map(metaModelElement => {
      const property: DefaultProperty = metaModelElement;
      const propertyPayload: PropertyPayload = propertiesPayload?.[metaModelElement.aspectModelUrn];

      if (
        property instanceof DefaultProperty &&
        (propertyPayload?.optional || propertyPayload?.notInPayload || propertyPayload?.payloadName || metaModelElement.getExtends())
      ) {
        const blankNode = DataFactory.blankNode();
        overWrittenListElements.push({
          metaModelElement,
          propertyPayload,
          blankNode,
        });
        return blankNode;
      }

      if (metaModelElement.aspectModelUrn) {
        return DataFactory.namedNode(metaModelElement.aspectModelUrn);
      } else if (metaModelElement?.value && !(metaModelElement instanceof ScalarValue)) {
        return DataFactory.namedNode(metaModelElement?.value);
      }

      if (metaModelElement instanceof ScalarValue) {
        return DataFactory.literal(`${metaModelElement.value}`, DataFactory.namedNode(source.dataType.urn));
      }

      return DataFactory.literal(metaModelElement, DataFactory.namedNode(source.dataType.urn));
    });

    return {
      listElements,
      overWrittenListElements,
    };
  }

  static getElementValue(element: ListElementType) {
    return element?.aspectModelUrn || element?.property?.aspectModelUrn || element?.value || element;
  }

  static filterDuplicates(elements: ListElementType[], exitingElements: ListElement[]) {
    return elements.filter(e => !exitingElements.find(({node, name}) => (name ? name : node.value) === RdfListHelper.getElementValue(e)));
  }
}
