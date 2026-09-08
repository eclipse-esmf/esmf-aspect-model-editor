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

import {FileHandlingService, FileInfo, FileTypes, FileUploadService} from '@ame/editor';
import {ElectronSignalsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SelectNamespacesComponent} from '../../namespace-exporter/components';
import {NamespacesManagerService} from './namespaces-manager.service';

describe('NamespacesManagerService', () => {
  let service: NamespacesManagerService;
  let matDialog: {open: ReturnType<typeof vi.fn>};
  let fileHandlingService: {importFilesToWorkspace: ReturnType<typeof vi.fn>};
  let electronSignalsService: {call: ReturnType<typeof vi.fn>};
  let fileUploadService: {selectFile: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    matDialog = {
      open: vi.fn(),
    };
    fileHandlingService = {
      importFilesToWorkspace: vi.fn(() => of([])),
    };
    electronSignalsService = {
      call: vi.fn(),
    };
    fileUploadService = {
      selectFile: vi.fn(() => of(new File(['content'], 'test.zip', {type: 'application/zip'}))),
    };

    TestBed.configureTestingModule({
      providers: [
        NamespacesManagerService,
        {provide: MatDialog, useValue: matDialog},
        {provide: FileHandlingService, useValue: fileHandlingService},
        {provide: ElectronSignalsService, useValue: electronSignalsService},
        {provide: FileUploadService, useValue: fileUploadService},
      ],
    });

    service = TestBed.inject(NamespacesManagerService);
  });

  it('should be created and register on window in non-production mode', () => {
    expect(service).toBeTruthy();
    expect((window as unknown as Record<string, unknown>)['angular.namespacesManagerService']).toBe(service);
  });

  describe('resolveNamespacesFile', () => {
    it('should create and return file when fileInfo is provided', async () => {
      const fileInfo: FileInfo = {
        name: 'custom-model.zip',
        path: '/mock/path/custom-model.zip',
        content: new Uint8Array([1, 2, 3]),
      };

      const file = await new Promise<File>(resolve => service.resolveNamespacesFile(fileInfo).subscribe(resolve));

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('custom-model.zip');
    });

    it('should call fileUploadService.selectFile with zip file type when fileInfo is not provided', async () => {
      const dummyFile = new File(['data'], 'uploaded.zip', {type: 'application/zip'});
      fileUploadService.selectFile.mockReturnValue(of(dummyFile));

      const file = await new Promise<File>(resolve => service.resolveNamespacesFile().subscribe(resolve));

      expect(fileUploadService.selectFile).toHaveBeenCalledWith([FileTypes.ZIP]);
      expect(file).toBe(dummyFile);
    });
  });

  describe('importNamespaces', () => {
    it('should delegate to fileHandlingService.importFilesToWorkspace with take(1)', async () => {
      const zipFile = new File(['data'], 'models.zip', {type: 'application/zip'});
      const mockResult = [{id: 'model-1'} as any];
      fileHandlingService.importFilesToWorkspace.mockReturnValue(of(mockResult));

      const result = await new Promise(resolve => service.importNamespaces(zipFile).subscribe(resolve));

      expect(fileHandlingService.importFilesToWorkspace).toHaveBeenCalledWith(zipFile);
      expect(result).toEqual(mockResult);
    });
  });

  describe('onImportNamespaces', () => {
    it('should resolve file from fileInfo, import namespaces and request workspace refresh', () => {
      const fileInfo: FileInfo = {
        name: 'package.zip',
        path: '/mock/path/package.zip',
        content: new Uint8Array([1, 2, 3]),
      };
      const zipFile = new File(['content'], 'package.zip', {type: 'application/zip'});
      const resolveSpy = vi.spyOn(service, 'resolveNamespacesFile').mockReturnValue(of(zipFile));
      const importSpy = vi.spyOn(service, 'importNamespaces').mockReturnValue(of([]));

      service.onImportNamespaces(fileInfo);

      expect(resolveSpy).toHaveBeenCalledWith(fileInfo);
      expect(importSpy).toHaveBeenCalledWith(zipFile);
      expect(electronSignalsService.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    });

    it('should resolve file from file upload when fileInfo is omitted, import and refresh workspace', () => {
      const zipFile = new File(['upload'], 'selected.zip', {type: 'application/zip'});
      const resolveSpy = vi.spyOn(service, 'resolveNamespacesFile').mockReturnValue(of(zipFile));
      const importSpy = vi.spyOn(service, 'importNamespaces').mockReturnValue(of([]));

      service.onImportNamespaces();

      expect(resolveSpy).toHaveBeenCalledWith(undefined);
      expect(importSpy).toHaveBeenCalledWith(zipFile);
      expect(electronSignalsService.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    });
  });

  describe('onExportNamespaces', () => {
    it('should open SelectNamespacesComponent dialog with disableClose: true', () => {
      service.onExportNamespaces();

      expect(matDialog.open).toHaveBeenCalledWith(SelectNamespacesComponent, {disableClose: true});
    });
  });
});
