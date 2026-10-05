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

import {FileStatus, LoadedFilesService, ModelApiPort, NamespaceFile, RdfModelUtil, WorkspaceNamespacesService} from '@ame/domain';
import {TestBed} from '@angular/core/testing';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelCheckerService} from './model-checker.service';
import {ModelLoaderService} from './model-loader.service';

describe('ModelCheckerService', () => {
  let service: ModelCheckerService;
  let modelApiService: ModelApiPort;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelCheckerService,
        MockProvider(ModelApiPort, {
          loadNamespacesStructure: vi.fn(() => of({})),
          fetchAllAspectMetaModel: vi.fn(() => of([])),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
        }),
        MockProvider(ModelLoaderService),
        MockProvider(WorkspaceNamespacesService, {
          namespaces: vi.fn(() => ({})),
        } as any),
      ],
    });

    service = TestBed.inject(ModelCheckerService);
    modelApiService = TestBed.inject(ModelApiPort);
  });

  describe('detectWorkspaceErrors', () => {
    afterEach(() => vi.restoreAllMocks());

    const consumerUrn = 'urn:samm:com.example:1.0.0#Consumer';

    const detect = async (rdfModel: RdfModel, modelVersion = '2.2.0') => {
      vi.spyOn(modelApiService, 'loadNamespacesStructure').mockReturnValue(
        of({
          'com.example': [{version: '1.0.0', models: [{name: 'Consumer.ttl', aspectModelUrn: consumerUrn, version: modelVersion}]}],
        } as any),
      );
      vi.spyOn(modelApiService, 'fetchAllAspectMetaModel').mockReturnValue(
        of([
          {
            absoluteName: 'com.example:1.0.0:Consumer.ttl',
            fileName: 'Consumer.ttl',
            aspectModelUrn: consumerUrn,
            modelVersion,
            aspectModel: 'ttl',
          },
        ] as any),
      );
      vi.spyOn(TestBed.inject(ModelLoaderService), 'parseRdfModel').mockReturnValue(of(rdfModel));
      return new Promise<FileStatus[]>(resolve => service.detectWorkspaceErrors().subscribe(resolve));
    };

    const modelReferencing = (...namespaces: string[]) => {
      const rdfModel = new RdfModel(new Store(), '2.2.0', 'urn:samm:com.example:1.0.0#');
      vi.spyOn(RdfModelUtil, 'resolveExternalNamespaces').mockReturnValue(namespaces);
      return rdfModel;
    };

    it('should request the files without failing on unresolved references', async () => {
      await detect(modelReferencing());

      expect(modelApiService.fetchAllAspectMetaModel).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should keep files with missing namespaces openable and list the missing namespaces', async () => {
      const [status] = await detect(modelReferencing('urn:samm:org.gone:1.0.0#', 'urn:samm:com.example:1.0.0#'));

      expect(status.errored).toBe(false);
      expect(status.missingDependencies).toEqual(['org.gone:1.0.0']);
    });

    it('should still mark files with an unknown SAMM version as errored', async () => {
      vi.spyOn(RdfModelUtil, 'resolveExternalNamespaces').mockReturnValue([]);
      const [status] = await detect({samm: undefined} as unknown as RdfModel, '');

      expect(status.sammVersion).toBe('unknown');
      expect(status.errored).toBe(true);
    });
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
