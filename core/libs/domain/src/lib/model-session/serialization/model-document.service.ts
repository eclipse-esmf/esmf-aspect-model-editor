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

import {DEFAULT_ELEMENT_ORDER_STRATEGY, ElementOrderStrategy} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {RdfModel, SubjectReference} from '@esmf/aspect-model-loader';
import {ConfigurationService} from '../../state/settings/configuration.service';
import {LoadedFilesService} from '../loaded-files.service';
import {ModelHeaderService} from '../model-header.service';
import {computeSubjectOrder, getNamedSubjects, sortSubjectsAlphabetically} from './subject-order';
import {reorderTurtleStatements} from './turtle-statement-order';

/**
 * Turns the formatted Turtle of a model into the document which is written to the file:
 * keeps the order of the elements of the source file and the header comments of the file.
 */
@Injectable({providedIn: 'root'})
export class ModelDocumentService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly loadedFilesService = inject(LoadedFilesService, {optional: true});
  private readonly modelHeaderService = inject(ModelHeaderService);

  get strategy(): ElementOrderStrategy {
    return this.configurationService.getSettings()?.elementOrderStrategy ?? DEFAULT_ELEMENT_ORDER_STRATEGY;
  }

  /** Links the recorded element order to the model elements so that renamed elements keep their position. */
  bindElements(rdfModel: RdfModel | null | undefined): void {
    const resolve = this.elementResolver(rdfModel);
    if (resolve) {
      rdfModel?.serializationMetadata?.bindElements(resolve);
    }
  }

  /**
   * Calculates the order of the named subjects for the current state of the model and remembers it,
   * so new elements keep the position they got once. Returns `null` when the formatter defines the order.
   */
  resolveSubjectOrder(rdfModel: RdfModel | null | undefined): string[] | null {
    const metadata = rdfModel?.serializationMetadata;
    if (!rdfModel?.store || !metadata || this.strategy === 'formatterDefault') {
      return null;
    }

    const resolve = this.elementResolver(rdfModel);
    if (resolve) {
      metadata.bindElements(resolve);
    }
    const order = computeSubjectOrder(rdfModel.store, metadata.getSubjectOrder(), this.strategy);
    metadata.setSubjectOrder(order, resolve ?? undefined);
    return order;
  }

  /** Applies the element order and the header to the output of the formatter. */
  toDocument(formatted: string, rdfModel: RdfModel | null | undefined): string {
    const order = this.resolveSubjectOrder(rdfModel);
    const ordered = order?.length ? reorderTurtleStatements(formatted, order) : formatted;
    return this.modelHeaderService.withHeader(ordered, rdfModel);
  }

  /** One-time action: sorts the elements alphabetically. The order is kept for later changes. */
  sortAlphabetically(rdfModel: RdfModel | null | undefined): void {
    if (!rdfModel?.store || !rdfModel.serializationMetadata) {
      return;
    }
    const sorted = sortSubjectsAlphabetically(rdfModel.store, getNamedSubjects(rdfModel.store));
    rdfModel.serializationMetadata.setSubjectOrder(sorted, this.elementResolver(rdfModel) ?? undefined);
  }

  private elementResolver(rdfModel: RdfModel | null | undefined): ((iri: string) => SubjectReference | undefined) | null {
    const cachedFile = this.loadedFilesService?.filesAsList?.find(file => file.rdfModel === rdfModel)?.cachedFile;
    return cachedFile ? (iri: string) => cachedFile.get<SubjectReference>(iri) ?? undefined : null;
  }
}
