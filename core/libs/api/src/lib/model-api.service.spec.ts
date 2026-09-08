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

import {APP_CONFIG, AppConfig, BrowserService, FileContentModel, IPC_RENDERER} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelApiService} from './model-api.service';
import {ModelValidatorService} from './model-validator.service';
import {AsyncApi, FileEntry, OpenApi} from './models';

const config: AppConfig = {
  environment: 'dev',
  ameService: 'http://localhost:9090',
  ameVersion: '1.0.0',
  assetLocation: 'assets',
  minSammVersion: '2.0.0',
  currentSammVersion: '2.2.0',
  sdkVersion: '2.16.0',
  defaultPort: '9090',
  serviceUrl: 'http://localhost:9090',
  api: {
    models: '/ame/api/models',
    generate: '/ame/api/generate',
    package: '/ame/api/package',
    fileHandling: '/ame/api/file-handling',
  },
};

const modelsUrl = 'http://localhost:9090/ame/api/models';
const generateUrl = 'http://localhost:9090/ame/api/generate';
const packageUrl = 'http://localhost:9090/ame/api/package';

describe('ModelApiService', () => {
  let service: ModelApiService;
  let httpMock: HttpTestingController;
  let browserService: {isStartedAsElectronApp: ReturnType<typeof vi.fn>};
  let modelValidatorService: {notifyCorrectableErrors: ReturnType<typeof vi.fn>};
  let translate: {language: {notificationService: {aspectSavedDefaultModel: string}}};
  let ipcRenderer: {getBackendPort: ReturnType<typeof vi.fn>};

  const configureTestBed = () => {
    TestBed.configureTestingModule({
      providers: [
        ModelApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: APP_CONFIG, useValue: config},
        {provide: BrowserService, useValue: browserService},
        {provide: ModelValidatorService, useValue: modelValidatorService},
        {provide: LanguageTranslationService, useValue: translate},
        {provide: IPC_RENDERER, useValue: ipcRenderer},
      ],
    });

    service = TestBed.inject(ModelApiService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => {
    browserService = {isStartedAsElectronApp: vi.fn(() => false)};
    modelValidatorService = {notifyCorrectableErrors: vi.fn()};
    translate = {language: {notificationService: {aspectSavedDefaultModel: 'You cannot save into the default model.'}}};
    ipcRenderer = {getBackendPort: vi.fn(() => Promise.resolve('4000'))};

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    httpMock?.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    configureTestBed();
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should not touch the service url when not running as an electron app', () => {
      configureTestBed();

      let result: {content: string; sourceLocation: string | null};
      service.fetchAspectMetaModel('urn:samm:x#Y').subscribe(value => (result = value));

      const req = httpMock.expectOne(modelsUrl);
      req.flush({content: 'ttl', sourceLocation: null});

      expect(ipcRenderer.getBackendPort).not.toHaveBeenCalled();
      expect(result).toEqual({content: 'ttl', sourceLocation: null});
    });

    it('should replace the service url port when running as an electron app', async () => {
      browserService.isStartedAsElectronApp = vi.fn(() => true);
      configureTestBed();

      await Promise.resolve();
      await Promise.resolve();

      service.fetchAspectMetaModel('urn:samm:x#Y').subscribe();

      const req = httpMock.expectOne('http://localhost:4000/ame/api/models');
      req.flush({content: 'ttl', sourceLocation: null});
    });
  });

  describe('fetchAspectMetaModel', () => {
    beforeEach(() => configureTestBed());

    it('should send the aspect model urn header and return the model content', () => {
      let result: {content: string; sourceLocation: string | null};
      service.fetchAspectMetaModel('urn:samm:x#Y').subscribe(value => (result = value));

      const req = httpMock.expectOne(modelsUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('aspect-model-urn')).toBe('urn:samm:x#Y');
      expect(req.request.headers.get('Content-Type')).toBe('text/turtle');

      req.flush({content: '<ttl content>', sourceLocation: 'file:///model.ttl'});

      expect(result).toEqual({content: '<ttl content>', sourceLocation: 'file:///model.ttl'});
    });

    it('should propagate http errors', () => {
      let error: any;
      service.fetchAspectMetaModel('urn:samm:x#Y').subscribe({error: err => (error = err)});

      const req = httpMock.expectOne(modelsUrl);
      req.flush('failure', {status: 500, statusText: 'Server Error'});

      expect(error.status).toBe(500);
    });
  });

  describe('checkElementExists', () => {
    beforeEach(() => configureTestBed());

    it('should query the check-element endpoint with the file name param', () => {
      let result: boolean;
      service.checkElementExists('urn:samm:x#Y', 'MyModel.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${modelsUrl}/check-element`);
      expect(req.request.params.get('fileName')).toBe('MyModel.ttl');
      req.flush(true);

      expect(result).toBe(true);
    });
  });

  describe('fetchAllAspectMetaModel', () => {
    beforeEach(() => configureTestBed());

    it('should post the file entries to the batch endpoint', () => {
      const fileEntries: FileEntry[] = [{aspectModelUrn: 'urn:samm:x#Y', absoluteName: 'ns:1.0.0:Model.ttl'}];
      let result: unknown;
      service.fetchAllAspectMetaModel(fileEntries).subscribe(value => (result = value));

      const req = httpMock.expectOne(`${modelsUrl}/batch`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fileEntries);
      req.flush([{aspectModelUrn: 'urn:samm:x#Y', aspectModel: '<ttl>'}]);

      expect(result).toEqual([{aspectModelUrn: 'urn:samm:x#Y', aspectModel: '<ttl>'}]);
    });
  });

  describe('saveAspectModel', () => {
    beforeEach(() => configureTestBed());

    it('should save the model and set the aspect-model-urn and file-name headers', () => {
      let result: string;
      service.saveAspectModel('<ttl content>', 'urn:samm:x#Y', 'my.namespace:1.0.0:MyModel.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(modelsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('aspect-model-urn')).toBe('urn:samm:x#Y');
      expect(req.request.headers.get('file-name')).toBe('MyModel.ttl');
      req.flush('saved');

      expect(result).toBe('saved');
    });

    it('should reject saving into the default "new-model.ttl" model without calling the backend', () => {
      let error: any;
      service.saveAspectModel('<ttl content>', 'urn:samm:x#Y', 'my.namespace:1.0.0:new-model.ttl').subscribe({error: err => (error = err)});

      expect(error.error.message).toBe('You cannot save into the default model.');
      httpMock.expectNone(modelsUrl);
    });

    it('should not throw synchronously when absoluteModelName is empty (regression test)', () => {
      let result: string;

      expect(() => {
        service.saveAspectModel('<ttl content>', 'urn:samm:x#Y', '').subscribe(value => (result = value));
      }).not.toThrow();

      const req = httpMock.expectOne(modelsUrl);
      expect(req.request.headers.has('file-name')).toBe(false);
      req.flush('saved');

      expect(result).toBe('saved');
    });
  });

  describe('validate', () => {
    beforeEach(() => configureTestBed());

    it('should post the model and notify correctable errors on success', () => {
      let result: unknown;
      service.validate('<ttl content>', 'file:///source.ttl', true).subscribe(value => (result = value));

      const req = httpMock.expectOne(`${modelsUrl}/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('uri')).toBe('file:///source.ttl');
      req.flush({violationErrors: []});

      expect(result).toEqual([]);
      expect(modelValidatorService.notifyCorrectableErrors).toHaveBeenCalledWith([], true);
    });

    it('should use the generated blob uri when no source location is provided', () => {
      service.validate('<ttl content>').subscribe();

      const req = httpMock.expectOne(`${modelsUrl}/validate`);
      expect(req.request.headers.get('uri')).toBe('blob:mock-url');
      req.flush({violationErrors: []});
    });
  });

  describe('fetchFormatedAspectModel', () => {
    beforeEach(() => configureTestBed());

    it('should format the model and return the formatted text', () => {
      let result: string;
      service.fetchFormatedAspectModel('<ttl content>', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${modelsUrl}/format`);
      expect(req.request.headers.get('uri')).toBe('file:///source.ttl');
      req.flush('<formatted ttl>');

      expect(result).toBe('<formatted ttl>');
    });

    it('should extract the error message from the JSON encoded error body', () => {
      let error: any;
      service.fetchFormatedAspectModel('<ttl content>').subscribe({error: err => (error = err)});

      const req = httpMock.expectOne(`${modelsUrl}/format`);
      req.flush(JSON.stringify({error: 'Invalid syntax'}), {status: 400, statusText: 'Bad Request'});

      expect(error.error).toBe('Invalid syntax');
    });
  });

  describe('importPackage', () => {
    beforeEach(() => configureTestBed());

    it('should post the file as form data to the import endpoint', () => {
      const file = new File(['zip content'], 'package.zip');
      let result: unknown;
      service.importPackage(file).subscribe(value => (result = value));

      const req = httpMock.expectOne(`${packageUrl}/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({success: true});

      expect(result).toEqual({success: true});
    });
  });

  describe('deleteAspectModel', () => {
    beforeEach(() => configureTestBed());

    it('should delete the model', () => {
      let result: string;
      service.deleteAspectModel('urn:samm:x#Y').subscribe(value => (result = value));

      const req = httpMock.expectOne(modelsUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('aspect-model-urn')).toBe('urn:samm:x#Y');
      req.flush('deleted');

      expect(result).toBe('deleted');
    });

    it('should retry up to 3 times before propagating the error', () => {
      let error: any;
      service.deleteAspectModel('urn:samm:x#Y').subscribe({error: err => (error = err)});

      for (let attempt = 0; attempt < 4; attempt++) {
        const req = httpMock.expectOne(modelsUrl);
        req.flush('failure', {status: 500, statusText: 'Server Error'});
      }

      expect(error.status).toBe(500);
    });
  });

  describe('loadNamespacesStructure', () => {
    beforeEach(() => configureTestBed());

    it('should query the namespaces with onlyAspectModels=false by default', () => {
      service.loadNamespacesStructure().subscribe();

      const req = httpMock.expectOne(req => req.url === `${modelsUrl}/namespaces`);
      expect(req.request.params.get('onlyAspectModels')).toBe('false');
      req.flush({});
    });

    it('should query the namespaces with onlyAspectModels=true when requested', () => {
      service.loadNamespacesStructure(true).subscribe();

      const req = httpMock.expectOne(req => req.url === `${modelsUrl}/namespaces`);
      expect(req.request.params.get('onlyAspectModels')).toBe('true');
      req.flush({});
    });
  });

  describe('fetchAllNamespaceFilesContent', () => {
    beforeEach(() => configureTestBed());

    it('should return an empty array when the workspace has no models', () => {
      let result: FileContentModel[];
      service.fetchAllNamespaceFilesContent().subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${modelsUrl}/namespaces`);
      req.flush({});

      expect(result).toEqual([]);
    });

    it('should fetch and aggregate the content of every model in the workspace', () => {
      let result: FileContentModel[];
      service.fetchAllNamespaceFilesContent().subscribe(value => (result = value));

      const namespacesReq = httpMock.expectOne(req => req.url === `${modelsUrl}/namespaces`);
      namespacesReq.flush({
        'my.namespace:1.0.0': [
          {
            version: '1.0.0',
            models: [
              {name: 'Model1', existing: true, version: '1.0.0', aspectModelUrn: 'urn:samm:my.namespace:1.0.0#Model1'},
              {name: 'Model2', existing: false, version: '1.0.0', aspectModelUrn: 'urn:samm:my.namespace:1.0.0#Model2'},
            ],
          },
        ],
      });

      const modelReqs = httpMock.match(req => req.url === modelsUrl);
      expect(modelReqs).toHaveLength(2);
      modelReqs[0].flush({content: 'content-1', sourceLocation: null});
      modelReqs[1].flush({content: 'content-2', sourceLocation: null});

      expect(result.map(file => file.name)).toEqual(['Model1', 'Model2']);
      expect(result.map(file => file.aspectMetaModel)).toEqual(['content-1', 'content-2']);
    });

    it('should resolve to an empty array when loading the namespace structure fails', () => {
      let result: FileContentModel[];
      service.fetchAllNamespaceFilesContent().subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${modelsUrl}/namespaces`);
      req.flush('failure', {status: 500, statusText: 'Server Error'});

      expect(result).toEqual([]);
    });
  });

  describe('fetchExportPackage', () => {
    beforeEach(() => configureTestBed());

    it('should request the export package as a blob', () => {
      let result: unknown;
      service.fetchExportPackage('urn:samm:x#Y').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${packageUrl}/export`);
      expect(req.request.responseType).toBe('blob');
      const blob = new Blob(['zip content']);
      req.flush(blob);

      expect(result).toBe(blob);
    });
  });

  describe('generateJsonSample', () => {
    beforeEach(() => configureTestBed());

    it('should generate a json sample', () => {
      let result: string;
      service.generateJsonSample('<ttl content>', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${generateUrl}/json-sample`);
      expect(req.request.headers.get('uri')).toBe('file:///source.ttl');
      req.flush('{"sample": true}');

      expect(result).toBe('{"sample": true}');
    });
  });

  describe('generateJsonSchema', () => {
    beforeEach(() => configureTestBed());

    it('should generate a json schema for the given language', () => {
      let result: string;
      service.generateJsonSchema('<ttl content>', 'en', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/json-schema`);
      expect(req.request.params.get('language')).toBe('en');
      req.flush('{"schema": true}');

      expect(result).toBe('{"schema": true}');
    });
  });

  describe('migrateAspectModel', () => {
    beforeEach(() => configureTestBed());

    it('should migrate the model', () => {
      let result: string;
      service.migrateAspectModel('<ttl content>', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${modelsUrl}/migrate`);
      req.flush('<migrated ttl>');

      expect(result).toBe('<migrated ttl>');
    });
  });

  describe('generateOpenApiSpec', () => {
    beforeEach(() => configureTestBed());

    const openApi: OpenApi = {
      language: 'en',
      output: 'json',
      baseUrl: 'http://localhost',
      includeQueryApi: true,
      useSemanticVersion: false,
      paging: 'TIME_BASED_PAGING',
      resourcePath: '/my-resource',
      ymlProperties: '',
      jsonProperties: '',
      includePost: true,
      includePut: false,
      includePatch: false,
    };

    it('should generate a json open api spec with the expected params', () => {
      let result: string;
      service.generateOpenApiSpec('<ttl content>', openApi, 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/open-api-spec`);
      expect(req.request.params.get('language')).toBe('en');
      expect(req.request.params.get('pagingOption')).toBe('TIME_BASED_PAGING');
      expect(req.request.params.get('includePost')).toBe('true');
      expect(req.request.responseType).toBe('json');
      req.flush('{"openapi": "3.0.0"}');

      expect(result).toBe('{"openapi": "3.0.0"}');
    });

    it('should use a text response type for yaml output', () => {
      service.generateOpenApiSpec('<ttl content>', {...openApi, output: 'yaml'}).subscribe();

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/open-api-spec`);
      expect(req.request.responseType).toBe('text');
      req.flush('openapi: 3.0.0');
    });

    it('should extract the error message for json output', () => {
      let error: any;
      service.generateOpenApiSpec('<ttl content>', openApi).subscribe({error: err => (error = err)});

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/open-api-spec`);
      req.flush({error: 'Invalid resource path'}, {status: 400, statusText: 'Bad Request'});

      expect(error.error).toBe('Invalid resource path');
    });

    it('should extract the error message for yaml output from the JSON encoded body', () => {
      let error: any;
      service.generateOpenApiSpec('<ttl content>', {...openApi, output: 'yaml'}).subscribe({error: err => (error = err)});

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/open-api-spec`);
      req.flush(JSON.stringify({error: 'Invalid resource path'}), {status: 400, statusText: 'Bad Request'});

      expect(error.error).toBe('Invalid resource path');
    });
  });

  describe('generateAsyncApiSpec', () => {
    beforeEach(() => configureTestBed());

    const asyncApi: AsyncApi = {
      language: 'en',
      output: 'json',
      applicationId: 'my-app',
      channelAddress: '/my-channel',
      useSemanticVersion: false,
      writeSeparateFiles: false,
    };

    it('should generate a json async api spec with the expected params', () => {
      let result: string;
      service.generateAsyncApiSpec('<ttl content>', asyncApi, 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/async-api-spec`);
      expect(req.request.params.get('applicationId')).toBe('my-app');
      expect(req.request.responseType).toBe('json');
      req.flush('{"asyncapi": "3.0.0"}');

      expect(result).toBe('{"asyncapi": "3.0.0"}');
    });

    it('should use a blob response type when writing separate files', () => {
      service.generateAsyncApiSpec('<ttl content>', {...asyncApi, writeSeparateFiles: true}).subscribe();

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/async-api-spec`);
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['zip content']));
    });

    it('should extract the error message for json output', () => {
      let error: any;
      service.generateAsyncApiSpec('<ttl content>', asyncApi).subscribe({error: err => (error = err)});

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/async-api-spec`);
      req.flush({error: 'Invalid channel address'}, {status: 400, statusText: 'Bad Request'});

      expect(error.error).toBe('Invalid channel address');
    });
  });

  describe('generateDocumentation', () => {
    beforeEach(() => configureTestBed());

    it('should generate the documentation for the given language', () => {
      let result: string;
      service.generateDocumentation('<ttl content>', 'en', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(req => req.url === `${generateUrl}/documentation`);
      expect(req.request.params.get('language')).toBe('en');
      req.flush('<html>documentation</html>');

      expect(result).toBe('<html>documentation</html>');
    });
  });

  describe('generateAASX', () => {
    beforeEach(() => configureTestBed());

    it('should generate the AASX file', () => {
      let result: string;
      service.generateAASX('<ttl content>', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${generateUrl}/aasx`);
      req.flush('<aasx content>');

      expect(result).toBe('<aasx content>');
    });
  });

  describe('generatetAASasXML', () => {
    beforeEach(() => configureTestBed());

    it('should generate the AAS as XML', () => {
      let result: string;
      service.generatetAASasXML('<ttl content>', 'file:///source.ttl').subscribe(value => (result = value));

      const req = httpMock.expectOne(`${generateUrl}/aas-xml`);
      req.flush('<xml content>');

      expect(result).toBe('<xml content>');
    });
  });
});
