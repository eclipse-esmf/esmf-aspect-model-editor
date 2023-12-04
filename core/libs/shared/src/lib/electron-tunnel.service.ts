/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, NgZone, inject} from '@angular/core';
import {IpcRenderer} from 'electron';
import {BehaviorSubject, Observable, catchError, of, switchMap} from 'rxjs';
import {StartupData, StartupPayload} from './model';
import {NotificationsService} from './notifications.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {SaveModelDialogService, ShapeSettingsService} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {NamespacesCacheService} from '@ame/cache';
import {BaseMetaModelElement} from '@ame/meta-model';
import {SidebarService} from './sidebar.service';
import {ElectronSignals, ElectronSignalsService} from './electron-signals.service';

export enum ElectronEvents {
  REQUEST_CREATE_WINDOW = 'REQUEST_CREATE_WINDOW',
  RESPONSE_CREATE_WINDOW = 'RESPONSE_CREATE_WINDOW',

  // Is first window events
  REQUEST_IS_FIRST_WINDOW = 'REQUEST_IS_FIRST_WINDOW',
  RESPONSE_IS_FIRST_WINDOW = 'RESPONSE_IS_FIRST_WINDOW',

  // Has backend error events
  REQUEST_BACKEND_STARTUP_ERROR = 'REQUEST_BACKEND_STARTUP_ERROR',
  RESPONSE_BACKEND_STARTUP_ERROR = 'RESPONSE_BACKEND_STARTUP_ERROR',

  // Startup data events
  REQUEST_STARTUP_DATA = 'REQUEST_STARTUP_DATA',
  RESPONSE_STARTUP_DATA = 'RESPONSE_STARTUP_DATA',
  REQUEST_UPDATE_DATA = 'REQUEST_UPDATE_DATA',

  // Maximize window events
  REQUEST_MAXIMIZE_WINDOW = 'REQUEST_MAXIMIZE_WINDOW',
  RESPONSE_MAXIMIZE_WINDOW = 'RESPONSE_MAXIMIZE_WINDOW',

  // On window close events
  REQUEST_IS_FILE_SAVED = 'REQUEST_IS_FILE_SAVED',
  REQUEST_CLOSE_WINDOW = 'REQUEST_CLOSE_WINDOW',

  // Notifications requests
  REQUEST_SHOW_NOTIFICATION = 'REQUEST_SHOW_NOTIFICATION',

  // Highlight element
  REQUEST_EDIT_ELEMENT = 'REQUEST_EDIT_ELEMENT',

  // Refresh workspace
  REQUEST_REFRESH_WORKSPACE = 'REQUEST_REFRESH_WORKSPACE',
  SIGNAL_REFRESH_WORKSPACE = 'SIGNAL_REFRESH_WORKSPACE',
}

@Injectable({
  providedIn: 'root',
})
export class ElectronTunnelService {
  public windowInfo: StartupData;
  public ipcRenderer: IpcRenderer = window.require?.('electron').ipcRenderer;
  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    private notificationsService: NotificationsService,
    private modelSavingTracker: ModelSavingTrackerService,
    private saveModelDialogService: SaveModelDialogService,
    private mxGraphService: MxGraphService,
    private shapeSettingsSettings: ShapeSettingsService,
    private namespaceCacheService: NamespacesCacheService,
    private sidebarService: SidebarService,
    private ngZone: NgZone
  ) {}

  public subscribeMessages() {
    if (!this.ipcRenderer) {
      return;
    }

    this.onServiceNotStarted();
    this.onNotificationRequest();
    this.onHighlightElement();
    this.onRefreshWorkspace();
    this.onWindowClose();

    this.setListeners();
  }

  private setListeners() {
    this.electronSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.electronSignalsService.addListener('setWindowInfo', payload => this.setWindowInfo(payload));
    this.electronSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.electronSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.electronSignalsService.addListener('requestStartupData', () => this.requestStartupData());
    this.electronSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
  }

  private setWindowInfo(info: StartupData) {
    this.windowInfo = info;
  }

  private updateWindowInfo(options: StartupPayload) {
    this.windowInfo.options = options;
    this.ipcRenderer.send(ElectronEvents.REQUEST_UPDATE_DATA, this.windowInfo.id, this.windowInfo.options);
  }

  private openWindow(config?: StartupPayload) {
    if (!this.ipcRenderer) {
      return;
    }

    if (!this.ipcRenderer) {
      this.notificationsService.error({
        title: 'Application not opened in electron',
        message: 'To open a new window, please open the application through electron',
      });
      return;
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_CREATE_WINDOW, config);
  }

  private isFirstWindow(): Observable<boolean> {
    if (!this.ipcRenderer) {
      return of(true);
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_IS_FIRST_WINDOW);
    return new Observable(observer => {
      const executorFn = (_: unknown, result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(ElectronEvents.RESPONSE_IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(ElectronEvents.RESPONSE_IS_FIRST_WINDOW, executorFn);
    });
  }

  private requestStartupData(): Observable<StartupData> {
    if (!this.ipcRenderer) {
      return of(null);
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_STARTUP_DATA);
    return new Observable(observer => {
      this.ipcRenderer.on(ElectronEvents.RESPONSE_STARTUP_DATA, (_: unknown, data: StartupData) => {
        this.ipcRenderer.send(ElectronEvents.REQUEST_MAXIMIZE_WINDOW, data.id);
        observer.next(data);
        observer.complete();
      });
    });
  }

  private requestRefreshWorkspaces() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ElectronEvents.SIGNAL_REFRESH_WORKSPACE, this.windowInfo?.id);
  }

  private onWindowClose() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.on(ElectronEvents.REQUEST_IS_FILE_SAVED, (_: unknown, windowId: string) => {
      this.modelSavingTracker.isSaved$
        .pipe(
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
          catchError(() => of(true))
        )
        .subscribe((close: boolean) => {
          close && this.ipcRenderer.send(ElectronEvents.REQUEST_CLOSE_WINDOW, windowId);
        });
    });
  }

  private onNotificationRequest() {
    this.ipcRenderer.on(ElectronEvents.REQUEST_SHOW_NOTIFICATION, (_: unknown, message: string) => {
      this.ngZone.run(() => {
        this.notificationsService.info({title: message});
      });
    });
  }

  private onServiceNotStarted() {
    this.ipcRenderer.on(ElectronEvents.RESPONSE_BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }

  private onHighlightElement() {
    this.ipcRenderer.on(ElectronEvents.REQUEST_EDIT_ELEMENT, (_: unknown, modelUrn: string) => {
      if (!modelUrn) {
        return;
      }

      const element = this.namespaceCacheService.currentCachedFile.getElement<BaseMetaModelElement>(modelUrn);
      if (element) {
        this.shapeSettingsSettings.editModel(element);
        requestAnimationFrame(() => {
          this.mxGraphService.navigateToCellByUrn(element.aspectModelUrn);
        });
      }
    });
  }

  private onRefreshWorkspace() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.on(ElectronEvents.REQUEST_REFRESH_WORKSPACE, () => {
      this.sidebarService.refreshSidebarNamespaces();
    });
  }
}
