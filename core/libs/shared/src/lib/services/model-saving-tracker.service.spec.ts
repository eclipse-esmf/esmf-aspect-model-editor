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
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelSavingTrackerService} from './model-saving-tracker.service';

describe('ModelSavingTrackerService', () => {
  let service: ModelSavingTrackerService;
  let modelServiceMock: {synchronizeModelToRdf: ReturnType<typeof vi.fn>};
  let rdfServiceMock: {serializeModel: ReturnType<typeof vi.fn>};
  let maxgraphServiceMock: {getAllCells: ReturnType<typeof vi.fn>};
  let loadedFilesServiceMock: any;

  beforeEach(() => {
    modelServiceMock = {
      synchronizeModelToRdf: vi.fn(() => of(true)),
    };

    rdfServiceMock = {
      serializeModel: vi.fn(() => 'serialized-turtle-model'),
    };

    maxgraphServiceMock = {
      getAllCells: vi.fn(() => [{id: '1'}, {id: '2'}]),
    };

    loadedFilesServiceMock = {
      currentLoadedFile: {
        rdfModel: {},
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ModelSavingTrackerService,
        {provide: ModelService, useValue: modelServiceMock},
        {provide: RdfService, useValue: rdfServiceMock},
        {provide: MaxGraphService, useValue: maxgraphServiceMock},
        {provide: LoadedFilesService, useValue: loadedFilesServiceMock},
      ],
    });

    service = TestBed.inject(ModelSavingTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isSaved$ should be false if model is modified and cells exist', () => {
    service.updateSavedModel(true); // firstLoad = true

    let isSaved: boolean | undefined;
    service.isSaved$.subscribe(saved => {
      isSaved = saved;
    });

    expect(isSaved).toBe(false);
  });

  it('isSaved$ should be true if savedModel matches serialized model', () => {
    service.updateSavedModel(false); // firstLoad = false, savedModel = 'serialized-turtle-model'

    let isSaved: boolean | undefined;
    service.isSaved$.subscribe(saved => {
      isSaved = saved;
    });

    expect(isSaved).toBe(true);
  });

  it('isSaved$ should be true if there are no cells in the graph', () => {
    maxgraphServiceMock.getAllCells.mockReturnValue([]);

    let isSaved: boolean | undefined;
    service.isSaved$.subscribe(saved => {
      isSaved = saved;
    });

    expect(isSaved).toBe(true);
  });
});
