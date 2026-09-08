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
import {MaxGraphService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {Injectable, inject} from '@angular/core';
import {map, take} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModelSavingTrackerService {
  private modelService = inject(ModelService);
  private rdfService = inject(RdfService);
  private maxgraphService = inject(MaxGraphService);
  private loadedFilesService = inject(LoadedFilesService);
  private savedModel: string;
  private firstLoad: boolean;

  private get currentModel$() {
    return this.modelService.synchronizeModelToRdf().pipe(
      take(1),
      map(() => this.rdfService.serializeModel(this.loadedFilesService.currentLoadedFile.rdfModel)),
    );
  }

  public get isSaved$() {
    return this.currentModel$.pipe(
      map(currentModel => (!this.firstLoad && this.savedModel === currentModel) || !this.maxgraphService.getAllCells()?.length),
    );
  }

  public updateSavedModel(firstLoad = false) {
    this.currentModel$.subscribe(currentModel => {
      this.firstLoad = firstLoad;
      this.savedModel = currentModel;
    });
  }
}
