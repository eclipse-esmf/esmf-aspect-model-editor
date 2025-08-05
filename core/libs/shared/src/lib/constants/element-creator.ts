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

import {LoadedFilesService} from '@ame/cache';
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

type ElementConfig = Partial<{
  isAbstract: boolean;
  baseCharacteristic: DefaultCharacteristic;
}>;

@Injectable({providedIn: 'root'})
export class ElementCreatorService {
  private modelElementNamingService = inject(ModelElementNamingService);
  private loadedFiles = inject(LoadedFilesService);

  get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  createEmptyElement<T>(elementClass: {new (...x: any[]): T}, elementConfig: ElementConfig = {}): T {
    let element: any;
    const namespace = this.currentFile.namespace;

    switch (true) {
      case elementClass === DefaultAspect:
        element = new DefaultAspect({name: 'Aspect', metaModelVersion: config.currentSammVersion, aspectModelUrn: `${namespace}#Aspect`});
        break;
      case elementClass === DefaultProperty:
        element = new DefaultProperty({
          name: elementConfig.isAbstract ? 'abstractProperty' : 'property',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#${elementConfig.isAbstract ? 'abstractProperty' : 'property'}`,
          isAbstract: elementConfig.isAbstract,
          characteristic: elementConfig.isAbstract ? null : this.createEmptyElement(DefaultCharacteristic),
        });
        if (!elementConfig.isAbstract) element.characteristic.parents.push(element);
        break;
      case characteristics.includes(elementClass as any):
        element = new elementClass({
          name: 'Characteristic',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#Characteristic`,
          dataType: new DefaultScalar({
            urn: new XsdDataTypes(config.currentSammVersion).getDataType('string').isDefinedBy,
            metaModelVersion: config.currentSammVersion,
          }),
        });
        break;
      case elementClass === DefaultEntity:
        element = new DefaultEntity({
          name: elementConfig.isAbstract ? 'AbstractEntity' : 'Entity',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#${elementConfig.isAbstract ? 'AbstractEntity' : 'Entity'}`,
          isAbstract: elementConfig.isAbstract,
        });
        break;
      case elementClass === DefaultUnit:
        element = new DefaultUnit({
          name: 'unit',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#unit`,
          quantityKinds: [],
        });
        break;
      case elementClass === DefaultConstraint:
        element = new DefaultEncodingConstraint({
          name: 'EncodingConstraint',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#EncodingConstraint`,
          value: 'UTF-8',
        });
        break;
      case (elementClass as any) === DefaultTrait:
        element = new DefaultTrait({name: 'Trait', metaModelVersion: config.currentSammVersion, aspectModelUrn: `${namespace}#Trait`});
        (element as DefaultTrait).baseCharacteristic = elementConfig.baseCharacteristic || this.createEmptyElement(DefaultCharacteristic);
        (element as DefaultTrait).constraints.push(this.createEmptyElement(DefaultConstraint));
        break;
      case elementClass === DefaultOperation:
        element = new DefaultOperation({
          name: 'operation',
          metaModelVersion: config.currentSammVersion,
          aspectModelUrn: `${namespace}#operation`,
          input: null,
        });
        break;
      case elementClass === DefaultEvent:
        element = new DefaultEvent({name: 'event', metaModelVersion: config.currentSammVersion, aspectModelUrn: `${namespace}#event`});
        break;
      default:
        element = null;
    }
    return this.modelElementNamingService.resolveMetaModelElement(element) as T;
  }
}
