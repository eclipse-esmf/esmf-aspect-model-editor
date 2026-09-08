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

import {APP_CONFIG, AppConfig, BrowserService, IPC_RENDERER} from '@ame/shared';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MigratorApiService} from './migrator-api.service';
import {ModelApiService} from './model-api.service';

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

describe('MigratorApiService', () => {
  let service: MigratorApiService;
  let httpMock: HttpTestingController;
  let browserService: {isStartedAsElectronApp: ReturnType<typeof vi.fn>};
  let modelApiService: {fetchAllNamespaceFilesContent: ReturnType<typeof vi.fn>};
  let ipcRenderer: {getBackendPort: ReturnType<typeof vi.fn>};

  const configureTestBed = () => {
    TestBed.configureTestingModule({
      providers: [
        MigratorApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: APP_CONFIG, useValue: config},
        {provide: BrowserService, useValue: browserService},
        {provide: ModelApiService, useValue: modelApiService},
        {provide: IPC_RENDERER, useValue: ipcRenderer},
      ],
    });

    service = TestBed.inject(MigratorApiService);
    httpMock = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => {
    browserService = {isStartedAsElectronApp: vi.fn(() => false)};
    modelApiService = {fetchAllNamespaceFilesContent: vi.fn()};
    ipcRenderer = {getBackendPort: vi.fn(() => Promise.resolve('4000'))};
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should be created', () => {
    configureTestBed();
    expect(service).toBeTruthy();
  });

  it('should expose an empty rdfModelsToMigrate signal by default', () => {
    configureTestBed();
    expect(service.rdfModelsToMigrate()).toEqual([]);
  });

  it('should not replace the service url port when not started as an electron app', () => {
    configureTestBed();

    service.createBackup().subscribe();
    const req = httpMock.expectOne('http://localhost:9090/ame/api/package/backup-workspace');
    req.flush('backup');

    expect(ipcRenderer.getBackendPort).not.toHaveBeenCalled();
  });

  it('should replace the service url port when started as an electron app', async () => {
    browserService.isStartedAsElectronApp = vi.fn(() => true);
    configureTestBed();

    // let the getBackendPort() promise resolve
    await Promise.resolve();
    await Promise.resolve();

    service.createBackup().subscribe();
    const req = httpMock.expectOne('http://localhost:4000/ame/api/package/backup-workspace');
    req.flush('backup');
  });

  describe('hasFilesToMigrate', () => {
    beforeEach(() => configureTestBed());

    it('should return false and clear the signal when there is nothing to migrate', () => {
      vi.spyOn(service, 'getRdfModelsFromWorkspace').mockReturnValue(
        of([
          {name: 'a', version: '2.2.0', rdfModel: {id: 'a'} as any},
          {name: 'b', version: '2.3.0', rdfModel: {id: 'b'} as any},
        ]),
      );

      let result: boolean;
      service.hasFilesToMigrate().subscribe(value => (result = value));

      expect(result).toBe(false);
      expect(service.rdfModelsToMigrate()).toEqual([]);
    });

    it('should return true and populate the signal with the outdated rdf models', () => {
      const outdatedRdfModel = {id: 'outdated'} as any;
      const upToDateRdfModel = {id: 'up-to-date'} as any;
      vi.spyOn(service, 'getRdfModelsFromWorkspace').mockReturnValue(
        of([
          {name: 'outdated-file', version: '1.0.0', rdfModel: outdatedRdfModel},
          {name: 'up-to-date-file', version: '2.2.0', rdfModel: upToDateRdfModel},
        ]),
      );

      let result: boolean;
      service.hasFilesToMigrate().subscribe(value => (result = value));

      expect(result).toBe(true);
      expect(service.rdfModelsToMigrate()).toEqual([outdatedRdfModel]);
    });

    it('should reset the signal before recomputing it on every call', () => {
      const spy = vi.spyOn(service, 'getRdfModelsFromWorkspace');
      spy.mockReturnValue(of([{name: 'outdated-file', version: '1.0.0', rdfModel: {id: 'outdated'} as any}]));
      service.hasFilesToMigrate().subscribe();
      expect(service.rdfModelsToMigrate()).toEqual([{id: 'outdated'}]);

      spy.mockReturnValue(of([{name: 'up-to-date-file', version: '2.2.0', rdfModel: {id: 'up-to-date'} as any}]));
      service.hasFilesToMigrate().subscribe();
      expect(service.rdfModelsToMigrate()).toEqual([]);
    });
  });

  it('should create a workspace backup', () => {
    configureTestBed();

    let result: string;
    service.createBackup().subscribe(value => (result = value));

    const req = httpMock.expectOne('http://localhost:9090/ame/api/package/backup-workspace');
    expect(req.request.method).toBe('GET');
    req.flush('backup-id-123');

    expect(result).toBe('backup-id-123');
  });

  it('should migrate the workspace with the given setNewVersion flag', () => {
    configureTestBed();

    let result: {success: string; errors: string[]};
    service.migrateWorkspace(true).subscribe(value => (result = value));

    const req = httpMock.expectOne(req => req.url === 'http://localhost:9090/ame/api/models/migrate-workspace');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('setNewVersion')).toBe('true');
    req.flush({success: 'ok', errors: []});

    expect(result).toEqual({success: 'ok', errors: []});
  });
});
