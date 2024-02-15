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

import {inject, Injectable, NgZone} from '@angular/core';
import {IpcRenderer} from 'electron';
import {BehaviorSubject, catchError, map, Observable, of, switchMap, take, tap} from 'rxjs';
import {ElectronSignals, LockUnlockPayload, StartupData, StartupPayload} from './model';
import {NotificationsService} from './notifications.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {SaveModelDialogService, ShapeSettingsService} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {NamespacesCacheService} from '@ame/cache';
import {BaseMetaModelElement} from '@ame/meta-model';
import {SidebarService} from './sidebar.service';
import {ElectronSignalsService} from './electron-signals.service';
import {ElectronEvents} from './enums/electron-events.enum';
import {ModelApiService} from '@ame/api';

@Injectable({
  providedIn: 'root',
})
export class ElectronTunnelService {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private lockedFiles$ = new BehaviorSubject<LockUnlockPayload[]>([]);

  public ipcRenderer: IpcRenderer = window.require?.('electron').ipcRenderer;
  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);

  constructor(
    private notificationsService: NotificationsService,
    private modelSavingTracker: ModelSavingTrackerService,
    private saveModelDialogService: SaveModelDialogService,
    private mxGraphService: MxGraphService,
    private shapeSettingsSettings: ShapeSettingsService,
    private namespaceCacheService: NamespacesCacheService,
    private sidebarService: SidebarService,
    private modelApiService: ModelApiService,
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
    this.onLockUnlockFile();
    this.onReceiveLockedFiles();

    this.setListeners();

    this.requestLockedFiles();
  }

  private setListeners() {
    this.electronSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.electronSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.electronSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.electronSignalsService.addListener('requestMaximizeWindow', () => this.requestMaximizeWindow());
    this.electronSignalsService.addListener('requestWindowData', () => this.requestWindowData());
    this.electronSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
  }

  private updateWindowInfo(options: StartupPayload) {
    this.ipcRenderer.send(ElectronEvents.REQUEST_UPDATE_DATA, options);
  }

  private openWindow(config?: StartupPayload) {
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

  private requestWindowData(): Observable<StartupData> {
    if (!this.ipcRenderer) {
      return of(null);
    }

    return new Observable(observer => {
      this.ipcRenderer.on(ElectronEvents.RESPONSE_WINDOW_DATA, (_: unknown, data: StartupData) => {
        observer.next(data);
        observer.complete();
      });

      this.ipcRenderer.send(ElectronEvents.REQUEST_WINDOW_DATA);
    });
  }

  private requestMaximizeWindow() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_MAXIMIZE_WINDOW);
  }

  private requestRefreshWorkspaces() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ElectronEvents.SIGNAL_REFRESH_WORKSPACE, true);
  }

  private requestLockedFiles() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ElectronEvents.REQUEST_LOCKED_FILES);
  }

  private onWindowClose() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.on(ElectronEvents.REQUEST_IS_FILE_SAVED, (_: unknown, windowId: string) => {
      this.modelSavingTracker.isSaved$
        .pipe(
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
          switchMap(close =>
            close
              ? this.requestWindowData().pipe(
                  switchMap(({options}) =>
                    this.electronSignalsService.call('unlockFile', {
                      namespace: options?.namespace,
                      file: options?.file,
                    })
                  ),
                  map(() => close)
                )
              : of(close)
          ),
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

  private onReceiveLockedFiles() {
    this.ipcRenderer.on(ElectronEvents.RESPONSE_LOCKED_FILES, (_: unknown, files: LockUnlockPayload[]) => {
      this.lockedFiles$.next(files);
    });
  }

  private onLockUnlockFile() {
    if (!this.ipcRenderer) {
      return;
    }

    this.electronSignalsService.addListener('lockFile', ({namespace, file}) => {
      return this.modelApiService.lockFile(namespace, file).pipe(
        take(1),
        tap(() => this.electronSignalsService.call('addLock', {namespace, file}))
      );
    });

    this.electronSignalsService.addListener('unlockFile', ({namespace, file}) => {
      return this.modelApiService.unlockFile(namespace, file).pipe(
        take(1),
        tap(() => this.electronSignalsService.call('removeLock', {namespace, file}))
      );
    });

    this.ipcRenderer.on(ElectronEvents.REQUEST_LOCK_FILE, (_: unknown, namespace: string, file: string) => {
      this.electronSignalsService.call('lockFile', {namespace, file}).subscribe();
    });

    this.ipcRenderer.on(ElectronEvents.REQUEST_UNLOCK_FILE, (_: unknown, namespace: string, file: string) => {
      this.electronSignalsService.call('unlockFile', {namespace, file}).subscribe();
    });

    this.electronSignalsService.addListener('addLock', ({namespace, file}) => {
      this.ipcRenderer.send(ElectronEvents.REQUEST_ADD_LOCK, {namespace, file});
    });

    this.electronSignalsService.addListener('removeLock', ({namespace, file}) => {
      this.ipcRenderer.send(ElectronEvents.REQUEST_REMOVE_LOCK, {namespace, file});
    });

    this.electronSignalsService.addListener('lockedFiles', () => {
      return this.lockedFiles$.asObservable();
    });
  }
}
