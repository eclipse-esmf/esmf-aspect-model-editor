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
import {LoadedFilesService} from '@ame/cache';
import {ConfirmDialogEnum, ConfirmDialogService, FileHandlingService, ModelSaverService} from '@ame/editor';
import {ElectronSignalsService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FileStatus, SidebarStateService} from '../../sidebar-state.service';
import {WorkspaceFileListComponent} from './workspace-file-list.component';

describe('WorkspaceFileListComponent', () => {
  let component: WorkspaceFileListComponent;
  let fixture: ComponentFixture<WorkspaceFileListComponent>;
  let sidebarService: SidebarStateService;
  let electronSignalsMock: {call: ReturnType<typeof vi.fn>};
  let modelSaverMock: {saveModel: ReturnType<typeof vi.fn>};
  let notificationMock: {info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};
  let confirmDialogMock: {open: ReturnType<typeof vi.fn>};
  let modelApiMock: {deleteAspectModel: ReturnType<typeof vi.fn>};
  let fileHandlingMock: {loadNamespaceFile: ReturnType<typeof vi.fn>};
  let loadedFilesMock: {currentLoadedFile: any; removeFile: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    vi.useFakeTimers();

    electronSignalsMock = {call: vi.fn()};
    modelSaverMock = {saveModel: vi.fn(() => of(true))};
    notificationMock = {info: vi.fn(), error: vi.fn()};
    confirmDialogMock = {open: vi.fn(() => of(ConfirmDialogEnum.ok))};
    modelApiMock = {deleteAspectModel: vi.fn(() => of(undefined))};
    fileHandlingMock = {loadNamespaceFile: vi.fn()};
    loadedFilesMock = {
      currentLoadedFile: {namespace: 'org.eclipse.esmf:1.0.0', name: 'Current.ttl'},
      removeFile: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        WorkspaceFileListComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        SidebarStateService,
        {provide: ElectronSignalsService, useValue: electronSignalsMock},
        {provide: ModelSaverService, useValue: modelSaverMock},
        {provide: NotificationsService, useValue: notificationMock},
        {provide: ConfirmDialogService, useValue: confirmDialogMock},
        {provide: ModelApiService, useValue: modelApiMock},
        {provide: FileHandlingService, useValue: fileHandlingMock},
        {provide: LoadedFilesService, useValue: loadedFilesMock},
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {
              notificationService: {loadModelInfoTitle: 'Info', loadModelInfoMessage: 'Load model first'},
              confirmDialog: {
                saveBeforeLoad: {phrase2: 'Save?', title: 'Title', cancelButton: 'Cancel', okButton: 'OK'},
                deleteFile: {phrase2: 'Delete?', title: 'Title'},
              },
            },
            translateService: {translate: (k: string) => k},
          },
        },
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);

    const f1 = new FileStatus('File1.ttl');
    f1.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#File1';
    sidebarService.namespacesState.setFile('org.eclipse.esmf:1.0.0', f1);

    const f2 = new FileStatus('Current.ttl');
    f2.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Current';
    sidebarService.namespacesState.setFile('org.eclipse.esmf:1.0.0', f2);

    fixture = TestBed.createComponent(WorkspaceFileListComponent);
    component = fixture.componentInstance;
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create and initialize namespace items', () => {
    expect(component).toBeTruthy();
    expect(component.searched()['org.eclipse.esmf:1.0.0']).toHaveLength(2);
  });

  it('should toggle fold for all namespaces', () => {
    expect(component.foldedStatus()).toBe(false);
    component.toggleFold();
    expect(component.foldedStatus()).toBe(true);
    expect(component.folded()['org.eclipse.esmf:1.0.0']).toBe(true);
  });

  it('should toggle fold for an individual namespace', () => {
    component.toggleNamespaceFold('org.eclipse.esmf:1.0.0');
    expect(component.folded()['org.eclipse.esmf:1.0.0']).toBe(true);

    component.toggleNamespaceFold('org.eclipse.esmf:1.0.0');
    expect(component.folded()['org.eclipse.esmf:1.0.0']).toBe(false);
  });

  it('should filter files based on search input', () => {
    component.search({target: {value: 'file1'}} as any);
    vi.advanceTimersByTime(150);

    expect(component.searched()['org.eclipse.esmf:1.0.0']).toHaveLength(1);
    expect(component.searched()['org.eclipse.esmf:1.0.0'][0].name).toBe('File1.ttl');

    component.search({target: {value: 'org.eclipse'}} as any);
    vi.advanceTimersByTime(150);
    expect(component.searched()['org.eclipse.esmf:1.0.0']).toHaveLength(2);
  });

  it('should select file when valid and not current file', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.selectFile('org.eclipse.esmf:1.0.0', file);

      expect(sidebarService.selection.selection()).toEqual({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'File1.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
    }
  });

  it('should not select file if outdated or errored', () => {
    const outdatedFile = new FileStatus('Outdated.ttl');
    outdatedFile.outdated = true;
    component.selectFile('org.eclipse.esmf:1.0.0', outdatedFile);
    expect(sidebarService.selection.selection()).toBeNull();

    const erroredFile = new FileStatus('Errored.ttl');
    erroredFile.errored = true;
    component.selectFile('org.eclipse.esmf:1.0.0', erroredFile);
    expect(sidebarService.selection.selection()).toBeNull();
  });

  it('should show notification when selecting a file if no current file is loaded', () => {
    loadedFilesMock.currentLoadedFile = null;
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.selectFile('org.eclipse.esmf:1.0.0', file);
      expect(notificationMock.info).toHaveBeenCalled();
    }
  });

  it('should not select file if it is the current file', () => {
    const currentFile = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'Current.ttl');
    expect(currentFile).toBeDefined();
    if (currentFile) {
      component.selectFile('org.eclipse.esmf:1.0.0', currentFile);
      expect(sidebarService.selection.selection()).toBeNull();
    }
  });

  it('should load file in new window', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      expect(component.isOpenable()).toBe(true);
      component.loadInNewWindow();

      expect(electronSignalsMock.call).toHaveBeenCalledWith('openWindow', {
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'File1.ttl',
        fromWorkspace: true,
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
      expect(component.menuSelection()).toBeNull();
    }
  });

  it('should open file after confirming and saving model', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      component.openFile();

      expect(confirmDialogMock.open).toHaveBeenCalled();
      expect(modelSaverMock.saveModel).toHaveBeenCalled();
      expect(fileHandlingMock.loadNamespaceFile).toHaveBeenCalledWith('org.eclipse.esmf:1.0.0:File1.ttl', file.aspectModelUrn);
    }
  });

  it('should delete file after confirmation', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      expect(component.isDeleteDisabled()).toBe(false);
      component.deleteFile();

      expect(confirmDialogMock.open).toHaveBeenCalled();
      expect(modelApiMock.deleteAspectModel).toHaveBeenCalledWith(file.aspectModelUrn);
      expect(loadedFilesMock.removeFile).toHaveBeenCalledWith('org.eclipse.esmf:1.0.0:File1.ttl');
      expect(electronSignalsMock.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    }
  });

  it('should disable delete for current loaded file', () => {
    const currentFile = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'Current.ttl');
    expect(currentFile).toBeDefined();
    if (currentFile) {
      component.prepare('org.eclipse.esmf:1.0.0', currentFile);
      expect(component.isDeleteDisabled()).toBe(true);
    }
  });

  it('should copy namespace to clipboard', () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);
      component.copyNamespace();

      expect(writeTextMock).toHaveBeenCalledWith('org.eclipse.esmf:1.0.0/File1.ttl');
    }
  });

  it('should identify current file correctly', () => {
    expect(component.isCurrentFile('org.eclipse.esmf:1.0.0', 'Current.ttl')).toBe(true);
    expect(component.isCurrentFile('org.eclipse.esmf:1.0.0', 'File1.ttl')).toBe(false);

    loadedFilesMock.currentLoadedFile = {namespace: 'org.eclipse.esmf:1.0.0', name: 'File1.ttl'};
    expect(component.isCurrentFile('org.eclipse.esmf:1.0.0', 'Current.ttl')).toBe(false);
    expect(component.isCurrentFile('org.eclipse.esmf:1.0.0', 'File1.ttl')).toBe(true);
  });

  it('should sort namespaces alphabetically', () => {
    const unsorted = [
      {key: 'org.b:1.0.0', value: []},
      {key: 'org.a:1.0.0', value: []},
      {key: 'org.c:1.0.0', value: []},
    ];

    const sorted = component.sortNamespaces(unsorted);
    expect(sorted.map(s => s.key)).toEqual(['org.a:1.0.0', 'org.b:1.0.0', 'org.c:1.0.0']);
  });

  it('should return appropriate tooltip for current, outdated, errored and normal files', () => {
    const currentFile = new FileStatus('Current.ttl');
    expect(component.getFileTooltip('org.eclipse.esmf:1.0.0', currentFile)).toContain('Current.ttl');

    const outdatedFile = new FileStatus('Outdated.ttl');
    outdatedFile.outdated = true;
    outdatedFile.sammVersion = '2.0.0';
    expect(component.getFileTooltip('org.eclipse.esmf:1.0.0', outdatedFile)).toContain('tooltips.outdatedFile');

    const erroredFile = new FileStatus('Error.ttl');
    erroredFile.errored = true;
    expect(component.getFileTooltip('org.eclipse.esmf:1.0.0', erroredFile)).toContain('Error.ttl');

    const normalFile = new FileStatus('Normal.ttl');
    expect(component.getFileTooltip('other.namespace:1.0.0', normalFile)).toBe('Normal.ttl');
  });
});
