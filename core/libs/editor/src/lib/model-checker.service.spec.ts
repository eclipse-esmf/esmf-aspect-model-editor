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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {SidebarStateService} from '@ame/sidebar';
import {TestBed} from '@angular/core/testing';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelCheckerService} from './model-checker.service';
import {ModelLoaderService} from './model-loader.service';

describe('ModelCheckerService', () => {
  let service: ModelCheckerService;
  let modelApiService: ModelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelCheckerService,
        MockProvider(ModelApiService, {
          loadNamespacesStructure: vi.fn(() => of({})),
          fetchAllAspectMetaModel: vi.fn(() => of([])),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
        }),
        MockProvider(ModelLoaderService),
        MockProvider(SidebarStateService, {
          namespacesState: {
            namespaces: vi.fn(() => ({})),
          } as any,
        }),
      ],
    });

    service = TestBed.inject(ModelCheckerService);
    modelApiService = TestBed.inject(ModelApiService);
  });

  it('detectWorkspace should map workspace structure into urn key map', async () => {
    vi.spyOn(modelApiService, 'loadNamespacesStructure').mockReturnValue(
      of({
        'com.example': [
          {
            version: '1.0.0',
            models: [{name: 'TestModel', aspectModelUrn: 'urn:samm:com.example:1.0.0#TestModel'}],
          },
        ],
      } as any),
    );

    const result = await new Promise(resolve => service.detectWorkspace().subscribe(resolve));

    expect(result).toEqual({
      'urn:samm:com.example:1.0.0#TestModel': {
        namespace: 'com.example',
        model: 'TestModel',
        version: '1.0.0',
      },
    });
  });
});
