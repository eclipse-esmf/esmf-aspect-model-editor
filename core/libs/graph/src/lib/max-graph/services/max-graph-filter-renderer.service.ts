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

import {LoadedFilesService} from '@ame/infrastructure';
import {
  EDITOR_VALIDATION_SERVICE,
  IEditorValidationService,
  IGraphFilterRenderer,
  ISammLanguageSettingsService,
  LanguageTranslationService,
  LoadingScreenService,
  SAMM_LANGUAGE_SETTINGS_SERVICE,
} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {of, switchMap} from 'rxjs';
import {MaxGraphHelper} from '../helpers/max-graph-helper';
import {MaxGraphRenderer} from '../renderers/max-graph-renderer';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphShapeOverlayService} from './max-graph-shape-overlay.service';
import {MaxGraphService} from './max-graph.service';

@Injectable({providedIn: 'root'})
export class MaxGraphFilterRendererService implements IGraphFilterRenderer {
  private readonly maxGraphService = inject(MaxGraphService);
  private readonly maxGraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly sammLanguageSettingsService: ISammLanguageSettingsService = inject(SAMM_LANGUAGE_SETTINGS_SERVICE);
  private readonly maxGraphAttributeService = inject(MaxGraphAttributeService);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly loadingScreen = inject(LoadingScreenService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly editorService = inject<IEditorValidationService>(EDITOR_VALIDATION_SERVICE, {optional: true});

  getSelectedModelElement(): any {
    const selectedCell = this.maxGraphService.graph.selectionModel.cells?.[0];
    return selectedCell ? MaxGraphHelper.getModelElement(selectedCell) : null;
  }

  renderFilteredTree(filteredElements: any[], filter: any, selectedModelElement: any): void {
    this.loadingScreen
      .open({
        title: this.translate.language.loadingScreenDialog.filterChange,
        content: this.translate.language.loadingScreenDialog.filterWait,
      })
      .afterOpened()
      .pipe(
        switchMap(() => {
          MaxGraphHelper.filterMode = filter;
          const maxgraphRenderer = new MaxGraphRenderer(
            this.maxGraphService,
            this.maxGraphShapeOverlayService,
            this.sammLanguageSettingsService,
            this.loadedFilesService?.currentLoadedFile?.rdfModel,
          );

          this.maxGraphService.deleteAllShapes();

          return this.maxGraphService.updateGraph(() => {
            for (const elementTree of filteredElements) {
              maxgraphRenderer.render(elementTree, null);
            }

            if (this.maxGraphAttributeService.inCollapsedMode) {
              this.maxGraphService.foldCells();
            }
          });
        }),
        switchMap(() => {
          this.maxGraphService.formatShapes(true);
          const selectedCell = selectedModelElement && this.maxGraphService.resolveCellByModelElement(selectedModelElement);
          if (selectedCell) this.maxGraphService.navigateToCellByUrn(selectedModelElement.aspectModelUrn);

          return this.editorService ? this.editorService.validate() : of(null);
        }),
      )
      .subscribe(() => {
        localStorage.removeItem('validating');
        this.loadingScreen.close();
      });
  }
}
