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
import {
  IGraphAdapter,
  ISammLanguageSettingsService,
  IShapeConnectorService,
  ModelInfo,
  SAMM_LANGUAGE_SETTINGS_SERVICE,
  SHAPE_CONNECTOR_SERVICE,
} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {MaxGraphHelper, MaxGraphVisitorHelper} from '../helpers';
import {ModelStyleResolver} from '../models/model-style';
import {ThemeService} from '../themes/theme.service';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphShapeOverlayService} from './max-graph-shape-overlay.service';
import {MaxGraphService} from './max-graph.service';
import {AspectRenderService} from './render-models/aspect-render.service';
import {EntityValueRenderService} from './render-models/entity-value-render.service';
import {ModelRenderService} from './render-models/model-render.service';

@Injectable({providedIn: 'root'})
export class MaxGraphDomainBridgeService implements IGraphAdapter {
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly modelRenderService = inject(ModelRenderService);
  private readonly aspectRenderService = inject(AspectRenderService);
  private readonly entityValueRenderService = inject(EntityValueRenderService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly themeService = inject(ThemeService, {optional: true});
  private readonly filtersService = inject(FiltersService, {optional: true});
  private readonly sammLangService = inject<ISammLanguageSettingsService>(SAMM_LANGUAGE_SETTINGS_SERVICE, {optional: true});
  private readonly shapeConnectorService = inject<IShapeConnectorService>(SHAPE_CONNECTOR_SERVICE, {optional: true});

  updateCell(cell: any): void {
    if (cell) {
      this.modelRenderService.update(cell);
    }
  }

  deleteAspectCell(cell: any): void {
    if (cell) {
      this.aspectRenderService.delete(cell);
    }
  }

  deleteEntityValueCell(cell: any): void {
    if (cell) {
      this.entityValueRenderService.delete(cell);
    }
  }

  removeCells(cells: any[]): void {
    if (cells?.length) {
      this.maxgraphService.removeCells(cells);
    }
  }

  resolveCellByModelElement(element: any): any {
    return element ? this.maxgraphService.resolveCellByModelElement(element) : null;
  }

  resolveParents(cell: any): any[] {
    return cell ? this.maxgraphService.resolveParents(cell) || [] : [];
  }

  getIncomingEdges(cell: any): any[] {
    if (!cell) {
      return [];
    }
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    return graph ? graph.getIncomingEdges(cell, null) || [] : [];
  }

  getOutgoingEdges(cell: any): any[] {
    if (!cell) {
      return [];
    }
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    return graph ? graph.getOutgoingEdges(cell, null) || [] : [];
  }

  getChildVertices(parent?: any): any[] {
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    if (!graph) {
      return [];
    }
    return graph.getChildVertices(parent ?? graph.getDefaultParent()) || [];
  }

  getDefaultParent(): any {
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    return graph ? graph.getDefaultParent() : null;
  }

  updateCellLabel(cell: any): void {
    if (cell && this.maxgraphService.graph && this.sammLangService) {
      MaxGraphHelper.updateLabel(cell, this.maxgraphService.graph, this.sammLangService);
    }
  }

  formatCell(cell: any): void {
    if (cell) {
      this.maxgraphService.formatCell(cell);
    }
  }

  formatShapes(force?: boolean): void {
    this.maxgraphService.formatShapes(force);
  }

  updateCellThemeStyle(cell: any, element: any): void {
    if (cell && element && this.themeService && this.maxgraphService.graph) {
      const style = this.themeService.generateThemeStyle(ModelStyleResolver.resolve(element));
      this.maxgraphService.graph.setCellStyle(style, [cell]);
    }
  }

  checkAndAddTopShapeActionIcon(edges: any[], element: any): void {
    if (edges && element) {
      this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(edges, element);
    }
  }

  checkAndAddShapeActionIcon(edges: any[], element: any): void {
    if (edges && element) {
      this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(edges, element);
    }
  }

  removeComplexTypeShapeOverlays(cell: any): void {
    if (cell) {
      this.maxgraphShapeOverlayService.removeComplexTypeShapeOverlays(cell);
    }
  }

  addBottomShapeOverlay(cell: any): void {
    if (cell) {
      this.maxgraphShapeOverlayService.addBottomShapeOverlay(cell);
    }
  }

  removeOverlay(cell: any, overlay: any): void {
    if (cell && overlay) {
      this.maxgraphShapeOverlayService.removeOverlay(cell, overlay);
    }
  }

  getTopOverlayButton(cell: any): any {
    return cell ? MaxGraphHelper.getTopOverlayButton(cell) : null;
  }

  updateEntityValuesWithCellReference(cells: any[]): void {
    if (cells?.length) {
      this.maxgraphService.updateEntityValuesWithCellReference(cells);
    }
  }

  isEntityCycleInheritance(cell: any, element: any): boolean {
    if (!cell || !element || !this.maxgraphService.graph) {
      return false;
    }
    return MaxGraphHelper.isEntityCycleInheritance(cell, element, this.maxgraphService.graph);
  }

  setCellPropertiesLabel(cell: any): void {
    if (!cell) {
      return;
    }
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    if (cell['configuration'] && this.sammLangService) {
      cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(MaxGraphHelper.getModelElement(cell), this.sammLangService);
    }
    if (graph) {
      graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
    }
  }

  setElementFilterNode(cell: any, changedMetaModel: any): void {
    if (cell && this.filtersService) {
      MaxGraphHelper.setElementNode(cell, this.filtersService.createNode(changedMetaModel));
    }
  }

  reconnectTraitShape(source: any, target: any, sourceModel: any, targetModel: any, modelInfo: any): void {
    const newConnection = this.shapeConnectorService?.connectShapes(sourceModel, targetModel, source, target, modelInfo);
    if (newConnection) {
      this.maxgraphShapeOverlayService.removeOverlay(target, MaxGraphHelper.getTopOverlayButton(target));
      this.maxgraphShapeOverlayService.removeOverlaysByConnection(sourceModel, source);
      this.maxgraphShapeOverlayService.addTopShapeOverlay(target);
      if (
        targetModel instanceof DefaultCharacteristic &&
        sourceModel instanceof DefaultProperty &&
        !(targetModel.dataType instanceof DefaultEntity)
      ) {
        this.maxgraphShapeOverlayService.addBottomShapeOverlay(target);
      }
      this.maxgraphService.formatShapes();
    }
  }

  getVisibleModelElements(): any[] {
    const graph = this.maxgraphAttributeService?.graph || this.maxgraphService?.graph;
    if (!graph) {
      return [];
    }
    const vertices = graph.getChildVertices(graph.getDefaultParent()) || [];
    return vertices.map(cell => MaxGraphHelper.getModelElement(cell)).filter(Boolean);
  }

  connectOperationProperty(operationCell: any, property: any, isInput: boolean): void {
    if (!operationCell || !property) {
      return;
    }
    const operation = MaxGraphHelper.getModelElement(operationCell);
    const resolvedCell = this.maxgraphService.resolveCellByModelElement(property);
    const propertyCell = resolvedCell
      ? resolvedCell
      : this.maxgraphService.renderModelElement(this.filtersService?.createNode(property, {parent: operation}));
    const modelInfo = isInput ? ModelInfo.IS_OPERATION_INPUT : ModelInfo.IS_OPERATION_OUTPUT;
    this.shapeConnectorService?.connectShapes(operation, property, operationCell, propertyCell, modelInfo);
  }

  getAllCells(): any[] {
    return this.maxgraphService?.getAllCells() || [];
  }

  notifyGraphModelChanged(): void {
    this.maxgraphService?.graphModelChanged$?.next?.();
  }
}
