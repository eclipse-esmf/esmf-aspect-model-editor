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
import {ELECTRON_EVENTS} from '../enums';
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
      this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
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
    this.setHasCellsListener().subscribe();
  }

  setSelectedCellsCountListener(): Observable<number> {
    return this.shapeSettingsService.selectedCells$.pipe(
      map(selectedCells => selectedCells.length),
      distinctUntilChanged(),
      tap(cellsCount => {
        this.translate.getTranslation(this.translate.translateService.getCurrentLang()).subscribe(translation => {
          this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.UPDATE_MENU_ITEM, {
            ids: ['OPEN_SELECTED_ELEMENT', 'REMOVE_SELECTED_ELEMENT', 'CONNECT_ELEMENTS'],
            payload: {
              enabled: !!cellsCount,
              translation: translation,
            },
          });
        });
      }),
    );
  }

  setHasCellsListener(): Observable<boolean> {
    return this.shapeSettingsService.hasCellsSubject$.pipe(
      distinctUntilChanged(),
      tap(hasCells => {
        this.translate.getTranslation(this.translate.translateService.getCurrentLang()).subscribe(translation => {
          this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.UPDATE_MENU_ITEM, {
            ids: [
              'COLLAPSE_EXPAND_MODEL',
              'FORMAT_MODEL',
              'MENU_FILTER_MODEL_BY',
              'MENU_FILTER_MODEL_BY',
              'ZOOM_IN',
              'ZOOM_OUT',
              'ZOOM_TO_FIT',
              'ZOOM_TO_ACTUAL',
              'NEW_EMPTY_MODEL',
              'COPY_TO_CLIPBOARD',
              'SAVE_TO_WORKSPACE',
              'EXPORT_MODEL',
              'VALIDATE_MODEL',
              'GENERATE_HTML_DOCUMENTATION',
              'GENERATE_OPEN_API_SPECIFICATION',
              'GENERATE_ASYNC_API_SPECIFICATION',
              'GENERATE_AASX_XML',
              'GENERATE_JSON_PAYLOAD',
              'GENERATE_JSON_SCHEMA',
              'SEARCH_ELEMENTS',
            ],
            payload: {
              enabled: hasCells,
              translation: translation,
            },
          });
        });
      }),
    );
  }

  private setFocusedWindow() {
    this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.WINDOW_FOCUS);
  }

  private updateWindowInfo(options: StartupPayload) {
    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.UPDATE_DATA, options);
  }

  private openWindow(config?: StartupPayload) {
    if (!this.ipcRenderer) {
      this.notificationsService.error({
        title: 'Application not opened in electron',
        message: 'To open a new window, please open the application through electron',
      });
      return;
    }

    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.CREATE_WINDOW, config);
  }

  private isFirstWindow(): Observable<boolean> {
    if (!this.ipcRenderer) {
      return of(true);
    }

    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.IS_FIRST_WINDOW);
    return new Observable(observer => {
      const executorFn = (_: unknown, result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
    });
  }

  private requestWindowData(): Observable<StartupData> {
    if (!this.ipcRenderer) {
      return of(null);
    }

    return new Observable(observer => {
      this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.WINDOW_DATA, (_: unknown, data: StartupData) => {
        observer.next(data);
        observer.complete();
      });

      this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.WINDOW_DATA);
    });
  }

  private requestMaximizeWindow() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.MAXIMIZE_WINDOW);
  }

  private requestRefreshWorkspaces() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.REFRESH_WORKSPACE);
  }

  private requestLockedFiles() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.LOCKED_FILES);
  }

  private onWindowClose() {
    if (!this.ipcRenderer) {
      return;
    }

    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.IS_FILE_SAVED, (_: unknown, windowId: string) => {
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
          close && this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.CLOSE_WINDOW, windowId);
        });
    });
  }

  private onNotificationRequest() {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.SHOW_NOTIFICATION, (_: unknown, message: string) => {
      this.ngZone.run(() => {
        this.notificationsService.info({title: message});
      });
    });
  }

  private onServiceNotStarted() {
    this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }

  private onHighlightElement() {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.EDIT_ELEMENT, (_: unknown, modelUrn: string) => {
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

    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.REFRESH_WORKSPACE, () => {
      this.sidebarService.workspace.refresh();
    });
  }

  private onReceiveLockedFiles() {
    this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.LOCKED_FILES, (_: unknown, files: LockUnlockPayload[]) => {
      this.lockedFiles$.next(files);
    });
  }

  private onLockUnlockFile() {
    if (!this.ipcRenderer) {
      return;
    }

    this.electronSignalsService.addListener('addLock', ({namespace, file}) => {
      this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.ADD_LOCK, {namespace, file});
    });

    this.electronSignalsService.addListener('removeLock', ({namespace, file}) => {
      this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.REMOVE_LOCK, {namespace, file});
    });

    this.electronSignalsService.addListener('lockedFiles', () => {
      return this.lockedFiles$.asObservable();
    });
  }

  private onAppMenuInteraction() {
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.NEW_EMPTY_MODEL, () => {
      this.ngZone.run(() => {
        this.modelSavingTracker.isSaved$
          .pipe(
            switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
            filter(result => result),
            switchMap(() => this.fileHandlingService.loadEmptyModel()),
            tap(() => this.shapeSettingsService.hasCellsSubject.next(false)),
          )
          .subscribe();
      });
    });

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_FILE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_FROM_TEXT, () => {
      this.ngZone.run(() => this.matDialog.open(TextModelLoaderModalComponent));
    });

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.NEW_WINDOW, () => {
      this.ngZone.run(() => this.electronSignalsService.call('openWindow', null));
    });

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.IMPORT_TO_WORKSPACE, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.fileHandlingService.onAddFileToNamespace(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.IMPORT_NAMESPACES, (_: unknown, fileInfo: FileInfo) =>
      this.ngZone.run(() => this.namespacesManagerService.onImportNamespaces(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.COPY_TO_CLIPBOARD, () =>
      this.ngZone.run(() => this.fileHandlingService.onCopyToClipboard()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SAVE_TO_WORKSPACE, () =>
      this.ngZone.run(() => this.fileHandlingService.onSaveAspectModelToWorkspace()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.EXPORT_MODEL, () =>
      this.ngZone.run(() => this.fileHandlingService.onExportAsAspectModelFile()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.EXPORT_NAMESPACES, () =>
      this.ngZone.run(() => this.namespacesManagerService.onExportNamespaces()),
    );

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR, () => {
      this.ngZone.run(() => this.configurationService.toggleToolbar());
    });

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP, () => this.ngZone.run(() => this.configurationService.toggleEditorMap()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.FILTER_MODEL_BY, (_: unknown, rule: ModelFilter) =>
      this.ngZone.run(() => this.filtersService.renderByFilter(rule)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_IN, () => this.ngZone.run(() => this.editorService.zoomIn()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_OUT, () => this.ngZone.run(() => this.editorService.zoomOut()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_TO_FIT, () => this.ngZone.run(() => this.editorService.fit()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_TO_ACTUAL, () => this.ngZone.run(() => this.editorService.actualSize()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT, () =>
      this.ngZone.run(() => this.shapeSettingsService.editSelectedCell()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT, () =>
      this.ngZone.run(() => this.editorService.deleteSelectedElements()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL, () => this.ngZone.run(() => this.editorService.toggleExpand()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.FORMAT_MODEL, () => this.ngZone.run(() => this.editorService.formatModel()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.CONNECT_ELEMENTS, () =>
      this.ngZone.run(() => this.shapeConnectorService.connectSelectedElements()),
    );

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.VALIDATE_MODEL, () => this.ngZone.run(() => this.fileHandlingService.onValidateFile()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateDocumentation()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateOpenApiSpec()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateAsyncApiSpec()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_AASX_XML, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateAASXFile()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateJsonSample()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_JSON_SCHEMA, () =>
      this.ngZone.run(() => this.generateHandlingService.onGenerateJsonSchema()),
    );

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SEARCH_ELEMENTS, () => {
      this.ngZone.run(() => this.searchesStateService.elementsSearch.open());
    });

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SEARCH_FILES, () => {
      this.ngZone.run(() => this.searchesStateService.filesSearch.open());
    });
  }
}
