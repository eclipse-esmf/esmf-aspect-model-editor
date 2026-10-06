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

import {ConfirmDialogEnum, ConfirmDialogPort, ModelSessionFacade, ReferenceReport, TabsStore, WorkspaceFacade} from '@ame/domain';
import {LanguageTranslationService, NotificationsService, OtherWindowsModelsService, TauriSignalsService} from '@ame/shared';
import {HttpErrorResponse} from '@angular/common/http';
import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileStatus, SidebarStateService} from '../../sidebar-state.service';
import {ClearWorkspaceDialogComponent} from './clear-workspace-dialog.component';
import {ReferencesDialogComponent} from './references-dialog.component';
import {splitNamespaceKey, WorkspaceDeletionService} from './workspace-deletion.service';

const OK: ReferenceReport = {deletable: true, references: [], unreadableFiles: []};
const BLOCKED: ReferenceReport = {
  deletable: false,
  references: [{namespace: 'org.b', version: '1.0.0', fileName: 'B1.ttl', referencedElements: ['urn:samm:org.a:1.0.0#p']}],
  unreadableFiles: [],
};

describe('splitNamespaceKey', () => {
  it('splits at the last colon', () => {
    expect(splitNamespaceKey('org.example:1.0.0')).toEqual({namespace: 'org.example', version: '1.0.0'});
  });

  it('keeps a key without version', () => {
    expect(splitNamespaceKey('org.example')).toEqual({namespace: 'org.example', version: ''});
  });
});

describe('WorkspaceDeletionService', () => {
  let service: WorkspaceDeletionService;
  let sidebar: SidebarStateService;
  let api: Record<'getReferences' | 'deleteAspectModel' | 'deleteNamespace' | 'clearWorkspace', ReturnType<typeof vi.fn>>;
  let confirm: {open: ReturnType<typeof vi.fn>};
  let dialog: {open: ReturnType<typeof vi.fn>};
  let dialogResult: unknown;
  let notifications: {success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};
  let tauri: {call: ReturnType<typeof vi.fn>};
  let session: {currentLoadedFile: unknown; removeFile: ReturnType<typeof vi.fn>};
  let file: FileStatus;
  let otherWindows: Record<'isFileOpen' | 'isNamespaceOpen' | 'hasOpenModels', ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    otherWindows = {isFileOpen: vi.fn(() => false), isNamespaceOpen: vi.fn(() => false), hasOpenModels: vi.fn(() => false)};
    api = {
      getReferences: vi.fn(() => of(OK)),
      deleteAspectModel: vi.fn(() => of(null)),
      deleteNamespace: vi.fn(() => of(OK)),
      clearWorkspace: vi.fn(() => of({deletedFiles: 2, backupCreated: true})),
    };
    confirm = {open: vi.fn(() => of(ConfirmDialogEnum.ok))};
    dialogResult = undefined;
    dialog = {open: vi.fn(() => ({afterClosed: () => of(dialogResult)}))};
    notifications = {success: vi.fn(), error: vi.fn()};
    tauri = {call: vi.fn()};
    session = {currentLoadedFile: null, removeFile: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SidebarStateService,
        {provide: WorkspaceFacade, useValue: api},
        {provide: ConfirmDialogPort, useValue: confirm},
        {provide: MatDialog, useValue: dialog},
        {provide: NotificationsService, useValue: notifications},
        {provide: TauriSignalsService, useValue: tauri},
        {provide: ModelSessionFacade, useValue: session},
        {provide: OtherWindowsModelsService, useValue: otherWindows},
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {confirmDialog: {deleteFile: {phrase2: 'undo', title: 'Delete'}}},
            translateService: {
              translate: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
            },
          },
        },
      ],
    });

    service = TestBed.inject(WorkspaceDeletionService);
    sidebar = TestBed.inject(SidebarStateService);
    file = new FileStatus('A1.ttl');
    file.aspectModelUrn = 'urn:samm:org.a:1.0.0#A1';
    sidebar.namespacesState.setFile('org.a:1.0.0', file);
    sidebar.namespacesState.setFile('org.a:1.0.0', new FileStatus('A2.ttl'));
    sidebar.namespacesState.setFile('org.b:1.0.0', new FileStatus('B1.ttl'));
    TestBed.inject(TabsStore).clearTabs();
  });

  const run = (observable: ReturnType<WorkspaceDeletionService['deleteFile']>) => {
    let result: boolean | undefined;
    observable.subscribe(value => (result = value));
    return result;
  };

  describe('deleteFile', () => {
    it('checks, confirms, deletes and refreshes the workspace', () => {
      sidebar.selection.select('org.a:1.0.0', file);

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(true);

      expect(api.getReferences).toHaveBeenCalledWith('org.a', '1.0.0', 'A1.ttl');
      expect(confirm.open).toHaveBeenCalled();
      expect(api.deleteAspectModel).toHaveBeenCalledWith('urn:samm:org.a:1.0.0#A1');
      expect(session.removeFile).toHaveBeenCalledWith('org.a:1.0.0:A1.ttl');
      expect(sidebar.selection.file).toBeNull();
      expect(tauri.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
      expect(service.busy()).toBe(false);
    });

    it('shows the references and neither confirms nor deletes when the file is still used', () => {
      api.getReferences.mockReturnValue(of(BLOCKED));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);

      expect(dialog.open).toHaveBeenCalledWith(
        ReferencesDialogComponent,
        expect.objectContaining({data: {kind: 'file', name: 'A1.ttl', report: BLOCKED}}),
      );
      expect(confirm.open).not.toHaveBeenCalled();
      expect(api.deleteAspectModel).not.toHaveBeenCalled();
      expect(sidebar.namespacesState.getFile('org.a:1.0.0', 'A1.ttl')).toBeDefined();
    });

    it('also blocks on files that could not be checked', () => {
      const unreadable: ReferenceReport = {
        deletable: false,
        references: [],
        unreadableFiles: [{namespace: 'org.c', version: '1.0.0', fileName: 'Broken.ttl', message: 'syntax'}],
      };
      api.getReferences.mockReturnValue(of(unreadable));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);
      expect(api.deleteAspectModel).not.toHaveBeenCalled();
    });

    it.each([ConfirmDialogEnum.cancel, undefined])('deletes nothing when the confirmation is dismissed (%s)', result => {
      confirm.open.mockReturnValue(of(result));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);
      expect(api.deleteAspectModel).not.toHaveBeenCalled();
      expect(session.removeFile).not.toHaveBeenCalled();
    });

    it('deletes nothing and reports an error when the check fails (e.g. an outdated backend)', () => {
      api.getReferences.mockReturnValue(throwError(() => new HttpErrorResponse({status: 404})));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);

      expect(confirm.open).not.toHaveBeenCalled();
      expect(api.deleteAspectModel).not.toHaveBeenCalled();
      expect(notifications.error).toHaveBeenCalledWith(expect.objectContaining({title: 'sidebar.deletion.failed'}));
      expect(service.busy()).toBe(false);
    });

    it('shows the references when the backend refuses with 409 (references changed meanwhile)', () => {
      api.deleteAspectModel.mockReturnValue(throwError(() => new HttpErrorResponse({status: 409, error: BLOCKED})));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);

      expect(dialog.open).toHaveBeenCalledWith(ReferencesDialogComponent, expect.anything());
      expect(session.removeFile).not.toHaveBeenCalled();
      expect(tauri.call).not.toHaveBeenCalled();
    });

    it('keeps the file in the list when deleting fails', () => {
      api.deleteAspectModel.mockReturnValue(throwError(() => new HttpErrorResponse({status: 500, error: {error: {message: 'disk'}}})));

      expect(run(service.deleteFile('org.a:1.0.0', file))).toBe(false);

      expect(notifications.error).toHaveBeenCalledWith({title: 'sidebar.deletion.failed', message: 'disk'});
      expect(sidebar.namespacesState.getFile('org.a:1.0.0', 'A1.ttl')).toBeDefined();
    });
  });

  describe('deleteNamespace', () => {
    it('checks the namespace version, warns with the file count and deletes it', () => {
      expect(run(service.deleteNamespace('org.a:1.0.0'))).toBe(true);

      expect(api.getReferences).toHaveBeenCalledWith('org.a', '1.0.0');
      const options = confirm.open.mock.calls[0][0];
      expect(options.phrases[1]).toBe('sidebar.deletion.namespace.phrase2 {"count":2}');
      expect(options.okButtonText).toBe('sidebar.deletion.namespace.ok');
      expect(api.deleteNamespace).toHaveBeenCalledWith('org.a', '1.0.0');
      expect(session.removeFile).toHaveBeenCalledWith('org.a:1.0.0:A1.ttl');
      expect(session.removeFile).toHaveBeenCalledWith('org.a:1.0.0:A2.ttl');
      expect(notifications.success).toHaveBeenCalled();
      expect(tauri.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    });

    it('blocks a namespace that other namespaces still use', () => {
      api.getReferences.mockReturnValue(of(BLOCKED));

      expect(run(service.deleteNamespace('org.a:1.0.0'))).toBe(false);

      expect(dialog.open).toHaveBeenCalledWith(
        ReferencesDialogComponent,
        expect.objectContaining({data: {kind: 'namespace', name: 'org.a:1.0.0', report: BLOCKED}}),
      );
      expect(confirm.open).not.toHaveBeenCalled();
      expect(api.deleteNamespace).not.toHaveBeenCalled();
    });

    it('handles a 409 of the delete request', () => {
      api.deleteNamespace.mockReturnValue(throwError(() => new HttpErrorResponse({status: 409, error: BLOCKED})));

      expect(run(service.deleteNamespace('org.a:1.0.0'))).toBe(false);
      expect(dialog.open).toHaveBeenCalledWith(ReferencesDialogComponent, expect.anything());
      expect(notifications.success).not.toHaveBeenCalled();
    });

    it('deletes nothing when cancelled', () => {
      confirm.open.mockReturnValue(of(ConfirmDialogEnum.cancel));

      expect(run(service.deleteNamespace('org.a:1.0.0'))).toBe(false);
      expect(api.deleteNamespace).not.toHaveBeenCalled();
    });
  });

  describe('clearWorkspace', () => {
    it('clears with backup after the typed confirmation', () => {
      dialogResult = {backup: true};

      expect(run(service.clearWorkspace())).toBe(true);

      expect(dialog.open).toHaveBeenCalledWith(ClearWorkspaceDialogComponent, expect.objectContaining({data: {fileCount: 3}}));
      expect(api.clearWorkspace).toHaveBeenCalledWith(true);
      expect(session.removeFile).toHaveBeenCalledTimes(3);
      expect(notifications.success).toHaveBeenCalledWith({
        title: 'sidebar.deletion.clear.success',
        message: 'sidebar.deletion.clear.successBackup {"count":2}',
      });
      expect(tauri.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    });

    it('clears without backup', () => {
      dialogResult = {backup: false};
      api.clearWorkspace.mockReturnValue(of({deletedFiles: 3, backupCreated: false}));

      run(service.clearWorkspace());

      expect(api.clearWorkspace).toHaveBeenCalledWith(false);
      expect(notifications.success).toHaveBeenCalledWith(
        expect.objectContaining({message: 'sidebar.deletion.clear.successMessage {"count":3}'}),
      );
    });

    it('does nothing when the dialog is closed without confirmation', () => {
      expect(run(service.clearWorkspace())).toBe(false);
      expect(api.clearWorkspace).not.toHaveBeenCalled();
    });

    it('reports a failure', () => {
      dialogResult = {backup: true};
      api.clearWorkspace.mockReturnValue(throwError(() => new HttpErrorResponse({status: 500})));

      expect(run(service.clearWorkspace())).toBe(false);
      expect(notifications.error).toHaveBeenCalled();
      expect(tauri.call).not.toHaveBeenCalled();
      expect(service.busy()).toBe(false);
    });
  });

  describe('open models', () => {
    it('detects namespaces and files that are open in tabs', () => {
      TestBed.inject(TabsStore).addOrUpdateTab({id: 'org.a:1.0.0:A2.ttl', file: 'A2.ttl', namespace: 'org.a:1.0.0'});

      expect(service.isNamespaceOpen('org.a:1.0.0')).toBe(true);
      expect(service.isNamespaceOpen('org.b:1.0.0')).toBe(false);
      expect(service.isFileOpen('org.a:1.0.0', 'A2.ttl')).toBe(true);
      expect(service.isFileOpen('org.a:1.0.0', 'A1.ttl')).toBe(false);
      expect(service.hasOpenWorkspaceModels()).toBe(true);
    });

    it('ignores tabs of models that are not in the workspace', () => {
      TestBed.inject(TabsStore).addOrUpdateTab({id: 'org.a:1.0.0:new-model.ttl', file: 'new-model.ttl', namespace: 'org.a:1.0.0'});

      expect(service.isNamespaceOpen('org.a:1.0.0')).toBe(false);
      expect(service.hasOpenWorkspaceModels()).toBe(false);
    });

    it('counts the workspace files', () => {
      expect(service.workspaceFileCount()).toBe(3);
    });
  });

  describe('block reasons', () => {
    const openHere = () => TestBed.inject(TabsStore).addOrUpdateTab({id: 'org.a:1.0.0:A1.ttl', file: 'A1.ttl', namespace: 'org.a:1.0.0'});

    it('allows deletion when nothing blocks', () => {
      expect(service.fileBlockReason('org.a:1.0.0', 'A1.ttl')).toBeNull();
      expect(service.namespaceBlockReason('org.a:1.0.0')).toBeNull();
      expect(service.clearBlockReason()).toBeNull();
      expect(service.blockReasonText('file', null)).toBe('');
    });

    it('blocks a model that is open in this window', () => {
      openHere();

      expect(service.fileBlockReason('org.a:1.0.0', 'A1.ttl')).toBe('openHere');
      expect(service.namespaceBlockReason('org.a:1.0.0')).toBe('openHere');
      expect(service.clearBlockReason()).toBe('openHere');
      expect(service.blockReasonText('file', 'openHere')).toBe('sidebar.deletion.reason.fileOpenHere');
      expect(service.blockReasonText('namespace', 'openHere')).toBe('sidebar.deletion.reason.namespaceOpenHere');
      expect(service.blockReasonText('clear', 'openHere')).toBe('sidebar.deletion.reason.clearOpenHere');
    });

    it('blocks a model that is open in another window', () => {
      otherWindows.isFileOpen.mockReturnValue(true);
      otherWindows.isNamespaceOpen.mockReturnValue(true);
      otherWindows.hasOpenModels.mockReturnValue(true);

      expect(service.fileBlockReason('org.a:1.0.0', 'A1.ttl')).toBe('openElsewhere');
      expect(otherWindows.isFileOpen).toHaveBeenCalledWith('org.a:1.0.0', 'A1.ttl');
      expect(service.namespaceBlockReason('org.a:1.0.0')).toBe('openElsewhere');
      expect(service.clearBlockReason()).toBe('openElsewhere');
      expect(service.blockReasonText('file', 'openElsewhere')).toBe('sidebar.deletion.reason.fileOpenElsewhere');
      expect(service.blockReasonText('namespace', 'openElsewhere')).toBe('sidebar.deletion.reason.namespaceOpenElsewhere');
      expect(service.blockReasonText('clear', 'openElsewhere')).toBe('sidebar.deletion.reason.clearOpenElsewhere');
    });

    it('prefers the own window over other windows', () => {
      openHere();
      otherWindows.isFileOpen.mockReturnValue(true);

      expect(service.fileBlockReason('org.a:1.0.0', 'A1.ttl')).toBe('openHere');
    });

    it('reports an empty workspace before open models', () => {
      sidebar.namespacesState.clear();
      otherWindows.hasOpenModels.mockReturnValue(true);

      expect(service.clearBlockReason()).toBe('empty');
      expect(service.blockReasonText('clear', 'empty')).toBe('sidebar.deletion.reason.clearEmpty');
    });

    it('blocks everything while another deletion runs', () => {
      service.busy.set(true);

      expect(service.fileBlockReason('org.a:1.0.0', 'A1.ttl')).toBe('busy');
      expect(service.namespaceBlockReason('org.a:1.0.0')).toBe('busy');
      expect(service.clearBlockReason()).toBe('busy');
      expect(service.blockReasonText('namespace', 'busy')).toBe('sidebar.deletion.reason.busy');
    });
  });
});
