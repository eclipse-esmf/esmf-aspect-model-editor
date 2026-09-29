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

import {SearchStore} from '@ame/domain';
import {MaxGraphAttributeService, MaxGraphHelper, ThemeService} from '@ame/graph';
import {DomainModelToRdfService} from '@ame/infrastructure';
import {BrowserService, CONFIGURATION_SERVICE, IPC_RENDERER, LanguageTranslationService, TitleService} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppShellInitializer} from './app-shell-initializer.component';
import {StartupService} from './startup.service';
import {TauriTunnelService} from './tauri-tunnel.service';

describe('AppShellInitializer', () => {
  let component: AppShellInitializer;
  let fixture: ComponentFixture<AppShellInitializer>;

  let ipcRenderer: {showContextMenu: ReturnType<typeof vi.fn>};
  let titleService: {setTitle: ReturnType<typeof vi.fn>};
  let domainModelToRdf: {listenForStoreUpdates: ReturnType<typeof vi.fn>};
  let browserService: {isStartedAsTauriApp: ReturnType<typeof vi.fn>};
  let tauriTunnelService: {subscribeMessages: ReturnType<typeof vi.fn>; sendTranslationsToTauri: ReturnType<typeof vi.fn>};
  let configurationService: {getSettings: ReturnType<typeof vi.fn>};
  let themeService: {applyTheme: ReturnType<typeof vi.fn>; setCssVars: ReturnType<typeof vi.fn>};
  let langChanges$: BehaviorSubject<string>;
  let translate: {
    translateService: {
      getActiveLang: ReturnType<typeof vi.fn>;
      getDefaultLang: ReturnType<typeof vi.fn>;
      langChanges$: BehaviorSubject<string>;
    };
    initTranslationService: ReturnType<typeof vi.fn>;
  };
  let searchStore: {
    toggleElementsSearch: ReturnType<typeof vi.fn>;
    closeElementsSearch: ReturnType<typeof vi.fn>;
    toggleFilesSearch: ReturnType<typeof vi.fn>;
    closeFilesSearch: ReturnType<typeof vi.fn>;
  };
  let maxgraphAttributeService: {graph: any};
  let startupService: {listenForLoading: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    localStorage.clear();

    ipcRenderer = {showContextMenu: vi.fn()};
    titleService = {setTitle: vi.fn()};
    domainModelToRdf = {listenForStoreUpdates: vi.fn()};
    browserService = {isStartedAsTauriApp: vi.fn(() => false)};
    tauriTunnelService = {subscribeMessages: vi.fn(), sendTranslationsToTauri: vi.fn()};
    configurationService = {getSettings: vi.fn(() => ({darkMode: false}))};
    themeService = {applyTheme: vi.fn(), setCssVars: vi.fn()};
    langChanges$ = new BehaviorSubject('en');
    translate = {
      translateService: {
        getActiveLang: vi.fn(() => 'en'),
        getDefaultLang: vi.fn(() => 'en'),
        langChanges$,
      },
      initTranslationService: vi.fn(),
    };
    searchStore = {
      toggleElementsSearch: vi.fn(),
      closeElementsSearch: vi.fn(),
      toggleFilesSearch: vi.fn(),
      closeFilesSearch: vi.fn(),
    };
    maxgraphAttributeService = {graph: {getDataModel: () => ({cells: {}})}};
    startupService = {listenForLoading: vi.fn(() => of(true))};

    TestBed.configureTestingModule({
      imports: [AppShellInitializer],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {provide: IPC_RENDERER, useValue: ipcRenderer},
        {provide: TitleService, useValue: titleService},
        {provide: DomainModelToRdfService, useValue: domainModelToRdf},
        {provide: BrowserService, useValue: browserService},
        {provide: TauriTunnelService, useValue: tauriTunnelService},
        {provide: CONFIGURATION_SERVICE, useValue: configurationService},
        {provide: ThemeService, useValue: themeService},
        {provide: LanguageTranslationService, useValue: translate},
        {provide: SearchStore, useValue: searchStore},
        {provide: MaxGraphAttributeService, useValue: maxgraphAttributeService},
        {provide: StartupService, useValue: startupService},
      ],
    });

    fixture = TestBed.createComponent(AppShellInitializer);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the MaxGraphHelper injector on construction', () => {
    expect(MaxGraphHelper.injector).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the translation service with the stored/default application language', () => {
      fixture.detectChanges();

      expect(translate.initTranslationService).toHaveBeenCalledWith('en');
    });

    it('should use the language stored in localStorage when present', () => {
      localStorage.setItem('applicationLanguage', 'zh');

      fixture.detectChanges();

      expect(translate.initTranslationService).toHaveBeenCalledWith('zh');
    });

    it('should subscribe to tauri messages and set the title', () => {
      fixture.detectChanges();

      expect(tauriTunnelService.subscribeMessages).toHaveBeenCalled();
      expect(titleService.setTitle).toHaveBeenCalledWith(component.title);
    });

    it('should send translations to tauri and set the context menu when started as an tauri app', () => {
      browserService.isStartedAsTauriApp.mockReturnValue(true);

      fixture.detectChanges();

      expect(tauriTunnelService.sendTranslationsToTauri).toHaveBeenCalledWith('en');
    });

    it('should not send translations to tauri when not started as an tauri app', () => {
      fixture.detectChanges();

      expect(tauriTunnelService.sendTranslationsToTauri).not.toHaveBeenCalled();
    });

    it('should apply the light theme when dark mode is disabled', () => {
      configurationService.getSettings.mockReturnValue({darkMode: false});

      fixture.detectChanges();

      expect(themeService.applyTheme).toHaveBeenCalledWith('light');
    });

    it('should apply the dark theme when dark mode is enabled', () => {
      configurationService.getSettings.mockReturnValue({darkMode: true});

      fixture.detectChanges();

      expect(themeService.applyTheme).toHaveBeenCalledWith('dark');
    });

    it('should listen for loading unless running under e2e', () => {
      fixture.detectChanges();

      expect(startupService.listenForLoading).toHaveBeenCalled();
    });
  });

  describe('search modals', () => {
    it('should toggle the elements search when the graph has vertices', () => {
      maxgraphAttributeService.graph = {
        getDataModel: () => ({
          cells: {a: {isVertex: () => true}},
        }),
      };

      component.openSearchElements();

      expect(searchStore.toggleElementsSearch).toHaveBeenCalled();
    });

    it('should not toggle the elements search when the graph is empty', () => {
      maxgraphAttributeService.graph = {
        getDataModel: () => ({cells: {}}),
      };

      component.openSearchElements();

      expect(searchStore.toggleElementsSearch).not.toHaveBeenCalled();
    });

    it('should toggle the files search', () => {
      component.openFilesElements();

      expect(searchStore.toggleFilesSearch).toHaveBeenCalled();
    });

    it('should close both search modals', () => {
      component.closeSearchModals();

      expect(searchStore.closeFilesSearch).toHaveBeenCalled();
      expect(searchStore.closeElementsSearch).toHaveBeenCalled();
    });
  });

  describe('setContextMenu', () => {
    it('should register a contextmenu listener that forwards the href to the ipc renderer', () => {
      component.setContextMenu();

      const anchor = document.createElement('a');
      anchor.href = 'https://example.com/';
      document.body.appendChild(anchor);

      const event = new MouseEvent('contextmenu', {bubbles: true, cancelable: true});
      Object.defineProperty(event, 'target', {value: anchor});
      anchor.dispatchEvent(event);

      expect(ipcRenderer.showContextMenu).toHaveBeenCalledWith({href: 'https://example.com/'});

      document.body.removeChild(anchor);
    });
  });
});
