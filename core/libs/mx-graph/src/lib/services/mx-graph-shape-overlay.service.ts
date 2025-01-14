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
import {ShapeConnectorService} from '@ame/connection';
import {FiltersService, ModelTree} from '@ame/loader-filters';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {BrowserService} from '@ame/shared';
import {Injectable, Injector} from '@angular/core';
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
  NamedElement,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphAttributeService, MxGraphShapeSelectorService} from '.';
import {MxGraphHelper, MxGraphVisitorHelper, ShapeAttribute} from '../helpers';
import {ModelInfo} from '../models';
import {mxCellOverlay, mxConstants, mxEvent, mxImage} from '../providers';

@Injectable()
export class MxGraphShapeOverlayService {
  constructor(
    private browserService: BrowserService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private filtersService: FiltersService,
    private sammLangService: SammLanguageSettingsService,
    protected loadedFilesService: LoadedFilesService,
    private injector: Injector,
  ) {}

  removeOverlay(cell: mxgraph.mxCell, overlay?: mxgraph.mxCellOverlay): void {
    const modelElement = MxGraphHelper.getModelElement(cell);
    overlay
      ? this.mxGraphAttributeService.graph.removeCellOverlay(cell, overlay)
      : !(modelElement instanceof DefaultCharacteristic)
        ? this.mxGraphAttributeService.graph.removeCellOverlay(cell)
        : null;
  }

  /**
   * Adds the available connection/s for a cell, marked by a + sign.
   *
   * @param cell mx element
   */
  addTopShapeOverlay(cell: mxgraph.mxCell): void {
    const modelElement = MxGraphHelper.getModelElement(cell);

    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (modelElement instanceof DefaultEither) return;
    if (!cell.style?.includes('characteristic')) return;

    const overlay = this.createIconShapeOverlay('add-outline-frame', 'Add Trait');
    overlay.align = mxConstants.ALIGN_CENTER;
    overlay.verticalAlign = mxConstants.ALIGN_TOP;
    overlay.offset.x += cell.geometry.width / 8;
    this.addShapeOverlayListener(overlay, cell, ModelInfo.IS_CHARACTERISTIC);
  }

  /**
   * Removes the connection of the specified cell and changes the internal model to reflect the change
   *
   * @param element internal model
   * @param cell mx element
   */
  removeOverlaysByConnection(element: NamedElement, cell: mxgraph.mxCell): void {
    if (element instanceof DefaultAspect) return;
    if (element instanceof DefaultEnumeration) return;

    element instanceof DefaultProperty && element.characteristic
      ? this.removeOverlay(cell, MxGraphHelper.getNewShapeOverlayButton(cell))
      : element instanceof DefaultCharacteristic && !(element instanceof DefaultEither)
        ? this.removeCharacteristicOverlays(cell)
        : undefined;
  }

  createIconShapeOverlay(svgFileName: string, tooltip: string): mxgraph.mxCellOverlay {
    const src = `${this.browserService.getAssetBasePath()}/config/editor/img/${svgFileName}.svg`;
    const image = new mxImage(src, 20, 20);
    const overlay = new mxCellOverlay(image, tooltip);
    overlay.cursor = 'hand';
    return overlay;
  }

  private createAndConnectShape(cell: mxgraph.mxCell, modelInfo: ModelInfo): void {
    const mxGraphConnectorService = this.injector.get(ShapeConnectorService);

    const modelElement = MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getSelectedShape());
    mxGraphConnectorService.createAndConnectShape(modelElement, cell, modelInfo);

    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    this.mxGraphAttributeService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));

    this.removeOverlaysByConnection(modelElement, cell);
    this.mxGraphAttributeService.graph.clearSelection();
  }

  private addShapeAction(cell: mxgraph.mxCell, modelInfo: ModelInfo): void {
    this.mxGraphAttributeService.graph.selectCellForEvent(cell);
    this.createAndConnectShape(cell, modelInfo);
  }

  private removeCharacteristicOverlays(cell: mxgraph.mxCell): void {
    const graph = this.mxGraphAttributeService.graph;
    const outgoingEdges = graph.getOutgoingEdges(cell);
    const incomingEdges = graph.getIncomingEdges(cell);
    let characteristic;

    // remove Add Trait when you first create a treat from a characteristic
    if (MxGraphHelper.getModelElement(incomingEdges?.[0]?.source) instanceof DefaultTrait) {
      characteristic = incomingEdges[0].target;
      this.removeOverlay(characteristic, MxGraphHelper.getTopOverlayButton(characteristic));
    }

    // remove Add Trait overlay when the connection trait to characteristic is done manually
    characteristic = outgoingEdges.find(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultCharacteristic)?.target;
    if (characteristic) {
      this.removeOverlay(characteristic, MxGraphHelper.getTopOverlayButton(characteristic));
    }

    // remove Add Entity if Entity already in place
    if (
      !(MxGraphHelper.getModelElement(cell) instanceof DefaultEnumeration) &&
      outgoingEdges.some(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultEntity)
    ) {
      characteristic = outgoingEdges[0].source;
      const overlay = MxGraphHelper.getNewShapeOverlayButton(characteristic);
      if (overlay) {
        this.removeOverlay(characteristic, overlay);
      }
    }
  }

  /**
   * Adds connector element on the bottom of a shape
   *
   * @param cell mx element
   */
  addBottomShapeOverlay(cell: mxgraph.mxCell): void {
    const modelElement = MxGraphHelper.getModelElement(cell);

    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (modelElement?.isPredefined) return;
    if (cell.style === 'unit') return;
    if (cell.style === 'constraint') return;
    if (cell.style === 'entityValue') return;
    if ([DefaultConstraint, DefaultEntityInstance, DefaultUnit].some(c => modelElement instanceof c)) return;

    const elementOffset = 40;

    if (modelElement instanceof DefaultEither) {
      this.createConnectorElement(
        'Left Characteristic',
        cell,
        ModelInfo.IS_EITHER_LEFT,
        -elementOffset,
        'arrow-left-frame',
        mxConstants.ALIGN_LEFT,
      );

      this.createConnectorElement(
        'Right Characteristic',
        cell,
        ModelInfo.IS_EITHER_RIGHT,
        elementOffset,
        'arrow-right-frame',
        mxConstants.ALIGN_RIGHT,
      );

      return;
    }

    if (modelElement instanceof DefaultOperation) {
      this.createConnectorElement(
        'Input Property',
        cell,
        ModelInfo.IS_OPERATION_INPUT,
        -elementOffset,
        'arrow-up-frame',
        mxConstants.ALIGN_LEFT,
      );

      this.createConnectorElement(
        'Output Property',
        cell,
        ModelInfo.IS_OPERATION_OUTPUT,
        elementOffset,
        'arrow-down-frame',
        mxConstants.ALIGN_RIGHT,
      );

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
      const connectableElementName = MxGraphHelper.isComplexEnumeration(modelElement) ? 'Entity Value' : 'Entity';
      return this.createConnectorElement(connectableElementName, cell, ModelInfo.IS_CHARACTERISTIC_DATATYPE);
    }

    return this.createConnectorElement('', cell, ModelInfo.IS_CHARACTERISTIC);
  }

  private createConnectorElement(
    connectableElementName: string,
    cell: mxgraph.mxCell,
    modelInfo: ModelInfo,
    offset = 0,
    svgFileName = 'add-frame',
    align = mxConstants.ALIGN_CENTER,
  ): void {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;

    const tooltipText = connectableElementName ? `Add ${connectableElementName}` : '';
    const overlay = this.createIconShapeOverlay(svgFileName, tooltipText);
    overlay.align = align;

    if (offset) {
      overlay.offset.x = overlay.offset.x - offset;
    }

    this.addShapeOverlayListener(overlay, cell, modelInfo);
  }

  private addShapeOverlayListener(overlay: mxgraph.mxCellOverlay, cell: mxgraph.mxCell, modelInfo: ModelInfo): void {
    overlay.addListener(mxEvent.CLICK, () => this.addShapeAction(cell, modelInfo));
    this.mxGraphAttributeService.graph.addCellOverlay(cell, overlay);
  }

  /**
   * Checks and adds complex enumeration icon and + button for adding new entity value if special conditions are fulfilled.
   */
  checkComplexEnumerationOverlays(modelElement: NamedElement, cell: mxgraph.mxCell): void {
    if (MxGraphHelper.isComplexEnumeration(modelElement)) {
      this.addComplexEnumerationShapeOverlay(cell);
      this.addBottomShapeOverlay(cell);
    }
  }

  /**
   * Removes the available connection/s for a cell, on load
   *
   * @param modelElement internal model
   * @param cell mx element
   */
  removeShapeActionIconsByLoading(modelElement: NamedElement, cell: mxgraph.mxCell): void {
    if (modelElement instanceof DefaultEntity) return;

    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);

    if (modelElement instanceof DefaultCharacteristic) {
      this.removeOverlaysOnLoad(modelElement, incomingEdges);
      if (!MxGraphHelper.isComplexEnumeration(modelElement) && modelElement.dataType instanceof DefaultEntity) {
        this.removeOverlay(cell, MxGraphHelper.getNewShapeOverlayButton(cell));
      }
    }
    if (this.mxGraphAttributeService.inCollapsedMode && MxGraphHelper.isComplexEnumeration(modelElement)) {
      this.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
    }
  }

  private removeOverlaysOnLoad(modelElement: DefaultCharacteristic, incomingEdges: Array<mxgraph.mxCell>): void {
    const incomingEdge = incomingEdges.find((edge: mxgraph.mxCell) => edge?.source?.overlays?.length);

    if (!incomingEdge) return;

    const incomingSourceModelElement = MxGraphHelper.getModelElement(incomingEdge.source);
    const bottomOverlay = MxGraphHelper.getNewShapeOverlayButton(incomingEdge.source);

    if (incomingSourceModelElement instanceof DefaultTrait) {
      const topOverlay = MxGraphHelper.getTopOverlayButton(incomingEdges[0]?.target);
      this.removeOverlay(incomingEdge, bottomOverlay);
      this.removeOverlay(incomingEdges[0]?.target, topOverlay);
    } else if (!(incomingSourceModelElement instanceof DefaultCollection) && !(incomingSourceModelElement instanceof DefaultEither)) {
      if (bottomOverlay) {
        this.mxGraphAttributeService.graph.removeCellOverlay(incomingEdge.source, bottomOverlay);
      }
    }

    if (modelElement.isPredefined) {
      this.removeOverlay(incomingEdges[0]?.target, MxGraphHelper.getNewShapeOverlayButton(incomingEdges[0]?.target));
    }
  }

  /**
   * Add icon in to mxGraph cell for complex data type enumerations
   */
  addComplexEnumerationShapeOverlay(cell: mxgraph.mxCell): void {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;
    if (this.mxGraphAttributeService.graph.isCellCollapsed(cell)) return;

    const overlay = this.createIconShapeOverlay('batch', 'Complex data types Enumeration');
    overlay.align = mxConstants.ALIGN_RIGHT;
    overlay.verticalAlign = mxConstants.ALIGN_TOP;
    overlay.offset.x -= 15;
    overlay.offset.y += 15;

    this.mxGraphAttributeService.graph.addCellOverlay(cell, overlay);
  }

  removeComplexTypeShapeOverlays(cell: mxgraph.mxCell): void {
    this.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
    this.removeOverlay(cell, MxGraphHelper.getNewShapeOverlayButton(cell));
  }

  /**
   * Check if a redraw of the overlay is necessary whenever we change metaModel from or into Either.
   */
  changeEitherOverlay(cell: mxgraph.mxCell): void {
    this.removeOverlay(cell);
    this.addBottomShapeOverlay(cell);
  }

  /**
   * Checks if we delete a trait and adds back the shape overlay for source characteristic
   */
  checkAndAddTopShapeActionIcon(outgoingEdges: Array<mxgraph.mxCell>, modelElement: NamedElement): void {
    if (!outgoingEdges.length) return;
    if (!(modelElement instanceof DefaultTrait)) return;

    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(outgoingEdges[0].target);
    const incomingCharacteristics = incomingEdges.filter(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.source);
      return modelElement instanceof DefaultCharacteristic && !(modelElement instanceof DefaultEither);
    });

    if (incomingCharacteristics.length === 1) {
      this.addTopShapeOverlay(outgoingEdges[0].target);
    }
  }

  checkAndAddShapeActionIcon(incomingEdges: Array<mxgraph.mxCell>, modelElement: NamedElement): void {
    if (!incomingEdges.length) return;
    if (!this.filtersService.currentFilter.hasOverlay(modelElement)) return;

    if (modelElement instanceof DefaultCharacteristic) {
      return incomingEdges.forEach(edge => {
        const metaModelElement = MxGraphHelper.getModelElement(edge.source);
        if (metaModelElement instanceof DefaultCollection) return;
        if (metaModelElement instanceof DefaultEither) return;

        if (!!edge.target) {
          this.addTopShapeOverlay(edge.target);
        }

        this.addBottomShapeOverlay(edge.source);
      });
    }

    const isCharacteristicWithoutDataType = incomingEdges.some(edge => MxGraphHelper.isCharacteristicWithoutDataType(edge.source));
    // This will add back the + overlay for characteristic if we remove the entity and for property if we remove the characteristic
    if (modelElement instanceof DefaultProperty || isCharacteristicWithoutDataType) {
      incomingEdges.forEach(edge => this.addBottomShapeOverlay(edge.source));
    }
  }

  createShape(node: ModelTree<NamedElement>, geometry?: mxgraph.mxGeometry, cellConfiguration?: ShapeAttribute[]): mxgraph.mxCell {
    const graph = this.mxGraphAttributeService.graph;
    const element = document.createElement('model');

    element.setAttribute('label', node.element.name);
    element.setAttribute('parent', 'yes');
    element.setAttribute('name', node.element.name);

    const modelElementCell = graph.insertVertex(
      graph.getDefaultParent(),
      node.element.name,
      element,
      geometry.x,
      geometry.y,
      geometry.width,
      geometry.height,
      node.shape.mxGraphStyle,
    );

    modelElementCell.setId(node.element.name);
    modelElementCell['configuration'] = {
      baseProperties: MxGraphVisitorHelper.getModelInfo(node.element, this.loadedFilesService.currentLoadedFile),
      fields: cellConfiguration,
    };
    graph.foldingEnabled = false;
    return modelElementCell;
  }
}
