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

import {LoadedFilesService, ModelApiPort, ModelDocumentService, ModelService, RdfPort} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, switchMap, take, timeout} from 'rxjs';

export interface AspectModelText {
  content: string;
  /** False when the backend formatter was not available and the raw serialization is shown. */
  formatted: boolean;
}

const SYNCHRONIZATION_TIMEOUT_MS = 10000;

/** Produces the Turtle representation of the current model as it would be written to the file on save. */
@Injectable({providedIn: 'root'})
export class AspectModelTextService {
  private readonly modelService = inject(ModelService);
  private readonly rdfService = inject(RdfPort);
  private readonly modelApiService = inject(ModelApiPort);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelDocumentService = inject(ModelDocumentService);

  load(): Observable<AspectModelText> {
    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;
    if (!rdfModel) {
      return of({content: '', formatted: false});
    }

    return this.modelService.synchronizeModelToRdf().pipe(
      take(1),
      timeout(SYNCHRONIZATION_TIMEOUT_MS),
      map(() => this.rdfService.serializeModel(rdfModel)),
      switchMap(serialized => {
        if (!this.hasStatements(serialized)) {
          return of({content: '', formatted: false});
        }

        return this.modelApiService.fetchFormatedAspectModel(serialized, rdfModel.getSourceLocation()).pipe(
          map(formatted =>
            formatted?.trim()
              ? {content: this.modelDocumentService.toDocument(formatted, rdfModel), formatted: true}
              : {content: serialized, formatted: false},
          ),
          catchError(() => of({content: serialized, formatted: false})),
        );
      }),
    );
  }

  private hasStatements(serialized: string): boolean {
    return !!serialized && /\S/.test(serialized.replace(/@prefix[^\n]*\n/g, ''));
  }
}
