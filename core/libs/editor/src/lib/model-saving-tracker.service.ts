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

import {MaxGraphService} from '@ame/graph';
import {LoadedFilesService, ModelService, RdfService} from '@ame/infrastructure';
import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, take} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModelSavingTrackerService {
  private readonly modelService = inject(ModelService);
  private readonly rdfService = inject(RdfService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private savedModel = '';
  private firstLoad = false;

  public get currentModel$(): Observable<string> {
    if (!this.loadedFilesService?.currentLoadedFile?.rdfModel) {
      return of('');
    }
    return this.modelService.synchronizeModelToRdf().pipe(
      take(1),
      map(() => this.rdfService.serializeModel(this.loadedFilesService.currentLoadedFile.rdfModel)),
      catchError(() => of('')),
    );
  }

  public get isSaved$(): Observable<boolean> {
    const hasCells = (this.maxgraphService.getAllCells()?.length ?? 0) > 0;
    if (!hasCells) {
      return of(true);
    }

    if (!this.loadedFilesService?.currentLoadedFile?.rdfModel) {
      return of(true);
    }

    return this.currentModel$.pipe(
      map(currentModel => {
        if (!currentModel) return true;
        if (this.firstLoad) return false;
        return this.savedModel === currentModel;
      }),
      catchError(() => of(true)),
    );
  }

  public getSavedModel(): string {
    return this.savedModel;
  }

  public setSavedModel(saved: string, firstLoad = false): void {
    this.savedModel = saved ?? '';
    this.firstLoad = firstLoad;
  }

  public updateSavedModel(firstLoad = false): void {
    this.currentModel$.subscribe(currentModel => {
      this.firstLoad = firstLoad;
      this.savedModel = currentModel ?? '';
    });
  }
}
