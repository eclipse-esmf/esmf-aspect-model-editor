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

import {ModelElementNamingService} from '@ame/meta-model';
import {inject, Injectable} from '@angular/core';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCode,
  DefaultCollection,
  DefaultConstraint,
  DefaultDuration,
  DefaultEither,
  DefaultEncodingConstraint,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultList,
  DefaultMeasurement,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultSet,
  DefaultSingleEntity,
  DefaultSortedSet,
  DefaultState,
  DefaultStructuredValue,
  DefaultTimeSeries,
  DefaultTrait,
  DefaultUnit,
  NamedElement,
  XsdDataTypes,
} from '@esmf/aspect-model-loader';
import {config} from '../config';

const characteristics: {new (...x: any[]): NamedElement}[] = [
  DefaultCharacteristic,
  DefaultCode,
  DefaultCollection,
  DefaultDuration,
  DefaultEither,
  DefaultEnumeration,
  DefaultList,
  DefaultMeasurement,
  DefaultQuantifiable,
  DefaultSet,
  DefaultSortedSet,
  DefaultSingleEntity,
  DefaultState,
  DefaultStructuredValue,
  DefaultTimeSeries,
];

@Injectable({providedIn: 'root'})
export class ElementCreatorService {
  private modelElementNamingService = inject(ModelElementNamingService);

  createEmptyElement<T>(elementClass: {new (...x: any[]): T}, isAbstract = false): T {
    let element: any;
    switch (true) {
      case elementClass === DefaultAspect:
        element = new DefaultAspect({name: 'Aspect', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
        break;
      case elementClass === DefaultProperty:
        element = new DefaultProperty({
          name: isAbstract ? 'abstractProperty' : 'property',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: '',
          isAbstract,
          characteristic: isAbstract ? null : this.createEmptyElement(DefaultCharacteristic),
        });
        !isAbstract && element.characteristic.parents.push(element);
        break;
      case characteristics.includes(elementClass as any):
        element = new elementClass({
          name: 'Characteristic',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: '',
          dataType: new DefaultScalar({
            urn: new XsdDataTypes(config.currentSammVersion).getDataType('string').isDefinedBy,
            metaModelVersion: config.currentSammVersion,
          }),
        });
        break;
      case elementClass === DefaultEntity:
        element = new DefaultEntity({
          name: isAbstract ? 'AbstractEntity' : 'Entity',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: '',
          isAbstract,
        });
        break;
      case elementClass === DefaultUnit:
        element = new DefaultUnit({name: 'unit', metaModelVersion: config.currentSammVersion, aspectModelUrn: '', quantityKinds: []});
        break;
      case elementClass === DefaultConstraint:
        element = new DefaultEncodingConstraint({
          name: 'EncodingConstraint',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: '',
          value: 'UTF-8',
        });
        break;
      case (elementClass as any) === DefaultTrait:
        element = new DefaultTrait({name: 'Trait', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
        (element as DefaultTrait).baseCharacteristic = this.createEmptyElement(DefaultCharacteristic);
        (element as DefaultTrait).constraints.push(this.createEmptyElement(DefaultConstraint));
        break;
      case elementClass === DefaultOperation:
        element = new DefaultOperation({name: 'operation', metaModelVersion: config.currentSammVersion, aspectModelUrn: '', input: null});
        break;
      case elementClass === DefaultEvent:
        element = new DefaultEvent({name: 'event', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
        break;
      default:
        element = null;
    }
    return this.modelElementNamingService.resolveMetaModelElement(element) as T;
  }
}

// export function createEmptyElement<T>(elementClass: {new (...x: any[]): T}, isAbstract = false): T {
//   let element: any;
//   switch (true) {
//     case elementClass === DefaultAspect:
//       element = new DefaultAspect({name: 'Aspect', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
//       break;
//     case elementClass === DefaultProperty:
//       element = new DefaultProperty({
//         name: isAbstract ? 'abstractProperty' : 'property',
//         metaModelVersion: config.currentSammVersion,
//         aspectModelUrn: '',
//         isAbstract,
//         characteristic: createEmptyElement(DefaultCharacteristic),
//       });
//       element.characteristic.parents.push(element);
//       break;
//     case characteristics.includes(elementClass as any):
//       element = new elementClass({
//         name: 'Characteristic',
//         metaModelVersion: config.currentSammVersion,
//         aspectModelUrn: '',
//         dataType: new DefaultScalar({
//           urn: new XsdDataTypes(config.currentSammVersion).getDataType('string').isDefinedBy,
//           metaModelVersion: config.currentSammVersion,
//         }),
//       });
//       break;
//     case elementClass === DefaultEntity:
//       element = new DefaultEntity({
//         name: isAbstract ? 'AbstractEntity' : 'Entity',
//         metaModelVersion: config.currentSammVersion,
//         aspectModelUrn: '',
//         isAbstract,
//       });
//       break;
//     case elementClass === DefaultUnit:
//       element = new DefaultUnit({name: 'unit', metaModelVersion: config.currentSammVersion, aspectModelUrn: '', quantityKinds: []});
//       break;
//     case elementClass === DefaultConstraint:
//       element = new DefaultConstraint({name: 'Constraint', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
//       break;
//     case (elementClass as any) === DefaultTrait:
//       element = new DefaultTrait({name: 'Trait', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
//       (element as DefaultTrait).baseCharacteristic = createEmptyElement(DefaultCharacteristic);
//       (element as DefaultTrait).constraints.push(createEmptyElement(DefaultConstraint));
//       break;
//     case elementClass === DefaultOperation:
//       element = new DefaultOperation({name: 'operation', metaModelVersion: config.currentSammVersion, aspectModelUrn: '', input: null});
//       break;
//     case elementClass === DefaultEvent:
//       element = new DefaultEvent({name: 'event', metaModelVersion: config.currentSammVersion, aspectModelUrn: ''});
//       break;
//     default:
//       element = null;
//   }
//   return element as T;
// }
