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

import {InstantiatorService, LoadedFilesService, ModelApiService, NamespaceFile} from '@ame/infrastructure';
import {BrowserService, CONFIGURATION_SERVICE, NotificationsService, TauriSignalsService, TitleService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelLoaderService} from './model-loader.service';
import {ModelRendererService} from './model-renderer.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';

describe('ModelLoaderService', () => {
  let service: ModelLoaderService;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelLoaderService,
        MockProvider(LoadedFilesService, {
          files: {},
          filesAsList: [],
          externalFiles: [],
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
          removeAll: vi.fn(),
          restoreFiles: vi.fn(),
          addFile: vi.fn(opts => {
            const file = new NamespaceFile(
              opts.rdfModel || new RdfModel(new Store()),
              opts.cachedFile || new ModelElementCache(),
              opts.aspect || null,
            );
            if (opts.name) file.name = opts.name;
            if (opts.namespace) file.namespace = opts.namespace;
            return file;
          }),
          getFile: vi.fn(),
        }),
        MockProvider(ModelApiService, {
          loadNamespacesStructure: vi.fn(() => of({})),
          fetchAllAspectMetaModel: vi.fn(() => of([])),
          fetchAllNamespaceFilesContent: vi.fn(() => of([])),
        }),
        MockProvider(NotificationsService),
        {
          provide: InstantiatorService,
          useValue: {
            instantiateRemainingElements: vi.fn(),
          },
        },
        MockProvider(ModelRendererService, {
          renderModel: vi.fn(() => of(true)),
        }),
        MockProvider(ModelSavingTrackerService, {
          updateSavedModel: vi.fn(),
        }),
        MockProvider(BrowserService, {
          isStartedAsTauriApp: vi.fn(() => false),
        }),
        MockProvider(TauriSignalsService, {call: vi.fn()}),
        MockProvider(CONFIGURATION_SERVICE, {
          getSettings: vi.fn(() => ({copyrightHeader: []}) as any),
        }),
        MockProvider(TitleService, {updateTitle: vi.fn()}),
      ],
    });

    service = TestBed.inject(ModelLoaderService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
  });

  it('createRdfModelFromContent should parse and register file', async () => {
    const turtle = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#> .
@prefix : <urn:samm:com.example:1.0.0#> .
:Aspect a samm:Aspect .`;

    const file = await new Promise<NamespaceFile>(resolve =>
      service.createRdfModelFromContent(turtle, 'com.example:1.0.0:Aspect.ttl').subscribe(resolve),
    );

    expect(file).toBeDefined();
    expect(loadedFilesService.addFile).toHaveBeenCalled();
  });

  it('should restore files on error when renderModel fails', async () => {
    const modelApiService = TestBed.inject(ModelApiService);
    vi.spyOn(modelApiService, 'loadNamespacesStructure').mockReturnValue(throwError(() => new Error('Batch load failed')));

    const payload = {
      rdfAspectModel: `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#> .
@prefix : <urn:samm:com.example:1.0.0#> .
:Aspect a samm:Aspect .`,
      aspectModelUri: '',
    };

    let caughtError: any;
    try {
      await new Promise((resolve, reject) => {
        service.renderModel(payload).subscribe({next: resolve, error: reject});
      });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeDefined();
    expect(loadedFilesService.restoreFiles).toHaveBeenCalled();
  });
});
