/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphSetupService,
  MxGraphShapeOverlayService,
} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService, NotificationsService, ValidateStatus} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Observable, catchError, delay, filter, first, switchMap, tap, throwError} from 'rxjs';
import {ShapeSettingsService} from './editor-dialog';
import {LargeFileWarningService} from './large-file-warning-dialog/large-file-warning-dialog.service';

@Injectable({providedIn: 'root'})
export class ModelRendererService {
  private mxGraphService = inject(MxGraphService);
  private mxGraphShapeOverlayService = inject(MxGraphShapeOverlayService);
  private sammLangService = inject(SammLanguageSettingsService);
  private largeFileWarningService = inject(LargeFileWarningService);
  private loadingScreenService = inject(LoadingScreenService);
  private filtersService = inject(FiltersService);
  private mxGraphAttributeService = inject(MxGraphAttributeService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private mxGraphSetupService = inject(MxGraphSetupService);
  private translate = inject(LanguageTranslationService);
  private loadedFilesService = inject(LoadedFilesService);
  private notificationsService = inject(NotificationsService);

  private get rdfModel() {
    return this.loadedFilesService.currentLoadedFile?.rdfModel;
  }

  private get cachedFile() {
    return this.loadedFilesService.currentLoadedFile?.cachedFile;
  }

  renderModel(editElementUrn?: string) {
    this.mxGraphService.deleteAllShapes();

    try {
      const mxGraphRenderer = new MxGraphRenderer(
        this.mxGraphService,
        this.mxGraphShapeOverlayService,
        this.sammLangService,
        this.rdfModel,
      );

      const elements = this.cachedFile.getKeys().map(key => this.cachedFile.get<NamedElement>(key));
      return this.prepareGraphUpdate(mxGraphRenderer, elements, editElementUrn);
    } catch (error) {
      console.groupCollapsed('editor.service', error);
      console.groupEnd();
      return throwError(() => error);
    }
  }

  private prepareGraphUpdate(mxGraphRenderer: MxGraphRenderer, elements: NamedElement[], editElementUrn?: string) {
    return this.largeFileWarningService.openDialog(elements.length).pipe(
      first(),
      filter(response => response !== 'cancel'),
      tap(() => this.toggleLoadingScreen()),
      delay(500), // Wait for modal animation
      switchMap(() => this.graphUpdateWorkflow(mxGraphRenderer, elements)),
      tap(() => this.finalizeGraphUpdate(editElementUrn)),
      catchError(() => [this.loadingScreenService.close()]),
    );
  }

  private graphUpdateWorkflow(mxGraphRenderer: MxGraphRenderer, elements: NamedElement[]): Observable<boolean> {
    return this.mxGraphService.updateGraph(() => {
      this.mxGraphService.firstTimeFold = true;
      MxGraphHelper.filterMode = this.filtersService.currentFilter.filterType;
      const rootElements = elements.filter(e => !e.parents.length);
      const filtered = this.filtersService.filter(rootElements.length ? rootElements : elements);

      for (const elementTree of filtered) {
        mxGraphRenderer.render(elementTree, null);
      }

      if (this.mxGraphAttributeService.inCollapsedMode) {
        this.mxGraphService.foldCells();
      }
    });
  }

  private toggleLoadingScreen(): void {
    this.loadingScreenService.close();
    requestAnimationFrame(() => {
      this.loadingScreenService.open({title: this.translate.language.LOADING_SCREEN_DIALOG.MODEL_GENERATION});
    });
  }

  private finalizeGraphUpdate(editElementUrn?: string): void {
    this.mxGraphService.formatShapes(true);
    this.handleEditOrCenterView(editElementUrn);
    localStorage.removeItem(ValidateStatus.validating);
    this.loadingScreenService.close();
  }

  private handleEditOrCenterView(editElementUrn: string | null): void {
    if (editElementUrn) {
      this.editModelByUrn(editElementUrn);
      this.mxGraphService.navigateToCellByUrn(editElementUrn);
    } else {
      this.mxGraphSetupService.centerGraph();
    }
  }

  private editModelByUrn(elementUrn: string) {
    const element = this.cachedFile?.get<NamedElement>(elementUrn);
    if (!element) {
      this.notificationsService.error({
        title: this.translate.language.EDITOR_CANVAS.SHAPE_SETTING.NOTIFICATION.EDIT_VIEW_UNAVAILABLE,
        message: this.translate.language.EDITOR_CANVAS.SHAPE_SETTING.NOTIFICATION.EDIT_VIEW_UNAVAILABLE_MESSAGE,
      });

      return;
    }

    this.shapeSettingsService.editModel(element);
  }
}
