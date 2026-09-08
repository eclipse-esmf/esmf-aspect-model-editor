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
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeSelectorService} from '@ame/max-graph';
import {BindingsService} from '@ame/shared';
import {computed, inject, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {NamedElement} from '@esmf/aspect-model-loader';
import {InternalEvent} from '@maxgraph/core';
import {EditorService} from '../../editor.service';
import {OpenReferencedElementService} from '../../open-element-window/open-element-window.service';
import {ShapeSettingsStateService} from './shape-settings-state.service';

@Injectable({providedIn: 'root'})
export class ShapeSettingsService {
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private maxgraphService = inject(MaxGraphService);
  private maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private bindingsService = inject(BindingsService);
  private editorService = inject(EditorService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private openReferencedElementService = inject(OpenReferencedElementService);
  private loadedFiles = inject(LoadedFilesService);

  private readonly _modelElement = signal<NamedElement | null>(null);
  public readonly modelElement = this._modelElement.asReadonly();

  public readonly selectedCells$ = toObservable(this.maxgraphShapeSelectorService.selectedCells);
  public readonly hasCellsSubject$ = toObservable(computed(() => !this.maxgraphService.isModelEmpty()));

  setGraphListeners() {
    this.setMoveCellsListener();
    this.setFoldListener();
    this.setDblClickListener();
  }

  setContextMenuActions() {
    this.bindingsService.registerAction('editElement', () => this.editSelectedCell());
    this.bindingsService.registerAction('deleteElement', () => this.editorService.deleteSelectedElements());
  }

  setHotKeysActions() {
    this.maxgraphService.graph.container.addEventListener('wheel', evt => {
      if (evt.altKey) {
        evt.preventDefault();
      }
    });
  }

  setMoveCellsListener() {
    this.maxgraphAttributeService.graph.addListener(InternalEvent.MOVE_CELLS, () => {
      this.maxgraphAttributeService.graph.resetEdgesOnMove = true;
    });
  }

  setFoldListener() {
    this.maxgraphAttributeService.graph.addListener(InternalEvent.FOLD_CELLS, () => this.maxgraphService.formatShapes());
  }

  setDblClickListener() {
    this.maxgraphAttributeService.graph.addListener(InternalEvent.DOUBLE_CLICK, () => this.editSelectedCell());
  }

  unselectShapeForUpdate() {
    this.shapeSettingsStateService.setSelectedShapeForUpdate(null);
  }

  editSelectedCell() {
    this.shapeSettingsStateService.setSelectedShapeForUpdate(this.maxgraphShapeSelectorService.getSelectedShape());
    const selectedElement = this.shapeSettingsStateService.selectedShapeForUpdate();

    if (!selectedElement || selectedElement?.isEdge()) {
      this.shapeSettingsStateService.setSelectedShapeForUpdate(null);
      return;
    }

    const modelElem = MaxGraphHelper.getModelElement(selectedElement);
    this._modelElement.set(modelElem);
    if (this.loadedFiles.isElementExtern(modelElem) && !modelElem.isPredefined) {
      this.openReferencedElementService.openReferencedElement(modelElem);
      return;
    }

    this.shapeSettingsStateService.openShapeSettings();
  }

  editModel(elementModel: NamedElement) {
    this.shapeSettingsStateService.openShapeSettings();
    this._modelElement.set(elementModel);
  }
}
