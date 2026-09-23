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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from './editor-model.service';

describe('EditorModelService', () => {
  let service: EditorModelService;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EditorModelService,
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
          isElementExtern: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(EditorModelService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
  });

  it('should update and emit metaModelElement', async () => {
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test:1.0.0#Vehicle',
      name: 'Vehicle',
      metaModelVersion: '2.0.0',
    });

    let emittedElement = null;
    service.getMetaModelElement().subscribe(elem => (emittedElement = elem));

    service.updateMetaModelElement(entity);
    expect(emittedElement).toBe(entity);
    expect(service.originalMetaModel).toBe(entity);
    expect(service.isSaveButtonEnabled()).toBe(true);

    service.updateMetaModelElement(null);
    expect(emittedElement).toBeNull();
    expect(service.originalMetaModel).toBeNull();
  });

  it('isReadOnly should check if element is predefined or external', () => {
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test:1.0.0#Vehicle',
      name: 'Vehicle',
      metaModelVersion: '2.0.0',
    });

    service.updateMetaModelElement(entity);
    expect(service.isReadOnly()).toBe(false);

    vi.spyOn(loadedFilesService, 'isElementExtern').mockReturnValue(true);
    expect(service.isReadOnly()).toBe(true);
  });
});
