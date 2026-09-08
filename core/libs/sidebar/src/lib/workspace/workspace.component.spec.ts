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

import {ConfirmDialogService, FileHandlingService, ModelCheckerService, ModelSaverService} from '@ame/editor';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ElectronSignalsService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
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
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    vi.useFakeTimers();

    modelCheckerMock = {
      detectWorkspaceErrors: vi.fn(() => of([])),
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
        {provide: ModelCheckerService, useValue: modelCheckerMock},
        {provide: ElectronSignalsService, useValue: {call: vi.fn()}},
        {provide: NotificationsService, useValue: {info: vi.fn(), error: vi.fn(), clearNotifications: vi.fn()}},
        {provide: ConfirmDialogService, useValue: {open: vi.fn()}},
        {provide: ModelSaverService, useValue: {saveModel: vi.fn()}},
        {provide: FileHandlingService, useValue: {loadNamespaceFile: vi.fn()}},
        {provide: NamespacesManagerService, useValue: {importNamespaces: vi.fn(() => of(undefined))}},
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
});
