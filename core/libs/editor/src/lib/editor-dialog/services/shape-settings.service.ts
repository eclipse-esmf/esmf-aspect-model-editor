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

import {Injectable, NgZone} from '@angular/core';
import {BaseMetaModelElement} from '@ame/meta-model';
import {
  mxEvent,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeSelectorService,
  mxUtils
} from '@ame/mx-graph';
import {BindingsService} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {EditorService} from '../../editor.service';
import {ShapeSettingsStateService} from './shape-settings-state.service';
import {OpenReferencedElementService} from '../../open-element-window/open-element-window.service';

const PURPLE_BLUE = '#448ee4';
const BLACK = 'black';

@Injectable({providedIn: 'root'})
export class ShapeSettingsService {
  public modelElement: BaseMetaModelElement = null;
  private shapesToHighlight: Array<mxgraph.mxCell> | null;

  constructor(
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private bindingsService: BindingsService,
    private editorService: EditorService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private openReferencedElementService: OpenReferencedElementService,
    private ngZone: NgZone
  ) {
  }

  setGraphListeners() {
    this.setMoveCellsListener();
    this.setFoldListener();
    this.setDblClickListener();
  }

  setContextMenuActions() {
    this.bindingsService.registerAction('editElement', () => this.ngZone.run(() => this.editSelectedCell()));
    this.bindingsService.registerAction('deleteElement', () => this.ngZone.run(() => this.editorService.deleteSelectedElements()));
  }

  setHotKeysActions() {
    this.editorService.bindAction(
      'deleteElement',
      mxUtils.bind(this, () => this.ngZone.run(() => this.editorService.deleteSelectedElements()))
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
      .addListener(mxEvent.CHANGE, selectionModel => this.ngZone.run(() => this.selectCells(selectionModel.cells)));
  }

  setMoveCellsListener() {
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.MOVE_CELLS,
      mxUtils.bind(this, () => {
        this.ngZone.run(() => this.mxGraphAttributeService.graph.resetEdgesOnMove = true);
      })
    );
  }

  setFoldListener() {
    this.mxGraphAttributeService.graph.addListener(mxEvent.FOLD_CELLS, () => this.ngZone.run(() => this.mxGraphService.formatShapes()));
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
    if (this.modelElement.isExternalReference() && !this.modelElement.isPredefined()) {
      this.openReferencedElementService.openReferencedElement(this.modelElement);
      return;
    }

    this.shapeSettingsStateService.openShapeSettings();
  }

  editModel(elementModel: BaseMetaModelElement) {
    this.shapeSettingsStateService.openShapeSettings();
    this.modelElement = elementModel;
  }

  selectCells(cells: Array<mxgraph.mxCell>) {
    if (this.shapesToHighlight) {
      this.mxGraphService.setStrokeColor(BLACK, this.shapesToHighlight);
    }

    if (!cells.length || cells.length >= 2) {
      return;
    }

    this.shapesToHighlight = [];
    const selectedCell = cells[0];

    if (!selectedCell.isEdge()) {
      this.shapesToHighlight.push(...this.mxGraphAttributeService.graph.getOutgoingEdges(selectedCell));
      const elementShapes = this.shapesToHighlight.filter(edge => MxGraphHelper.getModelElement(edge.target)).map(edge => edge.target);
      this.shapesToHighlight.push(...elementShapes);
      this.mxGraphService.setStrokeColor(PURPLE_BLUE, this.shapesToHighlight);
    }

    // this.changeDetector.detectChanges();
  }
}
