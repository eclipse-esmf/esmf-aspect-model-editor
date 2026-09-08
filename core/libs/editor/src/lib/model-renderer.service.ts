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
import {FiltersService} from '@ame/loader-filters';
import {
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphRenderer,
  MaxGraphService,
  MaxGraphSetupService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService, NotificationsService, ValidateStatus} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Observable, catchError, delay, filter, first, switchMap, tap, throwError} from 'rxjs';
import {ShapeSettingsService} from './editor-dialog';
import {LargeFileWarningService} from './large-file-warning-dialog/large-file-warning-dialog.service';

@Injectable({providedIn: 'root'})
export class ModelRendererService {
  private destroyRef = inject(DestroyRef);
  private maxgraphService = inject(MaxGraphService);
  private largeFileWarningService = inject(LargeFileWarningService);
  private loadingScreenService = inject(LoadingScreenService);
  private filtersService = inject(FiltersService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private maxgraphSetupService = inject(MaxGraphSetupService);
  private translate = inject(LanguageTranslationService);
  private loadedFilesService = inject(LoadedFilesService);
  private notificationsService = inject(NotificationsService);
  private maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private sammLanguageSettingsService = inject(SammLanguageSettingsService);

  private get rdfModel() {
    return this.loadedFilesService.currentLoadedFile?.rdfModel;
  }

  private get cachedFile() {
    return this.loadedFilesService.currentLoadedFile?.cachedFile;
  }

  renderModel(editElementUrn?: string) {
    this.maxgraphService.deleteAllShapes();

    try {
      const maxgraphRenderer = new MaxGraphRenderer(
        this.maxgraphService,
        this.maxgraphShapeOverlayService,
        this.sammLanguageSettingsService,
        this.rdfModel,
      );

      const elements = this.cachedFile.getKeys().map(key => this.cachedFile.get<NamedElement>(key));
      return this.prepareGraphUpdate(maxgraphRenderer, elements, editElementUrn);
    } catch (error) {
      console.groupCollapsed('editor.service', error);
      console.groupEnd();
      return throwError(() => error);
    }
  }

  private prepareGraphUpdate(maxgraphRenderer: MaxGraphRenderer, elements: NamedElement[], editElementUrn?: string) {
    return this.largeFileWarningService.openDialog(elements.length).pipe(
      takeUntilDestroyed(this.destroyRef),
      first(),
      filter(response => response !== 'cancel'),
      tap(() => this.toggleLoadingScreen()),
      delay(500), // Wait for modal animation
      switchMap(() => this.graphUpdateWorkflow(maxgraphRenderer, elements)),
      tap(() => this.finalizeGraphUpdate(editElementUrn)),
      catchError(() => [this.loadingScreenService.close()]),
    );
  }

  private graphUpdateWorkflow(maxgraphRenderer: MaxGraphRenderer, elements: NamedElement[]): Observable<boolean> {
    return this.maxgraphService.updateGraph(() => {
      this.maxgraphService.firstTimeFold.set(true);
      MaxGraphHelper.filterMode = this.filtersService.currentFilter.filterType;
      const rootElements = elements.filter(e => !e.parents.length);
      const filtered = this.filtersService.filter(rootElements.length ? rootElements : elements);

      for (const elementTree of filtered) {
        maxgraphRenderer.render(elementTree, null);
      }

      if (this.maxgraphAttributeService.inCollapsedMode) {
        this.maxgraphService.foldCells();
      }
    });
  }

  private toggleLoadingScreen(): void {
    this.loadingScreenService.close();
    requestAnimationFrame(() => {
      this.loadingScreenService.open({title: this.translate.language.loadingScreenDialog.modelGeneration});
    });
  }

  private finalizeGraphUpdate(editElementUrn?: string): void {
    this.maxgraphService.formatShapes(true);
    this.handleEditOrCenterView(editElementUrn);
    localStorage.removeItem(ValidateStatus.validating);
    this.loadingScreenService.close();
  }

  private handleEditOrCenterView(editElementUrn: string | null): void {
    if (editElementUrn) {
      this.editModelByUrn(editElementUrn);
      this.maxgraphService.navigateToCellByUrn(editElementUrn);
    } else {
      this.maxgraphSetupService.centerGraph();
    }
  }

  private editModelByUrn(elementUrn: string) {
    const element = this.cachedFile?.get<NamedElement>(elementUrn);
    if (!element) {
      this.notificationsService.error({
        title: this.translate.language.editorCanvas.shapeSetting.notification.editViewUnavailable,
        message: this.translate.language.editorCanvas.shapeSetting.notification.editViewUnavailableMessage,
      });

      return;
    }

    this.shapeSettingsService.editModel(element);
  }
}
