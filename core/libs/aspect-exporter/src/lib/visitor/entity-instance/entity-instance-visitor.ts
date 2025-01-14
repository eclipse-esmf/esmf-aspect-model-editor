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
import {Injectable} from '@angular/core';
import {DefaultEntityInstance, Value} from '@esmf/aspect-model-loader';
import {DataFactory} from 'n3';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class EntityInstanceVisitor extends BaseVisitor<DefaultEntityInstance> {
  get currentFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor(
    private loadedFilesService: LoadedFilesService,
    public loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(entityValue: DefaultEntityInstance): DefaultEntityInstance {
    return this.visitModel(entityValue);
  }

  visitModel(entityValue: DefaultEntityInstance): DefaultEntityInstance {
    this.setPrefix(entityValue.aspectModelUrn);
    this.updateProperties(entityValue);
    this.updateBaseProperties(entityValue);
    return entityValue;
  }

  private updateProperties(entityValue: DefaultEntityInstance): void {
    const {aspectModelUrn} = entityValue;
    const rdfModel = this.loadedFilesService.currentLoadedFile.rdfModel;

    const tuples = entityValue.getTuples();
    tuples.map(([property, value]) => {
      this.handleExternalReference(value);

      const object = value.language
        ? DataFactory.literal(`${value.value}`, value.language)
        : value instanceof DefaultEntityInstance
          ? DataFactory.namedNode(value.aspectModelUrn)
          : DataFactory.literal(value?.value?.toString(), value.type ? DataFactory.namedNode(value.type?.getUrn()) : undefined);

      rdfModel.store.addQuad(DataFactory.namedNode(aspectModelUrn), DataFactory.namedNode(property), object);
    });
  }

  private handleExternalReference(value: Value): void {
    if (value instanceof DefaultEntityInstance && this.loadedFiles.isElementExtern(value)) {
      this.setPrefix(value.aspectModelUrn);
    }
  }

  private updateBaseProperties(entityValue: DefaultEntityInstance): void {
    const rdfModel = this.currentFile.rdfModel;
    rdfModel.store.addQuad(
      DataFactory.namedNode(entityValue.aspectModelUrn),
      rdfModel.samm.RdfType(),
      DataFactory.namedNode(entityValue.type?.aspectModelUrn),
    );
  }
}
