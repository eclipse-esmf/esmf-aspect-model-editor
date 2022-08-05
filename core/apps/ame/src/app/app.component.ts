/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import {first, switchMap} from 'rxjs/operators';
import {DomainModelToRdfService} from '@ame/aspect-exporter';
import {BrowserService, ElectronTunnelService, LogService, NotificationsService} from '@ame/shared';
import {EditorService} from '@ame/editor';
import {ModelApiService} from '@ame/api';
import {MatDialog} from '@angular/material/dialog';
import {StartLoadModalComponent} from './components/start-load-modal/start-load-modal.component';
import {ConfigurationService} from '@ame/settings-dialog';
import {ThemeService} from '@ame/mx-graph';

@Component({
  selector: 'ame-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Aspect Model Editor';

  constructor(
    private titleService: Title,
    private editorService: EditorService,
    private modelApiService: ModelApiService,
    private loggerService: LogService,
    private notificationsService: NotificationsService,
    private domainModelToRdf: DomainModelToRdfService,
    private dialogService: MatDialog,
    private browserService: BrowserService,
    private electronTunnelService: ElectronTunnelService,
    private configurationService: ConfigurationService,
    private themeService: ThemeService
  ) {
    this.domainModelToRdf.listenForStoreUpdates();
  }

  ngOnInit() {
    this.electronTunnelService.subscribeMessages();
    this.titleService.setTitle(this.title);
    this.setContextMenu();
    this.themeService.setCssVars(this.configurationService.getSettings()?.useSaturatedColors ? 'dark' : 'light');

    if (!window.location.search.includes('e2e=true')) {
      this.modelApiService
        .loadLatest()
        .pipe(first())
        .subscribe({
          next: aspectModel => {
            if (aspectModel.length > 0) {
              this.onLoadAutoSavedModel(aspectModel);
            }
          },
          error: error => {
            if (error.status === 400) {
              this.loggerService.logError(`Error during load auto saved model (${JSON.stringify(error)})`);
            } else if (error.status === 404) {
              this.loggerService.logInfo('Default aspect was loaded');
              this.loadNewAspectModel(
                this.modelApiService.getDefaultAspectModel(),
                () => {
                  this.notificationsService.info('Default model was loaded', null, null, 5000);
                },
                true
              );
            }
          },
        });
    }
  }

  private isGraphElement(target: HTMLElement) {
    let element = target;
    while (element.parentElement !== document.body) {
      if (element.id === 'graph') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  setContextMenu() {
    if (!this.browserService.isStartedAsElectronApp() || !window.require) {
      return;
    }

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

      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  }

  onLoadAutoSavedModel(aspectModel: string) {
    this.dialogService.open(StartLoadModalComponent, {disableClose: true, data: {aspectModel}});
  }

  private loadNewAspectModel(aspectModel: Observable<string>, callback: () => any, isDefault?: boolean) {
    aspectModel
      .pipe(
        switchMap(model => this.editorService.loadNewAspectModel(model, isDefault)),
        first()
      )
      .subscribe(callback);
  }
}
