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

import {InjectionToken} from '@angular/core';

export interface IGraphAdapter {
  updateCell(cell: any): void;
  deleteAspectCell(cell: any): void;
  deleteEntityValueCell(cell: any): void;
  removeCells(cells: any[]): void;
  resolveCellByModelElement(element: any): any;
  resolveParents(cell: any): any[];
  getIncomingEdges(cell: any): any[];
  getOutgoingEdges(cell: any): any[];
  getChildVertices(parent?: any): any[];
  getDefaultParent(): any;
  updateCellLabel(cell: any): void;
  formatCell(cell: any): void;
  formatShapes(force?: boolean): void;
  updateCellThemeStyle(cell: any, element: any): void;
  checkAndAddTopShapeActionIcon(edges: any[], element: any): void;
  checkAndAddShapeActionIcon(edges: any[], element: any): void;
  removeComplexTypeShapeOverlays(cell: any): void;
  addBottomShapeOverlay(cell: any): void;
  removeOverlay(cell: any, overlay: any): void;
  getTopOverlayButton(cell: any): any;
  updateEntityValuesWithCellReference(cells: any[]): void;
  isEntityCycleInheritance(cell: any, element: any): boolean;
  setCellPropertiesLabel(cell: any): void;
  setElementFilterNode(cell: any, changedMetaModel: any): void;
  reconnectTraitShape(source: any, target: any, sourceModel: any, targetModel: any, modelInfo: any): void;
  getVisibleModelElements(): any[];
  connectOperationProperty(operationCell: any, property: any, isInput: boolean): void;
  getAllCells(): any[];
  notifyGraphModelChanged(): void;
}

export const GRAPH_ADAPTER = new InjectionToken<IGraphAdapter>('GRAPH_ADAPTER');
