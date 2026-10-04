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

import {ModelCheckerPort, WorkspaceFacade} from '@ame/domain';
import {BrowserService, IPC_RENDERER, LanguageTranslationService, NotificationsService, TauriSignalsService} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FileStatus, SidebarStateService} from '../sidebar-state.service';
import {WorkspaceComponent} from './workspace.component';

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;
  let modelCheckerMock: {
    detectWorkspaceErrors: ReturnType<typeof vi.fn>;
  };
  let modelApiServiceMock: {
    getStoragePath: ReturnType<typeof vi.fn>;
    importNamespaces: ReturnType<typeof vi.fn>;
  };
  let notificationsServiceMock: {
    info: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    clearNotifications: ReturnType<typeof vi.fn>;
  };
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    vi.useFakeTimers();

    modelCheckerMock = {
      detectWorkspaceErrors: vi.fn(() => of([])),
    };
    modelApiServiceMock = {
      getStoragePath: vi.fn(() => of({path: '/workspace', storagePath: '/workspace'})),
      importNamespaces: vi.fn(() => of(undefined)),
    };
    notificationsServiceMock = {
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      clearNotifications: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        WorkspaceComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        SidebarStateService,
        {provide: ModelCheckerPort, useValue: modelCheckerMock},
        {provide: WorkspaceFacade, useValue: modelApiServiceMock},
        {provide: TauriSignalsService, useValue: {call: vi.fn()}},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {notificationService: {}, confirmDialog: {}},
            translateService: {translate: (k: string) => k},
          },
        },
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should detect workspace errors on workspace refresh trigger', () => {
    const file = new FileStatus('Test.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Test';
    modelCheckerMock.detectWorkspaceErrors.mockReturnValue(of([file]));

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sidebarService.workspace.refresh();
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(modelCheckerMock.detectWorkspaceErrors).toHaveBeenCalled();
    expect(component.namespacesKeys).toContain('org.eclipse.esmf:1.0.0');
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should handle detectWorkspaceErrors failure gracefully', () => {
    modelCheckerMock.detectWorkspaceErrors.mockReturnValue(
      throwError(() => ({
        error: {
          error: {
            code: 500,
            message: 'Model error occurred',
            path: '/path/to/models',
          },
        },
      })),
    );

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sidebarService.workspace.refresh();
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(component.error()).toEqual({
      code: 500,
      message: 'Model error occurred',
      path: '/path/to/models',
    });
    expect(component.loading()).toBe(false);
  });

  it('should clear namespaces and trigger refresh on refreshWorkspace', () => {
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const clearSpy = vi.spyOn(sidebarService.namespacesState, 'clear');
    const refreshSpy = vi.spyOn(sidebarService.workspace, 'refresh');

    component.refreshWorkspace();

    expect(clearSpy).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should copy storagePath to clipboard using ipcRenderer when in tauri app', () => {
    const copyToClipboardMock = vi.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        WorkspaceComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        SidebarStateService,
        {provide: ModelCheckerPort, useValue: modelCheckerMock},
        {provide: WorkspaceFacade, useValue: modelApiServiceMock},
        {provide: TauriSignalsService, useValue: {call: vi.fn()}},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {
          provide: BrowserService,
          useValue: {isStartedAsTauriApp: () => true, getAssetBasePath: () => './assets'},
        },
        {
          provide: IPC_RENDERER,
          useValue: {copyToClipboard: copyToClipboardMock},
        },
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {notificationService: {}, confirmDialog: {}},
            translateService: {translate: (k: string) => k},
          },
        },
      ],
    });

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.copyWorkspacePath();

    expect(modelApiServiceMock.getStoragePath).toHaveBeenCalled();
    expect(copyToClipboardMock).toHaveBeenCalledWith('/workspace');
    expect(notificationsServiceMock.success).toHaveBeenCalledWith({
      title: 'sidebar.workspace.copiedWorkspacePath',
      message: '/workspace',
    });
  });

  it('should copy storagePath to clipboard when copyWorkspacePath is called', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {clipboard: {writeText: writeTextMock}});
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);

    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.copyWorkspacePath();

    expect(modelApiServiceMock.getStoragePath).toHaveBeenCalled();
    expect(writeTextMock).toHaveBeenCalledWith('/workspace');
    expect(notificationsServiceMock.success).toHaveBeenCalledWith({
      title: 'sidebar.workspace.copiedWorkspacePath',
      message: '/workspace',
    });
  });

  describe('resize gutter', () => {
    afterEach(() => localStorage.removeItem('ame.sidebar.workspace.width'));

    it('renders the shared resize gutter on the end edge with the panel limits', () => {
      fixture = TestBed.createComponent(WorkspaceComponent);
      fixture.detectChanges();
      const gutter = fixture.nativeElement.querySelector('[data-testid="workspace-resize-gutter"]') as HTMLElement;
      expect(gutter).not.toBeNull();
      expect(gutter.tagName.toLowerCase()).toBe('ame-resize-gutter');
      expect(gutter.classList).toContain('resize-gutter--end');
      expect(gutter.getAttribute('role')).toBe('separator');
      expect(gutter.getAttribute('aria-valuemin')).toBe('280');
      expect(gutter.getAttribute('aria-valuemax')).toBe('900');
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('450px');
    });

    it('restores the persisted width onto the panel', () => {
      localStorage.setItem('ame.sidebar.workspace.width', '520');
      fixture = TestBed.createComponent(WorkspaceComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('520px');
    });

    it('clamps a persisted width below the minimum', () => {
      localStorage.setItem('ame.sidebar.workspace.width', '10');
      fixture = TestBed.createComponent(WorkspaceComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('280px');
    });
  });
});
