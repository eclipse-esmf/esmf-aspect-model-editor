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

import {ConfigurationService, GraphNavigatorPort, SearchStore, UiShellStore} from '@ame/domain';
import {BackendStatusService, BindingsService, BrowserService, IPC_RENDERER, LanguageTranslationService, TitleService} from '@ame/shared';
import {Component, inject, OnInit, signal} from '@angular/core';
import {take} from 'rxjs';
import {StartupService} from './startup.service';
import {TauriTunnelService} from './tauri-tunnel.service';

@Component({
  selector: 'ame-app-shell',
  host: {
    '(window:keydown.control.f)': 'openSearchElements()',
    '(window:keydown.control.p)': 'openFilesElements()',
    '(window:keydown.escape)': 'closeSearchModals()',
    '(window:keydown.backspace)': 'onDeleteKey($event)',
    '(window:keydown.delete)': 'onDeleteKey($event)',
    '(window:keydown.f5)': '$event.preventDefault()',
    '(window:keydown.control.r)': '$event.preventDefault()',
    '(window:keydown.meta.r)': '$event.preventDefault()',
    '(document:submit)': '$event.preventDefault()',
  },
  template: ``,
})
export class AppShellInitializer implements OnInit {
  private ipcRenderer = inject(IPC_RENDERER);
  private titleService = inject(TitleService);
  private bindingsService = inject(BindingsService);
  private browserService = inject(BrowserService);
  private tauriTunnelService = inject(TauriTunnelService);
  private configurationService = inject(ConfigurationService);
  private uiShellStore = inject(UiShellStore);
  private translate = inject(LanguageTranslationService);
  private searchStore = inject(SearchStore);
  private graphNavigator = inject(GraphNavigatorPort);
  private startupService = inject(StartupService);
  private backendStatus = inject(BackendStatusService);

  private readonly language = signal('en');
  public readonly title = 'Aspect Model Editor';

  ngOnInit(): void {
    this.language.set(this.getApplicationLanguage());
    this.translate.initTranslationService(this.language());

    this.tauriTunnelService.subscribeMessages();
    this.titleService.setTitle(this.title);

    if (this.browserService.isStartedAsTauriApp()) {
      const currentLanguage = this.translate.translateService.getActiveLang();
      this.tauriTunnelService.sendTranslationsToTauri(currentLanguage);
      this.setContextMenu();
    }

    const settings = this.configurationService.getSettings();
    this.uiShellStore.setDarkMode(!!settings?.darkMode);

    if (window.location.search.includes('?e2e=true')) {
      return;
    }

    this.startupService.listenForLoading().pipe(take(1)).subscribe();
  }

  onDeleteKey(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.backendStatus.isReady()) {
      event.preventDefault();
      return;
    }
    const isEditable =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable ||
      target?.getAttribute('contenteditable') === 'true';

    if (!isEditable) {
      event.preventDefault();
      this.bindingsService.fireAction('deleteElement');
    }
  }

  openSearchElements(): void {
    if (!this.backendStatus.isReady()) return;
    if (this.graphNavigator.hasElements()) this.searchStore.toggleElementsSearch();
  }

  openFilesElements(): void {
    if (!this.backendStatus.isReady()) return;
    this.searchStore.toggleFilesSearch();
  }

  closeSearchModals(): void {
    this.searchStore.closeFilesSearch();
    this.searchStore.closeElementsSearch();
  }

  private getApplicationLanguage(): string {
    return localStorage.getItem('applicationLanguage') || this.translate.translateService.getDefaultLang();
  }

  private isGraphElement(target: HTMLElement): boolean {
    let element = target;
    while (element.parentElement !== document.body) {
      if (element.id === 'graph') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  setContextMenu(): void {
    window.addEventListener('contextmenu', e => {
      e.preventDefault();

      const target = e.target as HTMLElement;

      if (this.isGraphElement(target)) return;

      const anchor = target?.closest ? target.closest('a') : null;
      const rawHref = anchor?.getAttribute('href') ?? (typeof (target as any)?.href === 'string' ? (target as any).href : null);
      const href = typeof rawHref === 'string' ? rawHref : null;

      this.ipcRenderer.showContextMenu({
        href,
      });
    });
  }
}
