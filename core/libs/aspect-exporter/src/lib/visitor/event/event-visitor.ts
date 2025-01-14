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

import {ListProperties, RdfListService, RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService} from '@ame/cache';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultEvent} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class EventVisitor extends BaseVisitor<DefaultEvent> {
  private get store(): Store {
    return this.loadedFiles.currentLoadedFile?.rdfModel?.store;
  }

  constructor(
    private rdfNodeService: RdfNodeService,
    loadedFiles: LoadedFilesService,
    public rdfListService: RdfListService,
  ) {
    super(loadedFiles);
  }

  visit(event: DefaultEvent): DefaultEvent {
    this.setPrefix(event.aspectModelUrn);
    const oldAspectModelUrn = event.aspectModelUrn;
    this.addProperties(event);
    if (oldAspectModelUrn !== event.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return event;
  }

  private addProperties(event: DefaultEvent) {
    this.rdfNodeService.update(event, {
      preferredName: getPreferredNamesLocales(event).map(language => ({
        language,
        value: event.getPreferredName(language),
      })),
      description: getDescriptionsLocales(event).map(language => ({
        language,
        value: event.getDescription(language),
      })),
      see: event.getSee() || [],
    });

    if (event.properties?.length) {
      this.rdfListService.push(event, ...event.properties);
      for (const param of event.properties) {
        this.setPrefix(param.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(event, ListProperties.parameters);
    }
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
