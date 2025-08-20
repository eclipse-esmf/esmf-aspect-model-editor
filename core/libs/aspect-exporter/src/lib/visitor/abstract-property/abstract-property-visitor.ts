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
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {Injectable, inject} from '@angular/core';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class AbstractPropertyVisitor extends BaseVisitor<DefaultProperty> {
  private rdfNodeService = inject(RdfNodeService);

  private get store(): Store {
    return this.loadedFiles.currentLoadedFile?.rdfModel?.store;
  }

  constructor(loadedFiles: LoadedFilesService) {
    super(loadedFiles);
  }

  visit(abstractProperty: DefaultProperty): DefaultProperty {
    if (abstractProperty.isPredefined) {
      return null;
    }

    this.setPrefix(abstractProperty.aspectModelUrn);
    const oldAspectModelUrn = abstractProperty.aspectModelUrn;
    this.addExtends(abstractProperty);
    this.addProperties(abstractProperty);
    if (oldAspectModelUrn !== abstractProperty.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return abstractProperty;
  }

  private addProperties(abstractProperty: DefaultProperty) {
    this.rdfNodeService.update(abstractProperty, {
      exampleValue: abstractProperty.exampleValue,
      preferredName: getPreferredNamesLocales(abstractProperty).map(language => ({
        language,
        value: abstractProperty.getPreferredName(language),
      })),
      description: getDescriptionsLocales(abstractProperty).map(language => ({
        language,
        value: abstractProperty.getDescription(language),
      })),
      see: abstractProperty.getSee() || [],
    });
  }

  private addExtends(abstractProperty: DefaultProperty) {
    if (!abstractProperty.getExtends()) {
      return;
    }

    this.setPrefix(abstractProperty.getExtends().aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(abstractProperty.aspectModelUrn),
      this.loadedFiles.currentLoadedFile.rdfModel.samm.Extends(),
      DataFactory.namedNode(abstractProperty.getExtends().aspectModelUrn),
    );
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
