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

import {InformationHandlingService} from '@ame/editor';
import {ThemeService} from '@ame/max-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {BehaviorSubject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SidebarStateService} from '../sidebar-state.service';
import {SidebarMenuComponent} from './sidebar-menu.component';

describe('SidebarMenuComponent', () => {
  let component: SidebarMenuComponent;
  let fixture: ComponentFixture<SidebarMenuComponent>;
  let informationServiceMock: {
    openSettingsDialog: ReturnType<typeof vi.fn>;
    openHelpDialog: ReturnType<typeof vi.fn>;
    openNotificationDialog: ReturnType<typeof vi.fn>;
  };
  let notificationsServiceMock: {
    badgeText: BehaviorSubject<string | null>;
  };
  let configurationServiceMock: {
    getSettings: ReturnType<typeof vi.fn>;
    setSettings: ReturnType<typeof vi.fn>;
  };
  let themeServiceMock: {
    currentTheme: string;
    applyTheme: ReturnType<typeof vi.fn>;
  };
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    informationServiceMock = {
      openSettingsDialog: vi.fn(),
      openHelpDialog: vi.fn(),
      openNotificationDialog: vi.fn(),
    };

    notificationsServiceMock = {
      badgeText: new BehaviorSubject<string | null>('2'),
    };

    configurationServiceMock = {
      getSettings: vi.fn(() => ({darkMode: false})),
      setSettings: vi.fn(),
    };

    themeServiceMock = {
      currentTheme: 'light',
      applyTheme: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        SidebarMenuComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        SidebarStateService,
        {provide: InformationHandlingService, useValue: informationServiceMock},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {provide: ConfigurationService, useValue: configurationServiceMock},
        {provide: ThemeService, useValue: themeServiceMock},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
    fixture = TestBed.createComponent(SidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dark mode and apply theme', () => {
    expect(component.isDarkMode).toBe(false);

    component.toggleDarkMode();

    expect(configurationServiceMock.setSettings).toHaveBeenCalledWith(expect.objectContaining({darkMode: true}));
    expect(themeServiceMock.applyTheme).toHaveBeenCalledWith('dark');
  });

  it('should delegate opening dialogs to InformationHandlingService', () => {
    component.openSettingsDialog();
    expect(informationServiceMock.openSettingsDialog).toHaveBeenCalledTimes(1);

    component.openHelpDialog();
    expect(informationServiceMock.openHelpDialog).toHaveBeenCalledTimes(1);

    component.openNotificationDialog();
    expect(informationServiceMock.openNotificationDialog).toHaveBeenCalledTimes(1);
  });

  it('should toggle sidebar items via SidebarStateService', () => {
    expect(sidebarService.workspace.isOpened()).toBe(false);
    sidebarService.workspace.toggle();
    expect(sidebarService.workspace.isOpened()).toBe(true);

    expect(sidebarService.sammElements.isOpened()).toBe(false);
    sidebarService.sammElements.toggle();
    expect(sidebarService.sammElements.isOpened()).toBe(true);
  });
});
