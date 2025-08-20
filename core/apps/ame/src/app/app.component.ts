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

import {DomainModelToRdfService} from '@ame/aspect-exporter';
import {FileHandlingService} from '@ame/editor';
import {MigratorService} from '@ame/migrator';
import {MxGraphHelper, ThemeService} from '@ame/mx-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {BrowserService, ElectronTunnelService, TitleService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {Component, HostListener, Injector, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {StartupService} from './startup.service';

@Component({
  selector: 'ame-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  private language = 'en';
  public title = 'Aspect Model Editor';

  constructor(
    private titleService: TitleService,
    private domainModelToRdf: DomainModelToRdfService,
    private browserService: BrowserService,
    private electronTunnelService: ElectronTunnelService,
    private configurationService: ConfigurationService,
    private themeService: ThemeService,
    private startupService: StartupService,
    private migratorService: MigratorService,
    private sidebarService: SidebarStateService,
    private fileHandlingService: FileHandlingService,
    private translate: LanguageTranslationService,
    private searchesStateService: SearchesStateService,
    private router: Router,
    private injector: Injector,
  ) {
    this.domainModelToRdf.listenForStoreUpdates();
    MxGraphHelper.injector = this.injector;
  }

  ngOnInit(): void {
    this.language = this.getApplicationLanguage();
    this.translate.initTranslationService(this.language);

    this.electronTunnelService.subscribeMessages();
    this.titleService.setTitle(this.title);

    if (this.browserService.isStartedAsElectronApp() || !window.require) {
      this.setMenuTranslation();
      this.setContextMenu();
    }

    this.themeService.setCssVars(this.configurationService.getSettings()?.useSaturatedColors ? 'dark' : 'light');

    if (window.location.search.includes('?e2e=true')) {
      return;
    }

    // TODO: In case of no service opened, display a error page
    if (!this.electronTunnelService.ipcRenderer) {
      this.migratorService.startMigrating().subscribe(() => {
        this.fileHandlingService.createEmptyModel();
        this.sidebarService.workspace.refresh();
        this.router.navigate([{outlets: {migrator: null, 'export-namespaces': null, 'import-namespaces': null}}]);
      });
    } else {
      this.startupService.listenForLoading();
    }
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
