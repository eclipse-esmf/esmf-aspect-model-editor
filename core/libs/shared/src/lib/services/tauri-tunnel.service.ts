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
import {MaxGraphService} from '@ame/max-graph';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ConfigurationService} from '@ame/settings-dialog';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {NamedElement} from '@esmf/aspect-model-loader';
import {BehaviorSubject, Observable, distinctUntilChanged, filter, map, of, switchMap, take, tap} from 'rxjs';
import {TAURI_EVENTS} from '../enums';
import {StartupData, StartupPayload, TauriSignals} from '../model';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {NotificationsService} from './notifications.service';
import {TauriSignalsService} from './tauri-signals.service';

@Injectable({providedIn: 'root'})
export class TauriTunnelService {
  private ipcRenderer = inject(IPC_RENDERER);
  private destroyRef = inject(DestroyRef);
  private tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private loadedFiles: LoadedFilesService = inject(LoadedFilesService);
  private notificationsService = inject(NotificationsService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private saveModelDialogService = inject(SaveModelDialogService);
  private maxgraphService = inject(MaxGraphService);
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

  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string}>(null);

  public get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  sendTranslationsToTauri(language: string, customMenuItem?: any): void {
    this.translate.getTranslation(language).subscribe(translation => {
      this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
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
    this.ipcRenderer.send(TAURI_EVENTS.SIGNAL.WINDOW_FOCUS);
    this.tauriSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.tauriSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.tauriSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.tauriSignalsService.addListener('requestMaximizeWindow', () => this.requestMaximizeWindow());
    this.tauriSignalsService.addListener('requestWindowData', () => this.requestWindowData());
    this.tauriSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
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

  private getTranslation$(): Observable<any> {
    if (this.translate.language) {
      return of(this.translate.language);
    }
    const lang = this.translate.translateService.getActiveLang() || 'en';
    return this.translate.getTranslation(lang).pipe(take(1));
  }

  private sendMenuUpdate(ids: string[], enabled: boolean): void {
    this.getTranslation$()
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe(translation => {
        this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.UPDATE_MENU_ITEM, {
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
    this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }

  private onNotificationRequest(): void {
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.SHOW_NOTIFICATION, (message: string) => {
      this.notificationsService.info({title: message});
    });
  }

  private onHighlightElement(): void {
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.EDIT_ELEMENT, (modelUrn: string) => {
      if (!modelUrn) return;
      const element = this.currentFile.cachedFile.get<NamedElement>(modelUrn);
      if (element) {
        this.shapeSettingsService.editModel(element);
        requestAnimationFrame(() => this.maxgraphService.navigateToCellByUrn(element.aspectModelUrn));
      }
    });
  }

  private onRefreshWorkspace(): void {
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.REFRESH_WORKSPACE, () => {
      this.sidebarService.workspace.refresh();
    });
  }

  private onAppMenuInteraction(): void {
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.NEW_EMPTY_MODEL, () => {
      this.modelSavingTracker.isSaved$
        .pipe(
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
          filter(result => result),
          switchMap(() => this.fileHandlingService.loadEmptyModel()),
        )
        .subscribe();
    });

    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.LOAD_FILE, (fileInfo: FileInfo) => this.fileHandlingService.onLoadModel(fileInfo));
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.LOAD_FROM_TEXT, () => this.matDialog.open(TextModelLoaderModalComponent));
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, (fileInfo: FileInfo) => this.fileHandlingService.onLoadModel(fileInfo));
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.NEW_WINDOW, () => this.tauriSignalsService.call('openWindow', null));
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.IMPORT_TO_WORKSPACE, (fileInfo: FileInfo) =>
      this.fileHandlingService.onAddFileToNamespace(fileInfo),
    );
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.IMPORT_NAMESPACES, (fileInfo: FileInfo) =>
      this.namespacesManagerService.onImportNamespaces(fileInfo),
    );
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.COPY_TO_CLIPBOARD, () => this.fileHandlingService.onCopyToClipboard());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.SAVE_TO_WORKSPACE, () => this.fileHandlingService.onSaveAspectModelToWorkspace());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.EXPORT_MODEL, () => this.fileHandlingService.onExportAsAspectModelFile());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.EXPORT_NAMESPACES, () => this.namespacesManagerService.onExportNamespaces());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR, () => this.configurationService.toggleToolbar());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP, () => this.configurationService.toggleEditorMap());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.FILTER_MODEL_BY, (rule: ModelFilter) => this.filtersService.renderByFilter(rule));
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.ZOOM_IN, () => this.editorService.zoomIn());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.ZOOM_OUT, () => this.editorService.zoomOut());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.ZOOM_TO_FIT, () => this.editorService.fit());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.ZOOM_TO_ACTUAL, () => this.editorService.actualSize());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT, () => this.shapeSettingsService.editSelectedCell());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT, () => this.editorService.deleteSelectedElements());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL, () => this.editorService.toggleExpand());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.FORMAT_MODEL, () => this.editorService.formatModel());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.CONNECT_ELEMENTS, () => this.shapeConnectorService.connectSelectedElements());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.VALIDATE_MODEL, () => this.fileHandlingService.onValidateFile());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION, () => this.generateHandlingService.onGenerateDocumentation());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION, () => this.generateHandlingService.onGenerateOpenApiSpec());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION, () => this.generateHandlingService.onGenerateAsyncApiSpec());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_AASX_XML, () => this.generateHandlingService.onGenerateAASXFile());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD, () => this.generateHandlingService.onGenerateJsonSample());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.GENERATE_JSON_SCHEMA, () => this.generateHandlingService.onGenerateJsonSchema());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.SEARCH_ELEMENTS, () => this.searchesStateService.elementsSearch.open());
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.SEARCH_FILES, () => this.searchesStateService.filesSearch.open());
  }

  private onWindowClose(): void {
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.IS_FILE_SAVED, (windowId: string) => {
      this.modelSavingTracker.isSaved$
        .pipe(switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())))
        .subscribe((close: boolean) => {
          if (close) this.ipcRenderer.send(TAURI_EVENTS.REQUEST.CLOSE_WINDOW, windowId);
        });
    });
  }

  private updateWindowInfo(options: StartupPayload): void {
    this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.UPDATE_DATA, options);
  }

  private openWindow(config?: StartupPayload): void {
    if (!this.ipcRenderer) {
      this.notificationsService.error({
        title: 'Application not opened in tauri',
        message: 'To open a new window, please open the application through tauri',
      });
      return;
    }
    this.ipcRenderer.send(TAURI_EVENTS.REQUEST.CREATE_WINDOW, config);
  }

  private isFirstWindow(): Observable<boolean> {
    if (!this.ipcRenderer) return of(true);
    return new Observable(observer => {
      const executorFn = (result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
      this.ipcRenderer.send(TAURI_EVENTS.REQUEST.IS_FIRST_WINDOW);
    });
  }

  private requestWindowData(): Observable<StartupData> {
    if (!this.ipcRenderer) return of(null);
    return new Observable(observer => {
      const executorFn = (data: StartupData) => {
        observer.next(data);
        this.ipcRenderer.removeListener(TAURI_EVENTS.RESPONSE.WINDOW_DATA, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.WINDOW_DATA, executorFn);
      this.ipcRenderer.send(TAURI_EVENTS.REQUEST.WINDOW_DATA);
    });
  }

  private requestMaximizeWindow(): void {
    this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.MAXIMIZE_WINDOW);
  }

  private requestRefreshWorkspaces(): void {
    this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.REFRESH_WORKSPACE);
  }
}
