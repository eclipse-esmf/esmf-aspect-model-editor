/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {simpleDataTypes} from '@ame/shared';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEnumeration, DefaultProperty, DefaultTrait, DefaultValue, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Quad_Subject, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class ValueVisitor extends BaseVisitor<DefaultValue> {
  public rdfNodeService = inject(RdfNodeService);
  public loadedFilesService = inject(LoadedFilesService);

  private store: Store;
  private samm: Samm;

  visit(value: DefaultValue, customSubject?: Quad_Subject, customDataTypeUrn?: string): DefaultValue {
    if (!customSubject && value.isAnonymous?.()) {
      return value;
    }

    this.store = this.loadedFilesService.currentLoadedFile.rdfModel.store;
    this.samm = this.loadedFilesService.currentLoadedFile.rdfModel.samm;

    if (!customSubject) {
      this.setPrefix(value.aspectModelUrn);
      const newAspectModelUrn = `${value.aspectModelUrn.split('#')[0]}#${value.name}`;
      value.aspectModelUrn = newAspectModelUrn;
    }
    this.updateProperties(value, customSubject);
    this.addValueProperty(value, customSubject, customDataTypeUrn);

    return value;
  }

  private updateProperties(value: DefaultValue, subject?: Quad_Subject) {
    const props = {
      preferredName: getPreferredNamesLocales(value)?.map(language => ({
        language,
        value: value.getPreferredName(language),
      })),
      description: getDescriptionsLocales(value)?.map(language => ({
        language,
        value: value.getDescription(language),
      })),
      see: value.getSee() || [],
    };
    if (subject) {
      this.rdfNodeService.update(value, props, subject);
    } else {
      this.rdfNodeService.update(value, props);
    }
  }

  private addValueProperty(value: DefaultValue, subject?: Quad_Subject, customDataTypeUrn?: string) {
    if (value.getValue() === undefined || value.getValue() === null) return;
    const subjectNode = subject || DataFactory.namedNode(value.aspectModelUrn);
    const dataTypeUrn = this.resolveDataTypeUrn(value, customDataTypeUrn);
    this.store.addQuad(
      subjectNode,
      this.samm.ValueProperty(),
      DataFactory.literal(value.getValue().toString(), DataFactory.namedNode(dataTypeUrn)),
    );
  }

  private resolveDataTypeUrn(value: DefaultValue, customDataTypeUrn?: string): string {
    if (customDataTypeUrn) {
      return customDataTypeUrn;
    }

    if (value.type) {
      const urn =
        value.type.urn ||
        value.type.aspectModelUrn ||
        (typeof (value.type as any).getUrn === 'function' ? (value.type as any).getUrn() : null);
      if (urn) return urn;
    }

    for (const parent of value.parents || []) {
      if (parent instanceof DefaultEnumeration || parent instanceof DefaultCharacteristic) {
        const dt = (parent as any).dataType;
        const urn = dt?.urn || dt?.aspectModelUrn || (typeof dt === 'string' ? dt : null);
        if (urn) return urn;
      }
      if (parent instanceof DefaultProperty) {
        const char = parent.characteristic;
        if (char instanceof DefaultTrait) {
          const urn = char.baseCharacteristic?.dataType?.urn || char.baseCharacteristic?.dataType?.aspectModelUrn;
          if (urn) return urn;
        } else if (char) {
          const urn = (char as any).dataType?.urn || (char as any).dataType?.aspectModelUrn;
          if (urn) return urn;
        }
      }
    }

    return simpleDataTypes.string.isDefinedBy;
  }
}
