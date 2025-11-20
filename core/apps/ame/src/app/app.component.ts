/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {MxGraphHelper, ThemeService} from '@ame/mx-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {BrowserService, ElectronTunnelService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {Component, HostListener, inject, Injector, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {take} from 'rxjs';

@Component({
  selector: 'ame-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  private titleService = inject(TitleService);
  private domainModelToRdf = inject(DomainModelToRdfService);
  private browserService = inject(BrowserService);
  private electronTunnelService = inject(ElectronTunnelService);
  private configurationService = inject(ConfigurationService);
  private themeService = inject(ThemeService);
  private translate = inject(LanguageTranslationService);
  private searchesStateService = inject(SearchesStateService);
  private startupService = inject(StartupService);
  private injector = inject(Injector);

  private language = 'en';
  public title = 'Aspect Model Editor';

  constructor() {
    this.domainModelToRdf.listenForStoreUpdates();
    MxGraphHelper.injector = this.injector;
  }

  ngOnInit(): void {
    this.language = this.getApplicationLanguage();
    this.translate.initTranslationService(this.language);

    this.electronTunnelService.subscribeMessages();
    this.titleService.setTitle(this.title);

    if (this.browserService.isStartedAsElectronApp() || !window.require) {
      //this.setMenuTranslation();
      this.setContextMenu();
    }

    this.themeService.setCssVars(this.configurationService.getSettings()?.useSaturatedColors ? '' : 'light');

    if (window.location.search.includes('?e2e=true')) {
      return;
    }

    this.startupService.listenForLoading().pipe(take(1)).subscribe();
  }

  @HostListener('window:keydown.control.f')
  openSearchElements(): void {
    this.searchesStateService.elementsSearch.toggle();
  }

  @HostListener('window:keydown.control.p')
  openFilesElements(): void {
    this.searchesStateService.filesSearch.toggle();
  }

  @HostListener('window:keydown.esc')
  closeSearchModals(): void {
    this.searchesStateService.filesSearch.close();
    this.searchesStateService.elementsSearch.close();
  }

  private getApplicationLanguage(): string {
    return localStorage.getItem('applicationLanguage') || this.translate.translateService.defaultLang;
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
    if (!window.require) return;
    const {Menu} = window.require('@electron/remote');
    const {shell} = window.require('electron');

    window.addEventListener('contextmenu', e => {
      e.preventDefault();
      const target = e.target as HTMLAnchorElement;
      if (this.isGraphElement(target)) {
        return;
      }

      const template: any = [
        ...(target.tagName.toLowerCase() === 'a'
          ? [
              {
                label: target.href.startsWith('mailto:') ? 'Send email' : 'Open in browser',
                click: () => {
                  shell.openExternal((e.target as HTMLAnchorElement).href);
                },
              },
            ]
          : []),
        ...(target.tagName.toLowerCase() === 'a'
          ? [
              {
                label: 'Copy link address',
                click: () => {
                  navigator.clipboard.writeText(target.href);
                },
              },
            ]
          : []),
      ];

      if (template?.length) {
        const menu = Menu.buildFromTemplate(template);
        menu.popup();
      }
    });
  }

  setMenuTranslation(): void {
    this.electronTunnelService.sendTranslationsToElectron(this.translate.translateService.currentLang);
  }
}
