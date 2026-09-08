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
import {Component, inject, Injector, OnInit, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RouterOutlet} from '@angular/router';
import {take} from 'rxjs';

@Component({
  selector: 'ame-root',
  host: {
    '(window:keydown.control.f)': 'openSearchElements()',
    '(window:keydown.control.p)': 'openFilesElements()',
    '(window:keydown.escape)': 'closeSearchModals()',
  },
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  private ipcRenderer = inject(IPC_RENDERER);
  private titleService = inject(TitleService);
  private domainModelToRdf = inject(DomainModelToRdfService);
  private browserService = inject(BrowserService);
  private electronTunnelService = inject(ElectronTunnelService);
  private configurationService = inject(ConfigurationService);
  private themeService = inject(ThemeService);
  private translate = inject(LanguageTranslationService);
  private searchesStateService = inject(SearchesStateService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private startupService = inject(StartupService);
  private injector = inject(Injector);

  private readonly language = signal('en');
  public readonly title = 'Aspect Model Editor';
  public readonly currentLanguage = toSignal(this.translate.translateService.langChanges$, {
    initialValue: this.translate.translateService.getActiveLang(),
  });

  constructor() {
    this.domainModelToRdf.listenForStoreUpdates();
    MaxGraphHelper.injector = this.injector;
  }

  ngOnInit(): void {
    this.language.set(this.getApplicationLanguage());
    this.translate.initTranslationService(this.language());

    this.electronTunnelService.subscribeMessages();
    this.titleService.setTitle(this.title);

    if (this.browserService.isStartedAsElectronApp()) {
      this.electronTunnelService.sendTranslationsToElectron(this.currentLanguage());
      this.setContextMenu();
    }

    const settings = this.configurationService.getSettings();
    this.themeService.applyTheme(settings?.darkMode ? 'dark' : 'light');

    if (window.location.search.includes('?e2e=true')) {
      return;
    }

    this.startupService.listenForLoading().pipe(take(1)).subscribe();
  }

  openSearchElements(): void {
    const graph = this.maxgraphAttributeService.graph;
    const vertexCount = Object.values(graph.getDataModel().cells).filter(cell => cell.isVertex()).length > 0;

    if (vertexCount) this.searchesStateService.elementsSearch.toggle();
  }

  openFilesElements(): void {
    this.searchesStateService.filesSearch.toggle();
  }

  closeSearchModals(): void {
    this.searchesStateService.filesSearch.close();
    this.searchesStateService.elementsSearch.close();
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
