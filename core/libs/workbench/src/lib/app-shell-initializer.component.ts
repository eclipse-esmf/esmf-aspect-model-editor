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
import {BindingsService, BrowserService, CONFIGURATION_SERVICE, IPC_RENDERER, LanguageTranslationService, TitleService} from '@ame/shared';
import {Component, inject, Injector, OnInit, signal} from '@angular/core';
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
  private domainModelToRdf = inject(DomainModelToRdfService);
  private browserService = inject(BrowserService);
  private tauriTunnelService = inject(TauriTunnelService);
  private configurationService = inject(CONFIGURATION_SERVICE);
  private themeService = inject(ThemeService);
  private translate = inject(LanguageTranslationService);
  private searchStore = inject(SearchStore);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private startupService = inject(StartupService);
  private injector = inject(Injector);

  private readonly language = signal('en');
  public readonly title = 'Aspect Model Editor';

  constructor() {
    this.domainModelToRdf.listenForStoreUpdates();
    MaxGraphHelper.injector = this.injector;
  }

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
    this.themeService.applyTheme(settings?.darkMode ? 'dark' : 'light');

    if (window.location.search.includes('?e2e=true')) {
      return;
    }

    this.startupService.listenForLoading().pipe(take(1)).subscribe();
  }

  onDeleteKey(event: Event): void {
    const target = event.target as HTMLElement;
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
    const graph = this.maxgraphAttributeService.graph;
    const vertexCount = Object.values(graph.getDataModel().cells).filter(cell => cell.isVertex()).length > 0;

    if (vertexCount) this.searchStore.toggleElementsSearch();
  }

  openFilesElements(): void {
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
