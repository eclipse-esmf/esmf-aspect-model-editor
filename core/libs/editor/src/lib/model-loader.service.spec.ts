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

import {
  ConfigurationService,
  LoadedFilesService,
  ModelApiPort,
  ModelDocumentService,
  ModelInstantiatorPort,
  NamespaceFile,
} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {BrowserService, LanguageTranslationService, NotificationsService, TauriSignalsService, TitleService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultCharacteristic, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelLoaderService} from './model-loader.service';
import {ModelRendererService} from './model-renderer.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';

const createProviders = (loadedFilesProvider: any) => [
  ModelLoaderService,
  loadedFilesProvider,
  MockProvider(ModelApiPort, {
    loadNamespacesStructure: vi.fn(() => of({})),
    fetchAllAspectMetaModel: vi.fn(() => of([])),
    fetchAllNamespaceFilesContent: vi.fn(() => of([])),
  }),
  MockProvider(MaxGraphService, {graphModelChanged$: new Subject<void>()}),
  MockProvider(NotificationsService),
  {
    provide: ModelInstantiatorPort,
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
  MockProvider(ConfigurationService, {
    getSettings: vi.fn(() => ({copyrightHeader: []}) as any),
  }),
  MockProvider(TitleService, {updateTitle: vi.fn()}),
  MockProvider(ModelDocumentService, {bindElements: vi.fn()}),
  MockProvider(LanguageTranslationService, {
    translateService: {
      selectTranslate: vi.fn((key: string, params?: object) => of(`${key}${params ? JSON.stringify(params) : ''}`)),
    } as any,
  }),
];

describe('ModelLoaderService', () => {
  let service: ModelLoaderService;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: createProviders(
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
      ),
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
    const modelApiService = TestBed.inject(ModelApiPort);
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

  it('loadSingleModel should bind the elements of the loaded file to their position and keep the global header settings', async () => {
    const settings = {copyrightHeader: ['# global header']};
    vi.mocked(TestBed.inject(ConfigurationService).getSettings).mockReturnValue(settings as any);
    const modelDocumentService = TestBed.inject(ModelDocumentService);

    const payload = {
      rdfAspectModel: `# file header
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix : <urn:samm:com.example:1.0.0#> .
:Aspect a samm:Aspect ;
   samm:properties ( ) ;
   samm:operations ( ) .`,
      aspectModelUri: '',
      namespaceFileName: 'com.example:1.0.0:Aspect.ttl',
    };

    await new Promise((resolve, reject) => service.loadSingleModel(payload).subscribe({next: resolve, error: reject}));

    expect(modelDocumentService.bindElements).toHaveBeenCalled();
    expect(vi.mocked(modelDocumentService.bindElements).mock.calls.every(([rdfModel]) => rdfModel instanceof RdfModel)).toBe(true);
    // The header is kept per file; loading a model must not overwrite the configured header.
    expect(settings.copyrightHeader).toEqual(['# global header']);
  });
});

describe('ModelLoaderService unresolved references', () => {
  const currentNs = 'urn:samm:com.example:1.0.0#';
  const sharedNs = 'urn:samm:com.shared:1.0.0#';
  const missingNs = 'urn:samm:com.missing:1.0.0#';
  const {namedNode, quad} = DataFactory;

  let service: ModelLoaderService;
  let loadedFiles: LoadedFilesService;
  let notifications: NotificationsService;
  let currentRdfModel: RdfModel;
  let sharedRdfModel: RdfModel;
  let cache: ModelElementCache;

  const property = (urn: string) => new DefaultProperty({aspectModelUrn: urn, name: urn.split('#')[1], metaModelVersion: '2.0.0'});
  const define = (rdfModel: RdfModel, urn: string) =>
    rdfModel.store.addQuad(quad(namedNode(urn), rdfModel.samm.RdfType(), rdfModel.samm.Property()));
  const reference = (rdfModel: RdfModel, subject: string, object: string) =>
    rdfModel.store.addQuad(
      quad(namedNode(subject), namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#characteristic'), namedNode(object)),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({providers: createProviders(LoadedFilesService)});
    service = TestBed.inject(ModelLoaderService);
    loadedFiles = TestBed.inject(LoadedFilesService);
    notifications = TestBed.inject(NotificationsService);
    vi.spyOn(notifications, 'warning').mockImplementation(() => null);

    currentRdfModel = new RdfModel(new Store(), '2.0.0', currentNs);
    sharedRdfModel = new RdfModel(new Store(), '2.0.0', sharedNs);
    cache = new ModelElementCache();
    loadedFiles.addFile({
      rdfModel: currentRdfModel,
      cachedFile: cache,
      aspect: null,
      absoluteName: 'com.example:1.0.0:Main.ttl',
      rendered: true,
    });
  });

  const move = () =>
    (service as any).moveUnresolvedElements({current: currentRdfModel, shared: sharedRdfModel}, currentRdfModel, cache) as string[];

  it('should move only elements without definition into placeholders and report the direct references of the current file', () => {
    const local = property(`${currentNs}localProperty`);
    const shared = property(`${sharedNs}sharedProperty`);
    const missingDirect = property(`${missingNs}missingDirect`);
    const missingSameNamespace = property(`${currentNs}missingSameNamespace`);
    const missingIndirect = new DefaultCharacteristic({
      aspectModelUrn: `${missingNs}MissingIndirect`,
      name: 'MissingIndirect',
      metaModelVersion: '2.0.0',
    });
    [local, shared, missingDirect, missingSameNamespace, missingIndirect].forEach(e => cache.addElement(e.aspectModelUrn, e));

    define(currentRdfModel, local.aspectModelUrn);
    define(sharedRdfModel, shared.aspectModelUrn);
    reference(currentRdfModel, local.aspectModelUrn, missingDirect.aspectModelUrn);
    reference(currentRdfModel, local.aspectModelUrn, missingSameNamespace.aspectModelUrn);
    reference(sharedRdfModel, shared.aspectModelUrn, missingIndirect.aspectModelUrn);

    const reported = move();

    expect(reported).toEqual([missingNs + 'missingDirect', currentNs + 'missingSameNamespace'].sort());
    expect(loadedFiles.isElementUnresolved(missingDirect)).toBe(true);
    expect(loadedFiles.isElementUnresolved(missingSameNamespace)).toBe(true);
    expect(loadedFiles.isElementUnresolved(missingIndirect)).toBe(true);
    expect(loadedFiles.isElementUnresolved(local)).toBe(false);
    expect(loadedFiles.isElementUnresolved(shared)).toBe(false);
    expect(cache.get(local.aspectModelUrn)).toBe(local);
    expect(cache.get(missingDirect.aspectModelUrn)).toBeFalsy();
  });

  it('should ignore predefined and SAMM elements', () => {
    const predefined = property(`${missingNs}predefined`);
    Object.defineProperty(predefined, 'isPredefined', {get: () => true});
    const samm = property('urn:samm:org.eclipse.esmf.samm:characteristic:2.0.0#Text');
    [predefined, samm].forEach(e => cache.addElement(e.aspectModelUrn, e));

    expect(move()).toEqual([]);
    expect(loadedFiles.isElementUnresolved(predefined)).toBe(false);
    expect(loadedFiles.isElementUnresolved(samm)).toBe(false);
  });

  it('should warn once with all missing direct references', () => {
    (service as any).notifyMissingReferences([`${missingNs}a`, `${missingNs}b`]);

    expect(notifications.warning).toHaveBeenCalledTimes(1);
    expect(notifications.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notificationService.unresolvedReferencesTitle',
        message: expect.stringContaining(`${missingNs}a, ${missingNs}b`),
      }),
    );
  });

  it('should not warn without missing references', () => {
    (service as any).notifyMissingReferences([]);

    expect(notifications.warning).not.toHaveBeenCalled();
  });
});
