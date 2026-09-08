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

import {StartupService} from '@ame/app/startup.service';
import {DomainModelToRdfService} from '@ame/aspect-exporter';
import {MaxGraphAttributeService, MaxGraphHelper, ThemeService} from '@ame/max-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {BrowserService, ElectronTunnelService, IPC_RENDERER, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let ipcRenderer: {showContextMenu: ReturnType<typeof vi.fn>};
  let titleService: {setTitle: ReturnType<typeof vi.fn>};
  let domainModelToRdf: {listenForStoreUpdates: ReturnType<typeof vi.fn>};
  let browserService: {isStartedAsElectronApp: ReturnType<typeof vi.fn>};
  let electronTunnelService: {subscribeMessages: ReturnType<typeof vi.fn>; sendTranslationsToElectron: ReturnType<typeof vi.fn>};
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
  let searchesStateService: {
    elementsSearch: {toggle: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>};
    filesSearch: {toggle: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>};
  };
  let maxgraphAttributeService: {graph: any};
  let startupService: {listenForLoading: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    localStorage.clear();

    ipcRenderer = {showContextMenu: vi.fn()};
    titleService = {setTitle: vi.fn()};
    domainModelToRdf = {listenForStoreUpdates: vi.fn()};
    browserService = {isStartedAsElectronApp: vi.fn(() => false)};
    electronTunnelService = {subscribeMessages: vi.fn(), sendTranslationsToElectron: vi.fn()};
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
    searchesStateService = {
      elementsSearch: {toggle: vi.fn(), close: vi.fn()},
      filesSearch: {toggle: vi.fn(), close: vi.fn()},
    };
    maxgraphAttributeService = {graph: {getDataModel: () => ({cells: {}})}};
    startupService = {listenForLoading: vi.fn(() => of(true))};

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {provide: IPC_RENDERER, useValue: ipcRenderer},
        {provide: TitleService, useValue: titleService},
        {provide: DomainModelToRdfService, useValue: domainModelToRdf},
        {provide: BrowserService, useValue: browserService},
        {provide: ElectronTunnelService, useValue: electronTunnelService},
        {provide: ConfigurationService, useValue: configurationService},
        {provide: ThemeService, useValue: themeService},
        {provide: LanguageTranslationService, useValue: translate},
        {provide: SearchesStateService, useValue: searchesStateService},
        {provide: MaxGraphAttributeService, useValue: maxgraphAttributeService},
        {provide: StartupService, useValue: startupService},
      ],
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the MaxGraphHelper injector on construction', () => {
    expect(MaxGraphHelper.injector).toBeTruthy();
  });

  it('should expose the current language as a signal driven by langChanges$', () => {
    expect(component.currentLanguage()).toBe('en');

    langChanges$.next('zh');

    expect(component.currentLanguage()).toBe('zh');
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

    it('should subscribe to electron messages and set the title', () => {
      fixture.detectChanges();

      expect(electronTunnelService.subscribeMessages).toHaveBeenCalled();
      expect(titleService.setTitle).toHaveBeenCalledWith(component.title);
    });

    it('should send translations to electron and set the context menu when started as an electron app', () => {
      browserService.isStartedAsElectronApp.mockReturnValue(true);

      fixture.detectChanges();

      expect(electronTunnelService.sendTranslationsToElectron).toHaveBeenCalledWith('en');
    });

    it('should not send translations to electron when not started as an electron app', () => {
      fixture.detectChanges();

      expect(electronTunnelService.sendTranslationsToElectron).not.toHaveBeenCalled();
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

      expect(searchesStateService.elementsSearch.toggle).toHaveBeenCalled();
    });

    it('should not toggle the elements search when the graph is empty', () => {
      maxgraphAttributeService.graph = {
        getDataModel: () => ({cells: {}}),
      };

      component.openSearchElements();

      expect(searchesStateService.elementsSearch.toggle).not.toHaveBeenCalled();
    });

    it('should toggle the files search', () => {
      component.openFilesElements();

      expect(searchesStateService.filesSearch.toggle).toHaveBeenCalled();
    });

    it('should close both search modals', () => {
      component.closeSearchModals();

      expect(searchesStateService.filesSearch.close).toHaveBeenCalled();
      expect(searchesStateService.elementsSearch.close).toHaveBeenCalled();
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
