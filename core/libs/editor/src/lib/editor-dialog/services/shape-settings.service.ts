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
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeSelectorService, mxEvent, mxUtils} from '@ame/mx-graph';
import {BindingsService} from '@ame/shared';
import {Injectable, NgZone} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {BehaviorSubject} from 'rxjs';
import {EditorService} from '../../editor.service';
import {OpenReferencedElementService} from '../../open-element-window/open-element-window.service';
import {ShapeSettingsStateService} from './shape-settings-state.service';

@Injectable({providedIn: 'root'})
export class ShapeSettingsService {
  public modelElement: NamedElement = null;

  private selectedCellsSubject = new BehaviorSubject([]);
  public selectedCells$ = this.selectedCellsSubject.asObservable();

  constructor(
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private bindingsService: BindingsService,
    private editorService: EditorService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private openReferencedElementService: OpenReferencedElementService,
    public loadedFiles: LoadedFilesService,
    private ngZone: NgZone,
  ) {}

  setGraphListeners() {
    this.setMoveCellsListener();
    this.setFoldListener();
    this.setDblClickListener();
    this.setSelectCellListener();
  }

  setContextMenuActions() {
    this.bindingsService.registerAction('editElement', () => this.editSelectedCell());
    this.bindingsService.registerAction('deleteElement', () => this.editorService.deleteSelectedElements());
  }

  setHotKeysActions() {
    this.editorService.bindAction(
      'deleteElement',
      mxUtils.bind(this, () => this.ngZone.run(() => this.editorService.deleteSelectedElements())),
    );

    this.mxGraphService.graph.container.addEventListener('wheel', evt => {
      if (evt.altKey) {
        evt.preventDefault();
      }
    });
  }

  setSelectCellListener() {
    this.mxGraphAttributeService.graph
      .getSelectionModel()
      .addListener(mxEvent.CHANGE, selectionModel => this.ngZone.run(() => this.selectedCellsSubject.next(selectionModel.cells)));
  }

  setMoveCellsListener() {
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.MOVE_CELLS,
      mxUtils.bind(this, () => {
        this.ngZone.run(() => (this.mxGraphAttributeService.graph.resetEdgesOnMove = true));
      }),
    );
  }

  setFoldListener() {
    this.mxGraphAttributeService.graph.addListener(mxEvent.FOLD_CELLS, () => this.mxGraphService.formatShapes());
  }

  setDblClickListener() {
    this.mxGraphAttributeService.graph.addListener(mxEvent.DOUBLE_CLICK, () => this.ngZone.run(() => this.editSelectedCell()));
  }

  unselectShapeForUpdate() {
    this.shapeSettingsStateService.selectedShapeForUpdate = null;
  }

  editSelectedCell() {
    this.shapeSettingsStateService.selectedShapeForUpdate = this.mxGraphShapeSelectorService.getSelectedShape();
    const selectedElement = this.shapeSettingsStateService.selectedShapeForUpdate;

    if (!selectedElement || selectedElement?.isEdge()) {
      this.shapeSettingsStateService.selectedShapeForUpdate = null;
      return;
    }

    this.modelElement = MxGraphHelper.getModelElement(selectedElement);
    if (this.loadedFiles.isElementExtern(this.modelElement) && !this.modelElement.isPredefined) {
      this.openReferencedElementService.openReferencedElement(this.modelElement);
      return;
    }

    this.shapeSettingsStateService.openShapeSettings();
  }

  editModel(elementModel: NamedElement) {
    this.shapeSettingsStateService.openShapeSettings();
    this.modelElement = elementModel;
  }
}
