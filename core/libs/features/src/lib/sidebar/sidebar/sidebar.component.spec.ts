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

import {LoadedFilesService} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {
  CONFIGURATION_SERVICE,
  DRAGGABLE_SERVICE,
  EDITOR_THEME_SERVICE,
  INFORMATION_HANDLING_SERVICE,
  MODEL_CHECKER_SERVICE,
  NotificationsService,
  TauriSignalsService,
} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {EMPTY} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SidebarStateService} from '../sidebar-state.service';
import {SidebarComponent} from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        SidebarStateService,
        {
          provide: INFORMATION_HANDLING_SERVICE,
          useValue: {openSettingsDialog: vi.fn(), openHelpDialog: vi.fn(), openNotificationDialog: vi.fn()},
        },
        {provide: NotificationsService, useValue: {badgeText: EMPTY, info: vi.fn(), error: vi.fn()}},
        {provide: MaxGraphService, useValue: {getAllCells: () => []}},
        {provide: LoadedFilesService, useValue: {hasAspect: signal(false), currentLoadedFile: null, getFile: () => null}},
        {provide: DRAGGABLE_SERVICE, useValue: {makeDraggable: vi.fn()}},
        {provide: MODEL_CHECKER_SERVICE, useValue: {detectWorkspaceErrors: () => EMPTY}},
        {provide: TauriSignalsService, useValue: {call: vi.fn()}},
        {provide: CONFIGURATION_SERVICE, useValue: {getSettings: vi.fn(() => ({})), setSettings: vi.fn()}},
        {provide: EDITOR_THEME_SERVICE, useValue: {currentTheme: 'light', applyTheme: vi.fn()}},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
  });

  it('should create when there is no initial selection', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should trigger detectChanges via animation frame on init when selection is present', async () => {
    sidebarService.selection.selection.set({
      namespace: 'org.eclipse.esmf:1.0.0',
      file: 'Aspect.ttl',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#Aspect',
    });

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(component).toBeTruthy();
  });
});
