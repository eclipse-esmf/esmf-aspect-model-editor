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
import {IPC_RENDERER} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {DestroyRef, Injectable, NgZone, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {NamedElement} from '@esmf/aspect-model-loader';
import {BehaviorSubject, Observable, distinctUntilChanged, filter, map, of, switchMap, tap} from 'rxjs';
import {ELECTRON_EVENTS} from '../enums';
import {ElectronSignals, StartupData, StartupPayload} from '../model';
import {ElectronSignalsService} from './electron-signals.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {NotificationsService} from './notifications.service';

@Injectable({providedIn: 'root'})
export class ElectronTunnelService {
  private ipcRenderer = inject(IPC_RENDERER);
  private destroyRef = inject(DestroyRef);
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

  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);

  public get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  sendTranslationsToElectron(language: string, customMenuItem?: any): void {
    this.translate.getTranslation(language).subscribe(translation => {
      this.ipcRenderer?.send(ELECTRON_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
        id: 'TRANSLATE_MENU_ITEMS',
        payload: {translation: translation, customMenuItem: customMenuItem},
      });
    });
  }

  public subscribeMessages(): void {
    if (!this.ipcRenderer) return;
    this.setListeners();
    this.setSelectedCellsCountListener();
    this.setHasCellsListener();
    this.registerIpcEvents();
  }

  private setListeners(): void {
    this.ipcRenderer.send(ELECTRON_EVENTS.SIGNAL.WINDOW_FOCUS);
    this.electronSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.electronSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.electronSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.electronSignalsService.addListener('requestMaximizeWindow', () => this.requestMaximizeWindow());
    this.electronSignalsService.addListener('requestWindowData', () => this.requestWindowData());
    this.electronSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
  }

  private setSelectedCellsCountListener(): void {
    this.shapeSettingsService.selectedCells$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(selectedCells => selectedCells.length),
        distinctUntilChanged(),
        tap(cellsCount => {
          this.sendMenuUpdate(['OPEN_SELECTED_ELEMENT', 'REMOVE_SELECTED_ELEMENT', 'CONNECT_ELEMENTS'], !!cellsCount);
        }),
      )
      .subscribe();
  }

  private setHasCellsListener(): void {
    const ids = [
      'COLLAPSE_EXPAND_MODEL',
      'FORMAT_MODEL',
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
    ];
    this.shapeSettingsService.hasCellsSubject$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        tap(hasCells => this.sendMenuUpdate(ids, hasCells)),
      )
      .subscribe();
  }

  private sendMenuUpdate(ids: string[], enabled: boolean): void {
    this.translate.getTranslation(this.translate.translateService.getCurrentLang()).subscribe(translation => {
      this.ipcRenderer?.send(ELECTRON_EVENTS.SIGNAL.UPDATE_MENU_ITEM, {
        ids,
        payload: {enabled, translation},
      });
    });
  }

  private registerIpcEvents(): void {
    this.onServiceNotStarted();
    this.onNotificationRequest();
    this.onHighlightElement();
    this.onRefreshWorkspace();
    this.onWindowClose();
    this.onAppMenuInteraction();
  }

  private onServiceNotStarted(): void {
    this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }

  private onNotificationRequest(): void {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.SHOW_NOTIFICATION, (message: string) => {
      this.ngZone.run(() => this.notificationsService.info({title: message}));
    });
  }

  private onHighlightElement(): void {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.EDIT_ELEMENT, (modelUrn: string) => {
      if (!modelUrn) return;
      const element = this.currentFile.cachedFile.get<NamedElement>(modelUrn);
      if (element) {
        this.shapeSettingsService.editModel(element);
        requestAnimationFrame(() => this.mxGraphService.navigateToCellByUrn(element.aspectModelUrn));
      }
    });
  }

  private onRefreshWorkspace(): void {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.REFRESH_WORKSPACE, () => {
      this.sidebarService.workspace.refresh();
    });
  }

  private onAppMenuInteraction(): void {
    const runNgZone = (fn: () => void) => this.ngZone.run(fn);

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.NEW_EMPTY_MODEL, () => {
      runNgZone(() => {
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

    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_FILE, (fileInfo: FileInfo) =>
      runNgZone(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_FROM_TEXT, () => runNgZone(() => this.matDialog.open(TextModelLoaderModalComponent)));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, (fileInfo: FileInfo) =>
      runNgZone(() => this.fileHandlingService.onLoadModel(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.NEW_WINDOW, () => runNgZone(() => this.electronSignalsService.call('openWindow', null)));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.IMPORT_TO_WORKSPACE, (fileInfo: FileInfo) =>
      runNgZone(() => this.fileHandlingService.onAddFileToNamespace(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.IMPORT_NAMESPACES, (fileInfo: FileInfo) =>
      runNgZone(() => this.namespacesManagerService.onImportNamespaces(fileInfo)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.COPY_TO_CLIPBOARD, () => runNgZone(() => this.fileHandlingService.onCopyToClipboard()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SAVE_TO_WORKSPACE, () =>
      runNgZone(() => this.fileHandlingService.onSaveAspectModelToWorkspace()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.EXPORT_MODEL, () => runNgZone(() => this.fileHandlingService.onExportAsAspectModelFile()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.EXPORT_NAMESPACES, () =>
      runNgZone(() => this.namespacesManagerService.onExportNamespaces()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR, () => runNgZone(() => this.configurationService.toggleToolbar()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP, () => runNgZone(() => this.configurationService.toggleEditorMap()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.FILTER_MODEL_BY, (rule: ModelFilter) =>
      runNgZone(() => this.filtersService.renderByFilter(rule)),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_IN, () => runNgZone(() => this.editorService.zoomIn()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_OUT, () => runNgZone(() => this.editorService.zoomOut()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_TO_FIT, () => runNgZone(() => this.editorService.fit()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.ZOOM_TO_ACTUAL, () => runNgZone(() => this.editorService.actualSize()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT, () => runNgZone(() => this.shapeSettingsService.editSelectedCell()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT, () => runNgZone(() => this.editorService.deleteSelectedElements()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL, () => runNgZone(() => this.editorService.toggleExpand()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.FORMAT_MODEL, () => runNgZone(() => this.editorService.formatModel()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.CONNECT_ELEMENTS, () =>
      runNgZone(() => this.shapeConnectorService.connectSelectedElements()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.VALIDATE_MODEL, () => runNgZone(() => this.fileHandlingService.onValidateFile()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION, () =>
      runNgZone(() => this.generateHandlingService.onGenerateDocumentation()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION, () =>
      runNgZone(() => this.generateHandlingService.onGenerateOpenApiSpec()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION, () =>
      runNgZone(() => this.generateHandlingService.onGenerateAsyncApiSpec()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_AASX_XML, () => runNgZone(() => this.generateHandlingService.onGenerateAASXFile()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD, () =>
      runNgZone(() => this.generateHandlingService.onGenerateJsonSample()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.GENERATE_JSON_SCHEMA, () =>
      runNgZone(() => this.generateHandlingService.onGenerateJsonSchema()),
    );
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SEARCH_ELEMENTS, () => runNgZone(() => this.searchesStateService.elementsSearch.open()));
    this.ipcRenderer.on(ELECTRON_EVENTS.SIGNAL.SEARCH_FILES, () => runNgZone(() => this.searchesStateService.filesSearch.open()));
  }

  private onWindowClose(): void {
    this.ipcRenderer.on(ELECTRON_EVENTS.REQUEST.IS_FILE_SAVED, (windowId: string) => {
      this.modelSavingTracker.isSaved$
        .pipe(switchMap(isSaved => (isSaved ? of(true) : this.ngZone.run(() => this.saveModelDialogService.openDialog()))))
        .subscribe((close: boolean) => {
          if (close) this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.CLOSE_WINDOW, windowId);
        });
    });
  }

  private updateWindowInfo(options: StartupPayload): void {
    this.ipcRenderer?.send(ELECTRON_EVENTS.REQUEST.UPDATE_DATA, options);
  }

  private openWindow(config?: StartupPayload): void {
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
    if (!this.ipcRenderer) return of(true);
    this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.IS_FIRST_WINDOW);
    return new Observable(observer => {
      const executorFn = (result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
    });
  }

  private requestWindowData(): Observable<StartupData> {
    if (!this.ipcRenderer) return of(null);
    return new Observable(observer => {
      this.ipcRenderer.on(ELECTRON_EVENTS.RESPONSE.WINDOW_DATA, (data: StartupData) => {
        observer.next(data);
        observer.complete();
      });
      this.ipcRenderer.send(ELECTRON_EVENTS.REQUEST.WINDOW_DATA);
    });
  }

  private requestMaximizeWindow(): void {
    this.ipcRenderer?.send(ELECTRON_EVENTS.REQUEST.MAXIMIZE_WINDOW);
  }

  private requestRefreshWorkspaces(): void {
    this.ipcRenderer?.send(ELECTRON_EVENTS.SIGNAL.REFRESH_WORKSPACE);
  }
}
