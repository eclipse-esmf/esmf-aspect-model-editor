/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultValue, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class ValueVisitor extends BaseVisitor<DefaultValue> {
  public rdfNodeService = inject(RdfNodeService);
  public loadedFilesService = inject(LoadedFilesService);

  private store: Store;
  private samm: Samm;

  visit(value: DefaultValue): DefaultValue {
    this.store = this.loadedFilesService.currentLoadedFile.rdfModel.store;
    this.samm = this.loadedFilesService.currentLoadedFile.rdfModel.samm;

    this.setPrefix(value.aspectModelUrn);
    const newAspectModelUrn = `${value.aspectModelUrn.split('#')[0]}#${value.name}`;
    value.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(value);
    this.addValueProperty(value);

    return value;
  }

  private updateProperties(value: DefaultValue) {
    this.rdfNodeService.update(value, {
      preferredName: getPreferredNamesLocales(value)?.map(language => ({
        language,
        value: value.getPreferredName(language),
      })),
      description: getDescriptionsLocales(value)?.map(language => ({
        language,
        value: value.getDescription(language),
      })),
      see: value.getSee() || [],
    });
  }

  private addValueProperty(value: DefaultValue) {
    this.store.addQuad(DataFactory.namedNode(value.aspectModelUrn), this.samm.ValueProperty(), DataFactory.literal(value.getValue()));
  }
}
