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
import {ShapeConnectorService} from '@ame/connection';
import {FiltersService, ModelTree} from '@ame/loader-filters';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {BrowserService} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {AlignValue, Cell, CellOverlay, Geometry, ImageBox, InternalEvent} from '@maxgraph/core';
import {MaxGraphAttributeService, MaxGraphShapeSelectorService} from '.';
import {MaxGraphHelper, MaxGraphVisitorHelper, ShapeAttribute} from '../helpers';
import {ModelInfo} from '../models';

@Injectable({providedIn: 'root'})
export class MaxGraphShapeOverlayService {
  private readonly injector = inject(Injector);
  private readonly browserService = inject(BrowserService);
  private readonly maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly filtersService = inject(FiltersService);
  private readonly sammLangService = inject(SammLanguageSettingsService);
  protected readonly loadedFilesService = inject(LoadedFilesService);

  removeOverlay(cell: Cell, overlay?: CellOverlay): void {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (overlay) {
      this.maxgraphAttributeService.graph.removeCellOverlay(cell, overlay);
    } else {
      if (!(modelElement instanceof DefaultCharacteristic)) {
        this.maxgraphAttributeService.graph.removeCellOverlay(cell, null);
      }
    }
  }

  /**
   * Adds the available connection/s for a cell, marked by a + sign.
   *
   * @param cell maxgraph element
   */
  addTopShapeOverlay(cell: Cell): void {
    if (!cell || !cell.geometry) return;
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!modelElement) return;

    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (modelElement instanceof DefaultEither) return;
    if (!cell.style?.baseStyleNames?.includes('characteristic')) return;

    const overlay = this.createIconShapeOverlay('add-outline-frame', 'Add Trait');
    overlay.align = 'center';
    overlay.verticalAlign = 'top';
    overlay.offset.x += (cell.geometry.width || 0) / 8;
    this.addShapeOverlayListener(overlay, cell, ModelInfo.IS_CHARACTERISTIC);
  }

  /**
   * Removes the connection of the specified cell and changes the internal model to reflect the change
   *
   * @param element internal model
   * @param cell maxgraph element
   */
  removeOverlaysByConnection(element: NamedElement, cell: Cell): void {
    if (element instanceof DefaultAspect) return;
    if (element instanceof DefaultEnumeration) return;

    if (element instanceof DefaultProperty && element.characteristic) {
      this.removeOverlay(cell, MaxGraphHelper.getNewShapeOverlayButton(cell));
    } else {
      if (element instanceof DefaultCharacteristic && !(element instanceof DefaultEither)) {
        this.removeCharacteristicOverlays(cell);
      }
    }
  }

  createIconShapeOverlay(svgFileName: string, tooltip: string): CellOverlay {
    const src = `${this.browserService.getAssetBasePath()}/config/editor/img/${svgFileName}.svg`;
    const image = new ImageBox(src, 20, 20);
    const overlay = new CellOverlay(image, tooltip);
    overlay.cursor = 'hand';
    return overlay;
  }

  private createAndConnectShape(cell: Cell, modelInfo: ModelInfo): void {
    const maxgraphConnectorService = this.injector.get(ShapeConnectorService);

    const modelElement = MaxGraphHelper.getModelElement(this.maxgraphShapeSelectorService.getSelectedShape());
    maxgraphConnectorService.createAndConnectShape(modelElement, cell, modelInfo);

    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    this.maxgraphAttributeService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);

    this.removeOverlaysByConnection(modelElement, cell);
    this.maxgraphAttributeService.graph.clearSelection();
  }

  private addShapeAction(cell: Cell, event: MouseEvent, modelInfo: ModelInfo): void {
    this.maxgraphAttributeService.graph.selectCellForEvent(cell, event);
    this.createAndConnectShape(cell, modelInfo);
  }

  private removeCharacteristicOverlays(cell: Cell): void {
    const graph = this.maxgraphAttributeService.graph;
    const outgoingEdges = graph.getOutgoingEdges(cell, null);
    const incomingEdges = graph.getIncomingEdges(cell, null);
    let characteristic;

    // remove Add Trait when you first create a treat from a characteristic
    if (MaxGraphHelper.getModelElement(incomingEdges?.[0]?.source) instanceof DefaultTrait) {
      characteristic = incomingEdges[0].target;
      this.removeOverlay(characteristic, MaxGraphHelper.getTopOverlayButton(characteristic));
    }

    // remove Add Trait overlay when the connection trait to characteristic is done manually
    characteristic = outgoingEdges.find(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultCharacteristic)?.target;
    if (characteristic) {
      this.removeOverlay(characteristic, MaxGraphHelper.getTopOverlayButton(characteristic));
    }

    // remove Add Entity if Entity already in place
    if (
      !(MaxGraphHelper.getModelElement(cell) instanceof DefaultEnumeration) &&
      outgoingEdges.some(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultEntity)
    ) {
      characteristic = outgoingEdges[0].source;
      const overlay = MaxGraphHelper.getNewShapeOverlayButton(characteristic);
      if (overlay) {
        this.removeOverlay(characteristic, overlay);
      }
    }
  }

  /**
   * Adds connector element on the bottom of a shape
   *
   * @param cell maxgraph element
   */
  addBottomShapeOverlay(cell: Cell): void {
    if (!cell || !cell.geometry) return;
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!modelElement) return;

    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (modelElement?.isPredefined) return;
    if ([DefaultConstraint, DefaultEntityInstance, DefaultUnit, DefaultValue].some(c => modelElement instanceof c)) return;

    const elementOffset = 40;

    if (modelElement instanceof DefaultEither) {
      this.createConnectorElement('Left Characteristic', cell, ModelInfo.IS_EITHER_LEFT, -elementOffset, 'arrow-left-frame', 'left');

      this.createConnectorElement('Right Characteristic', cell, ModelInfo.IS_EITHER_RIGHT, elementOffset, 'arrow-right-frame', 'right');

      return;
    }

    if (modelElement instanceof DefaultOperation) {
      this.createConnectorElement('Input Property', cell, ModelInfo.IS_OPERATION_INPUT, -elementOffset, 'arrow-up-frame', 'left');

      this.createConnectorElement('Output Property', cell, ModelInfo.IS_OPERATION_OUTPUT, elementOffset, 'arrow-down-frame', 'right');

      return;
    }

    if (
      modelElement instanceof DefaultAspect ||
      modelElement instanceof DefaultEntity ||
      modelElement instanceof DefaultStructuredValue ||
      modelElement instanceof DefaultEvent
    ) {
      return this.createConnectorElement('Property', cell, ModelInfo.IS_CHARACTERISTIC);
    }

    if (modelElement instanceof DefaultEntity && modelElement.isAbstractEntity()) {
      return this.createConnectorElement('Abstract Property', cell, ModelInfo.IS_CHARACTERISTIC);
    }

    if (modelElement instanceof DefaultProperty) {
      return this.createConnectorElement('Characteristic', cell, ModelInfo.IS_CHARACTERISTIC);
    }

    if (modelElement instanceof DefaultTrait) {
      return this.createConnectorElement('Characteristic/Constraint', cell, ModelInfo.IS_CHARACTERISTIC);
    }

    if (modelElement instanceof DefaultCharacteristic) {
      const connectableElementName = MaxGraphHelper.isComplexEnumeration(modelElement) ? 'Entity Value' : 'Entity';
      return this.createConnectorElement(connectableElementName, cell, ModelInfo.IS_CHARACTERISTIC_DATATYPE);
    }

    return this.createConnectorElement('', cell, ModelInfo.IS_CHARACTERISTIC);
  }

  private createConnectorElement(
    connectableElementName: string,
    cell: Cell,
    modelInfo: ModelInfo,
    offset = 0,
    svgFileName = 'add-frame',
    align = 'center',
  ): void {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;

    const tooltipText = connectableElementName ? `Add ${connectableElementName}` : '';
    const overlay = this.createIconShapeOverlay(svgFileName, tooltipText);
    overlay.align = align as AlignValue;

    if (offset) {
      overlay.offset.x = overlay.offset.x - offset;
    }

    this.addShapeOverlayListener(overlay, cell, modelInfo);
  }

  private addShapeOverlayListener(overlay: CellOverlay, cell: Cell, modelInfo: ModelInfo): void {
    if (!cell || !overlay) return;
    overlay.addListener(InternalEvent.CLICK, (event: MouseEvent) => this.addShapeAction(cell, event, modelInfo));
    try {
      this.maxgraphAttributeService.graph.addCellOverlay(cell, overlay);
    } catch {
      // Cell may not have view state or is being removed
    }
  }

  /**
   * Checks and adds complex enumeration icon and + button for adding new entity value if special conditions are fulfilled.
   */
  checkComplexEnumerationOverlays(modelElement: NamedElement, cell: Cell): void {
    if (MaxGraphHelper.isComplexEnumeration(modelElement)) {
      this.addComplexEnumerationShapeOverlay(cell);
      this.addBottomShapeOverlay(cell);
    }
  }

  /**
   * Removes the available connection/s for a cell, on load
   *
   * @param modelElement internal model
   * @param cell maxgraph element
   */
  removeShapeActionIconsByLoading(modelElement: NamedElement, cell: Cell): void {
    if (modelElement instanceof DefaultEntity) return;

    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);

    if (modelElement instanceof DefaultCharacteristic) {
      this.removeOverlaysOnLoad(modelElement, incomingEdges);
      if (!MaxGraphHelper.isComplexEnumeration(modelElement) && modelElement.dataType instanceof DefaultEntity) {
        this.removeOverlay(cell, MaxGraphHelper.getNewShapeOverlayButton(cell));
      }
    }
    if (this.maxgraphAttributeService.inCollapsedMode && MaxGraphHelper.isComplexEnumeration(modelElement)) {
      this.removeOverlay(cell, MaxGraphHelper.getRightOverlayButton(cell));
    }
  }

  private removeOverlaysOnLoad(modelElement: DefaultCharacteristic, incomingEdges: Array<Cell>): void {
    const incomingEdge = incomingEdges.find((edge: Cell) => edge?.source?.overlays?.length);

    if (!incomingEdge) return;

    const incomingSourceModelElement = MaxGraphHelper.getModelElement(incomingEdge.source);
    const bottomOverlay = MaxGraphHelper.getNewShapeOverlayButton(incomingEdge.source);

    if (incomingSourceModelElement instanceof DefaultTrait) {
      const topOverlay = MaxGraphHelper.getTopOverlayButton(incomingEdges[0]?.target);
      this.removeOverlay(incomingEdge, bottomOverlay);
      this.removeOverlay(incomingEdges[0]?.target, topOverlay);
    } else if (!(incomingSourceModelElement instanceof DefaultCollection) && !(incomingSourceModelElement instanceof DefaultEither)) {
      if (bottomOverlay) {
        this.maxgraphAttributeService.graph.removeCellOverlay(incomingEdge.source, bottomOverlay);
      }
    }

    if (modelElement.isPredefined) {
      this.removeOverlay(incomingEdges[0]?.target, MaxGraphHelper.getNewShapeOverlayButton(incomingEdges[0]?.target));
    }
  }

  /**
   * Add icon in to maxGraph cell for complex data type enumerations
   */
  addComplexEnumerationShapeOverlay(cell: Cell): void {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (cell.isCollapsed()) return;

    const overlay = this.createIconShapeOverlay('batch', 'Complex data types Enumeration');
    overlay.align = 'right';
    overlay.verticalAlign = 'top';
    overlay.offset.x -= 15;
    overlay.offset.y += 15;

    this.maxgraphAttributeService.graph.addCellOverlay(cell, overlay);
  }

  removeComplexTypeShapeOverlays(cell: Cell): void {
    this.removeOverlay(cell, MaxGraphHelper.getRightOverlayButton(cell));
    this.removeOverlay(cell, MaxGraphHelper.getNewShapeOverlayButton(cell));
  }

  /**
   * Check if a redraw of the overlay is necessary whenever we change metaModel from or into Either.
   */
  changeEitherOverlay(cell: Cell): void {
    this.removeOverlay(cell);
    this.addBottomShapeOverlay(cell);
  }

  /**
   * Checks if we delete a trait and adds back the shape overlay for source characteristic
   */
  checkAndAddTopShapeActionIcon(outgoingEdges: Array<Cell>, modelElement: NamedElement): void {
    if (!outgoingEdges?.length) return;
    if (!(modelElement instanceof DefaultTrait)) return;
    if (!outgoingEdges[0]?.target) return;

    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(outgoingEdges[0].target, null) || [];
    const incomingCharacteristics = incomingEdges.filter(edge => {
      const modelElement = MaxGraphHelper.getModelElement(edge.source);
      return modelElement instanceof DefaultCharacteristic && !(modelElement instanceof DefaultEither);
    });

    if (incomingCharacteristics.length === 1) {
      this.addTopShapeOverlay(outgoingEdges[0].target);
    }
  }

  checkAndAddShapeActionIcon(incomingEdges: Array<Cell>, modelElement: NamedElement): void {
    if (!incomingEdges?.length) return;
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;

    if (modelElement instanceof DefaultCharacteristic) {
      incomingEdges.forEach(edge => {
        if (!edge?.source) return;
        const metaModelElement = MaxGraphHelper.getModelElement(edge.source);
        if (metaModelElement instanceof DefaultCollection) return;
        if (metaModelElement instanceof DefaultEither) return;

        this.addBottomShapeOverlay(edge.source);
      });
      return;
    }

    const isCharacteristicWithoutDataType = incomingEdges.some(
      edge => edge?.source && MaxGraphHelper.isCharacteristicWithoutDataType(edge.source),
    );
    // This will add back the + overlay for characteristic if we remove the entity and for property if we remove the characteristic
    if (modelElement instanceof DefaultProperty || isCharacteristicWithoutDataType) {
      incomingEdges.forEach(edge => {
        if (edge?.source) {
          this.addBottomShapeOverlay(edge.source);
        }
      });
    }
  }

  createShape(node: ModelTree<NamedElement>, geometry?: Geometry, cellConfiguration?: ShapeAttribute[]): Cell {
    const graph = this.maxgraphAttributeService.graph;
    const element = document.createElement('model');

    element.setAttribute('label', node.element.name);
    element.setAttribute('parent', 'yes');
    element.setAttribute('name', node.element.name);

    const cellId = node.element.isAnonymous?.() ? node.element.aspectModelUrn : node.element.name;

    const modelElementCell = graph.insertVertex(
      graph.getDefaultParent(),
      cellId,
      element,
      geometry.x,
      geometry.y,
      geometry.width,
      geometry.height,
      node.shape.maxgraphStyle,
    );

    modelElementCell.setId(cellId);
    modelElementCell['configuration'] = {
      baseProperties: MaxGraphVisitorHelper.getModelInfo(node.element, this.loadedFilesService.currentLoadedFile),
      fields: cellConfiguration,
    };

    graph.options.foldingEnabled = false;
    return modelElementCell;
  }
}
