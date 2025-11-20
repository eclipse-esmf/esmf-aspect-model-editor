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
import {getPreferredNamesLocales} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultOperation} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class OperationVisitor extends BaseVisitor<DefaultOperation> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);

  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile?.rdfModel?.store;
  }

  visit(operation: DefaultOperation): DefaultOperation {
    this.setPrefix(operation.aspectModelUrn);
    const oldAspectModelUrn = operation.aspectModelUrn;
    this.addProperties(operation);
    if (oldAspectModelUrn !== operation.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return operation;
  }

  private addProperties(operation: DefaultOperation) {
    this.rdfNodeService.update(operation, {
      preferredName: getPreferredNamesLocales(operation).map(language => ({
        language,
        value: operation.getPreferredName(language),
      })),
      description: getPreferredNamesLocales(operation).map(language => ({
        language,
        value: operation.getDescription(language),
      })),
      see: operation.getSee() || [],
    });

    if (operation.input?.length) {
      this.rdfListService.push(operation, ...operation.input);
      for (const input of operation.input) {
        this.setPrefix(input.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(operation, ListProperties.input);
    }

    if (operation.output) {
      const property = operation.output;

      this.setPrefix(property.aspectModelUrn);
      this.store.addQuad(
        DataFactory.namedNode(operation.aspectModelUrn),
        this.loadedFilesService.currentLoadedFile.rdfModel.samm.OutputProperty(),
        DataFactory.namedNode(property.aspectModelUrn),
      );
    }
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
