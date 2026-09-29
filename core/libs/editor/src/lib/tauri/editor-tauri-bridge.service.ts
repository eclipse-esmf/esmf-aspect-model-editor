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

import {FiltersService} from '@ame/domain';
import {MaxGraphService, ShapeConnectorService} from '@ame/graph';
import {LoadedFilesService, NamespacesManagerService} from '@ame/infrastructure';
import {IPC_RENDERER, ITauriIpcBridge, LanguageTranslationService, ModelFilter, TAURI_EVENTS} from '@ame/shared';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Observable, distinctUntilChanged, filter, map, of, switchMap, take, tap} from 'rxjs';
import {ShapeSettingsService} from '../editor-dialog/services/shape-settings.service';
import {TextModelLoaderModalComponent} from '../editor-toolbar/components/text-model-loader-modal/text-model-loader-modal.component';
import {FileHandlingService, FileInfo} from '../editor-toolbar/services/file-handling.service';
import {GenerateHandlingService} from '../editor-toolbar/services/generate-handling.service';
import {EditorService} from '../editor.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';

const HAS_CELLS_MENU_IDS = [
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

/** Handles all editor related Tauri menu/IPC events. */
@Injectable({providedIn: 'root'})
export class EditorTauriBridge implements ITauriIpcBridge {
  private ipcRenderer = inject(IPC_RENDERER);
  private destroyRef = inject(DestroyRef);
  private loadedFiles = inject(LoadedFilesService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private saveModelDialogService = inject(SaveModelDialogService);
  private maxgraphService = inject(MaxGraphService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private namespacesManagerService = inject(NamespacesManagerService);
  private fileHandlingService = inject(FileHandlingService);
  private generateHandlingService = inject(GenerateHandlingService);
  private editorService = inject(EditorService);
  private filtersService = inject(FiltersService);
  private shapeConnectorService = inject(ShapeConnectorService);
  private matDialog = inject(MatDialog);
  private translate = inject(LanguageTranslationService);

  register(): void {
    if (!this.ipcRenderer) return;
    this.setSelectedCellsCountListener();
    this.setHasCellsListener();
    this.onHighlightElement();
    this.onWindowClose();
    this.onAppMenuInteraction();
  }

  private setSelectedCellsCountListener(): void {
    this.shapeSettingsService.selectedCells$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(selectedCells => selectedCells.length),
        distinctUntilChanged(),
        tap(cellsCount => this.sendMenuUpdate(['OPEN_SELECTED_ELEMENT', 'REMOVE_SELECTED_ELEMENT', 'CONNECT_ELEMENTS'], !!cellsCount)),
      )
      .subscribe();
  }

  private setHasCellsListener(): void {
    this.shapeSettingsService.hasCellsSubject$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        tap(hasCells => this.sendMenuUpdate(HAS_CELLS_MENU_IDS, hasCells)),
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
        this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.UPDATE_MENU_ITEM, {ids, payload: {enabled, translation}});
      });
  }

  private onHighlightElement(): void {
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.EDIT_ELEMENT, (modelUrn: string) => {
      if (!modelUrn) return;
      const element = this.loadedFiles.currentLoadedFile.cachedFile.get<NamedElement>(modelUrn);
      if (element) {
        this.shapeSettingsService.editModel(element);
        requestAnimationFrame(() => this.maxgraphService.navigateToCellByUrn(element.aspectModelUrn));
      }
    });
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

  private onAppMenuInteraction(): void {
    const ipc = this.ipcRenderer;
    ipc.on(TAURI_EVENTS.SIGNAL.NEW_EMPTY_MODEL, () => {
      this.modelSavingTracker.isSaved$
        .pipe(
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialogService.openDialog())),
          filter(result => result),
          switchMap(() => this.fileHandlingService.loadEmptyModel()),
        )
        .subscribe();
    });

    ipc.on(TAURI_EVENTS.SIGNAL.LOAD_FILE, (fileInfo: FileInfo) => this.fileHandlingService.onLoadModel(fileInfo));
    ipc.on(TAURI_EVENTS.SIGNAL.LOAD_FROM_TEXT, () => this.matDialog.open(TextModelLoaderModalComponent));
    ipc.on(TAURI_EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, (fileInfo: FileInfo) => this.fileHandlingService.onLoadModel(fileInfo));
    ipc.on(TAURI_EVENTS.SIGNAL.IMPORT_TO_WORKSPACE, (fileInfo: FileInfo) => this.fileHandlingService.onAddFileToNamespace(fileInfo));
    ipc.on(TAURI_EVENTS.SIGNAL.IMPORT_NAMESPACES, (fileInfo: FileInfo) => this.namespacesManagerService.onImportNamespaces(fileInfo));
    ipc.on(TAURI_EVENTS.SIGNAL.COPY_TO_CLIPBOARD, () => this.fileHandlingService.onCopyToClipboard());
    ipc.on(TAURI_EVENTS.SIGNAL.SAVE_TO_WORKSPACE, () => this.fileHandlingService.onSaveAspectModelToWorkspace());
    ipc.on(TAURI_EVENTS.SIGNAL.EXPORT_MODEL, () => this.fileHandlingService.onExportAsAspectModelFile());
    ipc.on(TAURI_EVENTS.SIGNAL.EXPORT_NAMESPACES, () => this.namespacesManagerService.onExportNamespaces());
    ipc.on(TAURI_EVENTS.SIGNAL.FILTER_MODEL_BY, (rule: ModelFilter) => this.filtersService.renderByFilter(rule));
    ipc.on(TAURI_EVENTS.SIGNAL.ZOOM_IN, () => this.editorService.zoomIn());
    ipc.on(TAURI_EVENTS.SIGNAL.ZOOM_OUT, () => this.editorService.zoomOut());
    ipc.on(TAURI_EVENTS.SIGNAL.ZOOM_TO_FIT, () => this.editorService.fit());
    ipc.on(TAURI_EVENTS.SIGNAL.ZOOM_TO_ACTUAL, () => this.editorService.actualSize());
    ipc.on(TAURI_EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT, () => this.shapeSettingsService.editSelectedCell());
    ipc.on(TAURI_EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT, () => this.editorService.deleteSelectedElements());
    ipc.on(TAURI_EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL, () => this.editorService.toggleExpand());
    ipc.on(TAURI_EVENTS.SIGNAL.FORMAT_MODEL, () => this.editorService.formatModel());
    ipc.on(TAURI_EVENTS.SIGNAL.CONNECT_ELEMENTS, () => this.shapeConnectorService.connectSelectedElements());
    ipc.on(TAURI_EVENTS.SIGNAL.VALIDATE_MODEL, () => this.fileHandlingService.onValidateFile());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION, () => this.generateHandlingService.onGenerateDocumentation());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION, () => this.generateHandlingService.onGenerateOpenApiSpec());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION, () => this.generateHandlingService.onGenerateAsyncApiSpec());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_AASX_XML, () => this.generateHandlingService.onGenerateAASXFile());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD, () => this.generateHandlingService.onGenerateJsonSample());
    ipc.on(TAURI_EVENTS.SIGNAL.GENERATE_JSON_SCHEMA, () => this.generateHandlingService.onGenerateJsonSchema());
  }
}
