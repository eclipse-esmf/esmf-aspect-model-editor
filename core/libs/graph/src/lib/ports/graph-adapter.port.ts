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

export abstract class GraphAdapterPort {
  abstract updateCell(cell: any, form?: any): void;
  abstract deleteAspectCell(cell: any): void;
  abstract deleteEntityValueCell(cell: any): void;
  abstract removeCells(cells: any[]): void;
  abstract resolveCellByModelElement(element: any): any;
  abstract resolveParents(cell: any): any[];
  abstract getIncomingEdges(cell: any): any[];
  abstract getOutgoingEdges(cell: any): any[];
  abstract getChildVertices(parent?: any): any[];
  abstract getDefaultParent(): any;
  abstract updateCellLabel(cell: any): void;
  abstract formatCell(cell: any): void;
  abstract formatShapes(force?: boolean): void;
  abstract updateCellThemeStyle(cell: any, element: any): void;
  abstract checkAndAddTopShapeActionIcon(edges: any[], element: any): void;
  abstract checkAndAddShapeActionIcon(edges: any[], element: any): void;
  abstract removeComplexTypeShapeOverlays(cell: any): void;
  abstract addBottomShapeOverlay(cell: any): void;
  abstract removeOverlay(cell: any, overlay: any): void;
  abstract getTopOverlayButton(cell: any): any;
  abstract updateEntityValuesWithCellReference(cells: any[]): void;
  abstract isEntityCycleInheritance(cell: any, element: any): boolean;
  abstract setCellPropertiesLabel(cell: any): void;
  abstract setElementFilterNode(cell: any, changedMetaModel: any): void;
  abstract reconnectTraitShape(source: any, target: any, sourceModel: any, targetModel: any, modelInfo: any): void;
  abstract getVisibleModelElements(): any[];
  abstract connectOperationProperty(operationCell: any, property: any, isInput: boolean): void;
  abstract getAllCells(): any[];
  abstract containsCell(cell: any): boolean;
  abstract findObsoleteEntityValueCells(enumerationEntityEdge: any): any[];
  abstract notifyGraphModelChanged(): void;
}
