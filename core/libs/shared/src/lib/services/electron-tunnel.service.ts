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

import {LoadedFilesService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {
  EditorService,
  FileHandlingService,
  FileInfo,
  GenerateHandlingService,
  SaveModelDialogService,
  ShapeSettingsService,
  TextModelLoaderModalComponent,
} from '@ame/editor';
import {FiltersService, ModelFilter} from '@ame/loader-filters';
import {MxGraphService} from '@ame/mx-graph';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ConfigurationService} from '@ame/settings-dialog';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {Injectable, NgZone, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NamedElement} from '@esmf/aspect-model-loader';
import {IpcRenderer} from 'electron';
import {BehaviorSubject, Observable, catchError, distinctUntilChanged, filter, map, of, switchMap, tap} from 'rxjs';
import {ElectronEvents} from '../enums';
import {ElectronSignals, LockUnlockPayload, StartupData, StartupPayload} from '../model';
import {ElectronSignalsService} from './electron-signals.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {NotificationsService} from './notifications.service';

@Injectable({providedIn: 'root'})
export class ElectronTunnelService {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private loadedFiles: LoadedFilesService = inject(LoadedFilesService);
  private notificationsService = inject(NotificationsService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private saveModelDialogService = inject(SaveModelDialogService);
  private mxGraphService = inject(MxGraphService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private namespacesManagerService = inject(NamespacesManagerService);
  private sidebarService = inject(SidebarStateService);
  private fileHandlingService = inject(FileHandlingService);
  private generateHandlingService = inject(GenerateHandlingService);
  private configurationService = inject(ConfigurationService);
  private editorService = inject(EditorService);
  private filtersService = inject(FiltersService);
  private shapeConnectorService = inject(ShapeConnectorService);
  private matDialog = inject(MatDialog);
  private searchesStateService = inject(SearchesStateService);
  private translate = inject(LanguageTranslationService);
  private ngZone = inject(NgZone);

  private lockedFiles$ = new BehaviorSubject<LockUnlockPayload[]>([]);

  public ipcRenderer: IpcRenderer = window.require?.('electron').ipcRenderer;
  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);

  public get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  sendTranslationsToElectron(language: string): void {
    this.translate.getTranslation(language).subscribe(translation => {
      this.ipcRenderer.send(ElectronEvents.SIGNAL_TRANSLATE_MENU_ITEMS, {
        id: 'TRANSLATE_MENU_ITEMS',
        payload: {
          translation: translation,
        },
      });
    });
  }

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
    this.onAppMenuInteraction();

    this.setListeners();
    this.setMenuStateListeners();

    this.requestLockedFiles();
  }

  private setListeners() {
    window.addEventListener('focus', () => this.setFocusedWindow());
    this.electronSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.electronSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.electronSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.electronSignalsService.addListener('requestMaximizeWindow', () => this.requestMaximizeWindow());
    this.electronSignalsService.addListener('requestWindowData', () => this.requestWindowData());
    this.electronSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
  }

  private setMenuStateListeners() {
    this.setSelectedCellsCountListener().subscribe();
  }

  setSelectedCellsCountListener(): Observable<number> {
    return this.shapeSettingsService.selectedCells$.pipe(
      map(selectedCells => selectedCells.length),
      distinctUntilChanged(),
      tap(cellsCount => {
        this.translate.getTranslation(this.translate.translateService.currentLang).subscribe(translation => {
          this.ipcRenderer.send(ElectronEvents.SIGNAL_UPDATE_MENU_ITEM, {
            id: 'OPEN_SELECTED_ELEMENT',
            payload: {
              enabled: !!cellsCount,
              translation: translation,
            },
          });

          this.ipcRenderer.send(ElectronEvents.SIGNAL_UPDATE_MENU_ITEM, {
            id: 'REMOVE_SELECTED_ELEMENT',
            payload: {
              enabled: !!cellsCount,
              translation: translation,
            },
          });

          this.ipcRenderer.send(ElectronEvents.SIGNAL_UPDATE_MENU_ITEM, {
            id: 'CONNECT_ELEMENTS',
            payload: {
              enabled: cellsCount === 2,
              translation: translation,
            },
          });
        });
      }),
    );
  }

  private setFocusedWindow() {
    this.ipcRenderer.send(ElectronEvents.SIGNAL_WINDOW_FOCUS);
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

    this.ipcRenderer.send(ElectronEvents.SIGNAL_REFRESH_WORKSPACE);
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
          switchMap(isSaved => (isSaved ? of(true) : this.ngZone.run(() => this.saveModelDialogService.openDialog()))),
          switchMap(close =>
            close
              ? this.requestWindowData().pipe(
                  switchMap(({options}) =>
                    this.electronSignalsService.call('unlockFile', {
                      namespace: options?.namespace,
                      file: options?.file,
                      aspectModelUrn: options.aspectModelUrn,
                    }),
                  ),
                  map(() => close),
                )
              : of(close),
          ),
          catchError(() => of(true)),
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

      const element = this.currentFile.cachedFile.get<NamedElement>(modelUrn);
      if (element) {
        this.shapeSettingsService.editModel(element);
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
      this.sidebarService.workspace.refresh();
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

    // this.electronSignalsService.addListener('lockFile', ({namespace, file}) => {
    //   if (file === 'empty.ttl') {
    //     return of();
    //   }

    //   return this.electronSignalsService.call('addLock', {namespace, file});
    // });

    // this.electronSignalsService.addListener('unlockFile', ({namespace, file}) => {
    //   return this.electronSignalsService.call('removeLock', {namespace, file});
    // });

    this.ipcRenderer.on(ElectronEvents.REQUEST_LOCK_FILE, (_: unknown, namespace: string, file: string, aspectModelUrn: string) => {
      if (file === 'empty.ttl') return;
      this.electronSignalsService.call('lockFile', {namespace, file, aspectModelUrn}).subscribe();
    });

    this.ipcRenderer.on(ElectronEvents.REQUEST_UNLOCK_FILE, (_: unknown, namespace: string, file: string, aspectModelUrn: string) => {
      this.electronSignalsService.call('unlockFile', {namespace, file, aspectModelUrn}).subscribe();
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

  private onAppMenuInteraction() {
    this.ipcRenderer.on(ElectronEvents.SIGNAL_NEW_EMPTY_MODEL, () => {
      this.ngZone.run(() => {
        this.modelSavingTracker.isSaved$
          .pipe(
            switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
            filter(result => result),
            switchMap(() => this.fileHandlingService.loadEmptyModel()),
          )
          .subscribe();
      });
    });

    this.ipcRenderer.on(ElectronEvents.SIGNAL_LOAD_FILE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );

    this.ipcRenderer.on(ElectronEvents.SIGNAL_LOAD_FROM_TEXT, () => {
      this.ngZone.run(() => this.matDialog.open(TextModelLoaderModalComponent));
    });

    this.ipcRenderer.on(ElectronEvents.SIGNAL_LOAD_SPECIFIC_FILE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );

    this.ipcRenderer.on(ElectronEvents.SIGNAL_NEW_WINDOW, () => {
      this.ngZone.run(() => this.electronSignalsService.call('openWindow', null));
    });

    this.ipcRenderer.on(ElectronEvents.SIGNAL_IMPORT_TO_WORKSPACE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onAddFileToNamespace(fileInfo)),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_IMPORT_NAMESPACES, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.namespacesManagerService.onImportNamespaces(fileInfo)),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_COPY_TO_CLIPBOARD, () => this.ngZone.run(() => this.fileHandlingService.onCopyToClipboard()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_SAVE_TO_WORKSPACE, () =>
      this.ngZone.run(() => this.fileHandlingService.onSaveAspectModelToWorkspace()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_EXPORT_MODEL, () =>
      this.ngZone.run(() => this.fileHandlingService.onExportAsAspectModelFile()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_EXPORT_NAMESPACES, () =>
      this.ngZone.run(() => this.namespacesManagerService.onExportNamespaces()),
    );

    this.ipcRenderer.on(ElectronEvents.SIGNAL_SHOW_HIDE_TOOLBAR, () => {
      this.ngZone.run(() => this.configurationService.toggleToolbar());
    });

    this.ipcRenderer.on(ElectronEvents.SIGNAL_SHOW_HIDE_MINIMAP, () => this.ngZone.run(() => this.configurationService.toggleEditorMap()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_FILTER_MODEL_BY, (_: unknown, rule: ModelFilter) =>
      this.ngZone.run(() => this.filtersService.renderByFilter(rule)),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_ZOOM_IN, () => this.ngZone.run(() => this.editorService.zoomIn()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_ZOOM_OUT, () => this.ngZone.run(() => this.editorService.zoomOut()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_ZOOM_TO_FIT, () => this.ngZone.run(() => this.editorService.fit()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_ZOOM_TO_ACTUAL, () => this.ngZone.run(() => this.editorService.actualSize()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_OPEN_SELECTED_ELEMENT, () =>
      this.ngZone.run(() => this.shapeSettingsService.editSelectedCell()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_REMOVE_SELECTED_ELEMENT, () =>
      this.ngZone.run(() => this.editorService.deleteSelectedElements()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_COLLAPSE_EXPAND_MODEL, () => this.ngZone.run(() => this.editorService.toggleExpand()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_FORMAT_MODEL, () => this.ngZone.run(() => this.editorService.formatModel()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_CONNECT_ELEMENTS, () =>
      this.ngZone.run(() => this.shapeConnectorService.connectSelectedElements()),
    );

    this.ipcRenderer.on(ElectronEvents.SIGNAL_VALIDATE_MODEL, () => this.ngZone.run(() => this.fileHandlingService.onValidateFile()));
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_HTML_DOCUMENTATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateDocumentation()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_OPEN_API_SPECIFICATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateOpenApiSpec()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_ASYNC_API_SPECIFICATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateAsyncApiSpec()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_AASX_XML, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateAASXFile()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_JSON_PAYLOAD, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateJsonSample()),
    );
    this.ipcRenderer.on(ElectronEvents.SIGNAL_GENERATE_JSON_SCHEMA, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateJsonSchema()),
    );

    this.ipcRenderer.on(ElectronEvents.SIGNAL_SEARCH_ELEMENTS, () => {
      this.ngZone.run(() => this.searchesStateService.elementsSearch.open());
    });

    this.ipcRenderer.on(ElectronEvents.SIGNAL_SEARCH_FILES, () => {
      this.ngZone.run(() => this.searchesStateService.filesSearch.open());
    });
  }
}
