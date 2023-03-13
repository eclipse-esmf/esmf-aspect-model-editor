/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {mxgraph} from 'mxgraph-factory';
import {Injectable} from '@angular/core';
import {MxGraphAttributeService} from '.';
import {MxGraphHelper} from '../helpers';
import {DefaultConstraint, DefaultTrait} from '@ame/meta-model';

@Injectable()
export class MxGraphShapeSelectorService {
  constructor(private mxGraphAttributeService: MxGraphAttributeService) {}
  /**
   * @returns array of selected cells
   */
  public getSelectedCells(): Array<mxgraph.mxCell> {
    const tempCurrentSelection = []; // used to keep track of already selected cells to prevent infinite loop
    // only return the parent elements in case of child cells
    const selectedElementCells: Array<mxgraph.mxCell> = [];
    this.mxGraphAttributeService.graph.selectionModel.cells.forEach((cell: mxgraph.mxCell) => {
      if (cell.style?.includes('_property')) {
        const parentCell: mxgraph.mxCell = cell.getParent();
        if (!selectedElementCells.includes(parentCell)) {
          selectedElementCells.push(parentCell);
          tempCurrentSelection.push(parentCell);
        }
      } else if (!selectedElementCells.includes(cell)) {
        selectedElementCells.push(cell);
        tempCurrentSelection.push(cell);
      }
    });
    // external references will cascade to the upper external references
    let withExternalSelectedElementCells = [];
    selectedElementCells.forEach((cell: mxgraph.mxCell) => {
      withExternalSelectedElementCells.push(cell);
      const modelElement = MxGraphHelper.getModelElement(cell);
      if (modelElement?.isExternalReference()) {
        withExternalSelectedElementCells = [
          ...withExternalSelectedElementCells,
          ...this.getExternalUpperReferenceCells(cell, tempCurrentSelection),
        ];
      }
    });
    // remove duplicates
    return [...new Set(withExternalSelectedElementCells)];
  }

  public getSelectedShape(): mxgraph.mxCell {
    const selectedCell = this.getSelectedCells()?.[0];
    if (selectedCell) {
      return !MxGraphHelper.getModelElement(selectedCell) ? selectedCell.getParent() : selectedCell;
    }

    return null;
  }

  /**
   *
   * @returns aspect cell for current instance
   */
  public getAspectCell(): mxgraph.mxCell {
    return this.mxGraphAttributeService.graph.getDefaultParent().getChildCount() > 0
      ? this.mxGraphAttributeService.graph.getDefaultParent().children[0]
      : null;
  }

  private getExternalUpperReferenceCells(cell: mxgraph.mxCell, currentSelection: mxgraph.mxCell[]): mxgraph.mxCell[] {
    let upperCells = [];
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    incomingEdges.forEach((edge: mxgraph.mxCell) => {
      const source = edge.source;
      const sourceModelElement = MxGraphHelper.getModelElement(source);
      if (sourceModelElement.isExternalReference() && !currentSelection.includes(source)) {
        upperCells.push(source);
        currentSelection.push(source);
        upperCells = [...upperCells, ...this.getExternalUpperReferenceCells(source, currentSelection)];
      }
    });
    if (MxGraphHelper.getModelElement(cell) instanceof DefaultTrait) {
      const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
      outgoingEdges.forEach((edge: mxgraph.mxCell) => {
        const target = edge.target;
        const targetModelElement = MxGraphHelper.getModelElement(target);
        if (targetModelElement.isExternalReference() && targetModelElement instanceof DefaultConstraint) {
          upperCells.push(target);
          currentSelection.push(cell);
        }
      });
    }
    return upperCells;
  }
}
