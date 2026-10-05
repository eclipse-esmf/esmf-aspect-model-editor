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

import {ConfirmDialogEnum, ConfirmDialogPort, ModelOpenerPort, ModelSessionFacade, TabsStore, WorkspaceFacade} from '@ame/domain';
import {
  ClipboardService,
  LanguageTranslationService,
  NotificationsService,
  OtherWindowsModelsService,
  TauriSignalsService,
} from '@ame/shared';
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
  let tauriSignalsMock: {call: ReturnType<typeof vi.fn>};
  let notificationMock: {info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn>};
  let confirmDialogMock: {open: ReturnType<typeof vi.fn>};
  let modelApiMock: {
    deleteAspectModel: ReturnType<typeof vi.fn>;
    getStoragePath: ReturnType<typeof vi.fn>;
    getReferences: ReturnType<typeof vi.fn>;
    deleteNamespace: ReturnType<typeof vi.fn>;
  };
  let loadedFilesMock: {currentLoadedFile: any; removeFile: ReturnType<typeof vi.fn>};
  let modelOpenerMock: {
    promptAndOpen: ReturnType<typeof vi.fn>;
    openInCurrentWindow: ReturnType<typeof vi.fn>;
    openInNewTab: ReturnType<typeof vi.fn>;
    openInNewWindow: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    tauriSignalsMock = {call: vi.fn()};
    notificationMock = {info: vi.fn(), error: vi.fn(), success: vi.fn(() => of(true))};
    confirmDialogMock = {open: vi.fn(() => of(ConfirmDialogEnum.ok))};
    modelApiMock = {
      deleteAspectModel: vi.fn(() => of(undefined)),
      getStoragePath: vi.fn(() => of({storagePath: '/workspace'})),
      getReferences: vi.fn(() => of({deletable: true, references: [], unreadableFiles: []})),
      deleteNamespace: vi.fn(() => of({deletable: true, references: [], unreadableFiles: []})),
    };
    loadedFilesMock = {
      currentLoadedFile: {namespace: 'org.eclipse.esmf:1.0.0', name: 'Current.ttl'},
      removeFile: vi.fn(),
    };
    modelOpenerMock = {
      promptAndOpen: vi.fn(() => of(true)),
      openInCurrentWindow: vi.fn(() => of(true)),
      openInNewTab: vi.fn(() => of(true)),
      openInNewWindow: vi.fn(),
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
        {provide: TauriSignalsService, useValue: tauriSignalsMock},
        {provide: NotificationsService, useValue: notificationMock},
        {provide: ConfirmDialogPort, useValue: confirmDialogMock},
        {provide: WorkspaceFacade, useValue: modelApiMock},
        {provide: ModelSessionFacade, useValue: loadedFilesMock},
        {provide: ModelOpenerPort, useValue: modelOpenerMock},
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

  it('should load file in new window via ModelOpenerService', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      expect(component.isOpenable()).toBe(true);
      component.loadInNewWindow();

      expect(modelOpenerMock.openInNewWindow).toHaveBeenCalledWith({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'File1.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
      expect(component.menuSelection()).toBeNull();
    }
  });

  it('should load file in new tab via ModelOpenerService', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      expect(component.isOpenable()).toBe(true);
      component.loadInNewTab();

      expect(modelOpenerMock.openInNewTab).toHaveBeenCalledWith({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'File1.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
      expect(component.menuSelection()).toBeNull();
    }
  });

  it('should handle context menu event on file item', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as MouseEvent;
      const triggerMock = {
        openMenu: vi.fn(),
      } as any;

      component.openContextMenu(event, 'org.eclipse.esmf:1.0.0', file, triggerMock);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.menuSelection()).toEqual({namespace: 'org.eclipse.esmf:1.0.0', file});
      expect(triggerMock.openMenu).toHaveBeenCalled();
    }
  });

  it('should open file in current window via ModelOpenerService', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);

      component.openFile();

      expect(modelOpenerMock.openInCurrentWindow).toHaveBeenCalledWith({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'File1.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
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
      expect(tauriSignalsMock.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    }
  });

  it.each([undefined, ConfirmDialogEnum.cancel])('should not delete the file when the confirmation is dismissed (%s)', result => {
    confirmDialogMock.open.mockReturnValue(of(result));
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    component.prepare('org.eclipse.esmf:1.0.0', file as NonNullable<typeof file>);

    component.deleteFile();

    expect(confirmDialogMock.open).toHaveBeenCalled();
    expect(modelApiMock.deleteAspectModel).not.toHaveBeenCalled();
    expect(loadedFilesMock.removeFile).not.toHaveBeenCalled();
  });

  it('should check the references of the file before asking for confirmation', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    component.prepare('org.eclipse.esmf:1.0.0', file as NonNullable<typeof file>);

    component.deleteFile();

    expect(modelApiMock.getReferences).toHaveBeenCalledWith('org.eclipse.esmf', '1.0.0', 'File1.ttl');
    expect(modelApiMock.getReferences.mock.invocationCallOrder[0]).toBeLessThan(confirmDialogMock.open.mock.invocationCallOrder[0]);
  });

  it('should disable delete for a file that is open in another tab of this window', () => {
    TestBed.inject(TabsStore).addOrUpdateTab({
      id: 'org.eclipse.esmf:1.0.0:File1.ttl',
      file: 'File1.ttl',
      namespace: 'org.eclipse.esmf:1.0.0',
    });
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    component.prepare('org.eclipse.esmf:1.0.0', file as NonNullable<typeof file>);

    expect(component.isDeleteDisabled()).toBe(true);
    expect(component.deleteTooltip()).toBe('sidebar.deletion.reason.fileOpenHere');
    component.deleteFile();
    expect(modelApiMock.getReferences).not.toHaveBeenCalled();
  });

  it('should disable delete for a file that is open in another window', () => {
    vi.spyOn(TestBed.inject(OtherWindowsModelsService), 'isFileOpen').mockReturnValue(true);
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    component.prepare('org.eclipse.esmf:1.0.0', file as NonNullable<typeof file>);

    expect(component.isDeleteDisabled()).toBe(true);
    expect(component.deleteTooltip()).toBe('sidebar.deletion.reason.fileOpenElsewhere');
  });

  it('should show no delete tooltip when the file can be deleted', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    component.prepare('org.eclipse.esmf:1.0.0', file as NonNullable<typeof file>);

    expect(component.deleteTooltip()).toBe('');
  });

  describe('namespace menu', () => {
    afterEach(() => TestBed.inject(TabsStore).clearTabs());

    it('renders a menu button for every namespace', () => {
      const buttons = fixture.nativeElement.querySelectorAll('[data-testid="openNamespaceMenu"]');
      expect(buttons).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('[data-testid="workspace-namespace-org.eclipse.esmf:1.0.0"]')).toBeTruthy();
    });

    it('does not toggle the namespace fold when the menu button is clicked', () => {
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="openNamespaceMenu"]');
      button.click();

      expect(component.namespaceMenuSelection()).toBe('org.eclipse.esmf:1.0.0');
      expect(component.folded()['org.eclipse.esmf:1.0.0']).toBe(false);
    });

    it('checks and deletes the namespace version', () => {
      component.prepareNamespaceMenu('org.eclipse.esmf:1.0.0');
      TestBed.inject(TabsStore).clearTabs();
      loadedFilesMock.currentLoadedFile = null;

      expect(component.isNamespaceDeleteDisabled()).toBe(false);
      component.deleteNamespace();

      expect(modelApiMock.getReferences).toHaveBeenCalledWith('org.eclipse.esmf', '1.0.0');
      expect(confirmDialogMock.open).toHaveBeenCalled();
      expect(modelApiMock.deleteNamespace).toHaveBeenCalledWith('org.eclipse.esmf', '1.0.0');
      expect(tauriSignalsMock.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
    });

    it('is disabled while a model of the namespace is open in a tab', () => {
      TestBed.inject(TabsStore).addOrUpdateTab({
        id: 'org.eclipse.esmf:1.0.0:Current.ttl',
        file: 'Current.ttl',
        namespace: 'org.eclipse.esmf:1.0.0',
      });
      component.prepareNamespaceMenu('org.eclipse.esmf:1.0.0');

      expect(component.isNamespaceDeleteDisabled()).toBe(true);
      expect(component.namespaceDeleteTooltip()).toBe('sidebar.deletion.reason.namespaceOpenHere');
      component.deleteNamespace();
      expect(modelApiMock.getReferences).not.toHaveBeenCalled();
    });

    it('is disabled while a model of the namespace is open in another window', () => {
      TestBed.inject(TabsStore).clearTabs();
      loadedFilesMock.currentLoadedFile = null;
      vi.spyOn(TestBed.inject(OtherWindowsModelsService), 'isNamespaceOpen').mockReturnValue(true);
      component.prepareNamespaceMenu('org.eclipse.esmf:1.0.0');

      expect(component.isNamespaceDeleteDisabled()).toBe(true);
      expect(component.namespaceDeleteTooltip()).toBe('sidebar.deletion.reason.namespaceOpenElsewhere');
    });

    it('is disabled without a selected namespace', () => {
      expect(component.isNamespaceDeleteDisabled()).toBe(true);
    });
  });

  it('should disable delete for current loaded file', () => {
    const currentFile = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'Current.ttl');
    expect(currentFile).toBeDefined();
    if (currentFile) {
      component.prepare('org.eclipse.esmf:1.0.0', currentFile);
      expect(component.isDeleteDisabled()).toBe(true);
    }
  });

  it('should copy file path to clipboard', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);

    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.prepare('org.eclipse.esmf:1.0.0', file);
      component.copyFilePath();

      expect(writeTextMock).toHaveBeenCalledWith('/workspace/org.eclipse.esmf/1.0.0/File1.ttl');
      expect(notificationMock.success).toHaveBeenCalled();
    }
  });

  it('should copy the file path through the ClipboardService (Tauri clipboard in the desktop app)', () => {
    const clipboard = TestBed.inject(ClipboardService);
    const copy = vi.spyOn(clipboard, 'copy').mockImplementation(() => undefined);

    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl')!;
    component.prepare('org.eclipse.esmf:1.0.0', file);
    component.copyFilePath();

    expect(copy).toHaveBeenCalledWith('/workspace/org.eclipse.esmf/1.0.0/File1.ttl');
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

  describe('files with missing references', () => {
    let fileWithMissingReferences: FileStatus;

    beforeEach(() => {
      fileWithMissingReferences = new FileStatus('Consumer.ttl');
      fileWithMissingReferences.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Consumer';
      fileWithMissingReferences.missingDependencies = ['org.gone:1.0.0', 'org.lost:2.0.0'];
      sidebarService.namespacesState.setFile('org.eclipse.esmf:1.0.0', fileWithMissingReferences);
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should be selectable and openable', () => {
      expect(component.hasMissingReferences(fileWithMissingReferences)).toBe(true);
      component.prepare('org.eclipse.esmf:1.0.0', fileWithMissingReferences);
      expect(component.isOpenable()).toBe(true);

      component.selectFile('org.eclipse.esmf:1.0.0', fileWithMissingReferences);
      expect(sidebarService.selection.selection()).toEqual({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'Consumer.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#Consumer',
      });

      component.promptOpenFile('org.eclipse.esmf:1.0.0', fileWithMissingReferences);
      expect(modelOpenerMock.promptAndOpen).toHaveBeenCalled();
    });

    it('should show a warning icon and list the missing namespaces in the tooltip', () => {
      const element: HTMLElement = fixture.nativeElement.querySelector('[data-testid="workspace-file-Consumer.ttl"]');
      expect(element.classList).toContain('unresolved');
      expect(element.classList).not.toContain('errored');
      expect(element.querySelector('.content mat-icon')?.textContent?.trim()).toBe('warning');

      const translate = vi.spyOn(TestBed.inject(LanguageTranslationService).translateService, 'translate');
      expect(component.getFileTooltip('org.eclipse.esmf:1.0.0', fileWithMissingReferences)).toContain('Consumer.ttl');
      expect(translate).toHaveBeenCalledWith('tooltips.fileWithMissingReferences', {namespaces: 'org.gone:1.0.0, org.lost:2.0.0'});
    });

    it('should keep files with errors blocked even if they also miss references', () => {
      fileWithMissingReferences.errored = true;

      expect(component.hasMissingReferences(fileWithMissingReferences)).toBe(false);
      component.prepare('org.eclipse.esmf:1.0.0', fileWithMissingReferences);
      expect(component.isOpenable()).toBe(false);
      expect(component.getFileTooltip('org.eclipse.esmf:1.0.0', fileWithMissingReferences)).not.toContain(
        'tooltips.fileWithMissingReferences',
      );
    });
  });

  it('should prompt open dialog via ModelOpenerService on promptOpenFile', () => {
    const file = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'File1.ttl');
    expect(file).toBeDefined();
    if (file) {
      component.promptOpenFile('org.eclipse.esmf:1.0.0', file);

      expect(modelOpenerMock.promptAndOpen).toHaveBeenCalledWith({
        file: 'File1.ttl',
        namespace: 'org.eclipse.esmf:1.0.0',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#File1',
      });
    }
  });

  it('should not prompt open dialog if file is current loaded file', () => {
    const currentFile = sidebarService.namespacesState.getFile('org.eclipse.esmf:1.0.0', 'Current.ttl');
    expect(currentFile).toBeDefined();
    if (currentFile) {
      component.promptOpenFile('org.eclipse.esmf:1.0.0', currentFile);
      expect(modelOpenerMock.promptAndOpen).not.toHaveBeenCalled();
    }
  });
  describe('link to the element list', () => {
    function row(name: string): HTMLElement {
      return fixture.nativeElement.querySelector(`[data-testid="workspace-file-${name}"]`);
    }

    function selectFile1(): void {
      row('File1.ttl').click();
      fixture.detectChanges();
    }

    it('should not mark any file as linked without selection', () => {
      sidebarService.fileElements.open();
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.selected--linked').length).toBe(0);
    });

    it('should mark the selected file as linked while its element list is open', () => {
      selectFile1();
      sidebarService.fileElements.open();
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(row('File1.ttl').classList).toContain('selected--linked');
      expect(row('Current.ttl').classList).not.toContain('selected--linked');
    });

    it('should remove the link when the element list is closed', () => {
      selectFile1();
      sidebarService.fileElements.open();
      TestBed.flushEffects();
      fixture.detectChanges();

      sidebarService.fileElements.close();
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(row('File1.ttl').classList).not.toContain('selected--linked');
      expect(row('File1.ttl').classList).not.toContain('selected');
    });
  });
});
