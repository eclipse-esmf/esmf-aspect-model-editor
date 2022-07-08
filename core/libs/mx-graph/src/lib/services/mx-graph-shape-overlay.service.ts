/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, Injector} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphAttributeService, MxGraphShapeSelectorService} from '.';
import {MxGraphHelper, MxGraphVisitorHelper, PropertyInformation} from '../helpers';
import {mxCellOverlay, mxConstants, mxEvent, mxImage} from '../providers';
import {
  BaseMetaModelElement,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
} from '@ame/meta-model';
import {BrowserService} from '@ame/shared';
import {ShapeConnectorService} from '@ame/connection';
import {ModelInfo, ModelStyleResolver} from '../models';
import {LanguageSettingsService} from '@ame/settings-dialog';

@Injectable()
export class MxGraphShapeOverlayService {
  constructor(
    private browserService: BrowserService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private injector: Injector
  ) {}

  public removeOverlay(cell: mxgraph.mxCell, overlay: mxgraph.mxCellOverlay): void {
    this.mxGraphAttributeService.graph.removeCellOverlay(cell, overlay);
  }

  /**
   * Adds the available connection/s for a cell, marked by a + sign.
   *
   * @param cell mx element
   */
  public addTopShapeOverlay(cell: mxgraph.mxCell): void {
    if (cell.style?.includes('characteristic') && !(MxGraphHelper.getModelElement(cell) instanceof DefaultEither)) {
      const haveParentTrait = this.mxGraphAttributeService.graph
        .getIncomingEdges(cell)
        .some(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultTrait);

      if (!haveParentTrait) {
        const overlay = this.createIconShapeOverlay('add-outline-frame', 'Add Trait');
        overlay.align = mxConstants.ALIGN_CENTER;
        overlay.verticalAlign = mxConstants.ALIGN_TOP;
        overlay.offset.x += cell.geometry.width / 8;
        overlay.addListener(mxEvent.CLICK, () => this.addShapeAction(cell, ModelInfo.IS_CHARACTERISTIC));
        this.mxGraphAttributeService.graph.addCellOverlay(cell, overlay);
      }
    }
  }

  /**
   * Removes the connection of the specified cell and changes the internal model to reflect the change
   *
   * @param baseMetaModelElement internal model
   * @param cell mx element
   */
  removeOverlaysByConnection(baseMetaModelElement: BaseMetaModelElement, cell: mxgraph.mxCell): void {
    if (baseMetaModelElement instanceof DefaultAspect) {
      return;
    }

    if (baseMetaModelElement instanceof DefaultEnumeration) {
      return;
    }

    if (baseMetaModelElement instanceof DefaultProperty) {
      this.removeOverlay(cell, MxGraphHelper.getNewShapeOverlayButton(cell));
    } else if (baseMetaModelElement instanceof DefaultCharacteristic && !(baseMetaModelElement instanceof DefaultEither)) {
      this.removeCharacteristicOverlays(cell);
    }
  }

  public createIconShapeOverlay(shape: string, tooltip: string, width?: number, height?: number): mxgraph.mxCellOverlay {
    const image = new mxImage(`${this.browserService.getAssetBasePath()}/config/editor/img/${shape}.svg`, width || 20, height || 20);
    const overlay = new mxCellOverlay(image, tooltip);
    overlay.cursor = 'hand';
    return overlay;
  }

  private createAndConnectShape(cell: mxgraph.mxCell, modelInfo: ModelInfo = ModelInfo.IS_CHARACTERISTIC): void {
    const mxGraphConnectorService = this.injector.get(ShapeConnectorService);

    const modelElement = MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getSelectedShape());
    mxGraphConnectorService.createAndConnectShape(modelElement, cell, modelInfo);

    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(modelElement, this.injector.get(LanguageSettingsService));
    this.mxGraphAttributeService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));

    this.removeOverlaysByConnection(modelElement, cell);
    this.mxGraphAttributeService.graph.clearSelection();
  }

  private addShapeAction(cell: mxgraph.mxCell, modelInfo: ModelInfo = ModelInfo.IS_CHARACTERISTIC): void {
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

  hasEntityValueDescendantsAsEntity(metaModel: DefaultEntityValue) {
    const entityProperties = metaModel.entity?.properties || [];
    return entityProperties.some(({property}) => property?.characteristic?.dataType instanceof DefaultEntity);
  }

  /**
   * Adds the + connector on the bottom of a shape
   *
   * @param cell mx element
   */
  addBottomShapeOverlay(cell: mxgraph.mxCell): void {
    if (cell.style !== 'unit' && cell.style !== 'constraint' && cell.style !== 'entityValue') {
      const modelElement: BaseMetaModelElement = MxGraphHelper.getModelElement(cell);
      let overlayTooltip = 'Add ';
      let modelInfo = ModelInfo.IS_CHARACTERISTIC;

      if ([DefaultConstraint, DefaultEntityValue, DefaultAbstractProperty].some(c => modelElement instanceof c)) {
        return;
      }

      if (modelElement instanceof DefaultEither) {
        this.createArrowIconShapeOverlay(
          overlayTooltip + 'Left Characteristic',
          'arrow-left-frame',
          mxConstants.ALIGN_LEFT,
          -40,
          cell,
          ModelInfo.IS_EITHER_LEFT
        );

        this.createArrowIconShapeOverlay(
          overlayTooltip + 'Right Characteristic',
          'arrow-right-frame',
          mxConstants.ALIGN_RIGHT,
          40,
          cell,
          ModelInfo.IS_EITHER_RIGHT
        );

        return;
      }

      if (modelElement instanceof DefaultOperation) {
        this.createArrowIconShapeOverlay(
          overlayTooltip + 'Input Property',
          'arrow-up-frame',
          mxConstants.ALIGN_LEFT,
          -40,
          cell,
          ModelInfo.IS_OPERATION_INPUT
        );

        this.createArrowIconShapeOverlay(
          overlayTooltip + 'Output Property',
          'arrow-down-frame',
          mxConstants.ALIGN_RIGHT,
          40,
          cell,
          ModelInfo.IS_OPERATION_OUTPUT
        );

        return;
      }

      if (modelElement instanceof DefaultAspect || modelElement instanceof DefaultEntity) {
        overlayTooltip += 'Property';
      } else if (modelElement instanceof DefaultProperty) {
        overlayTooltip += 'Characteristic';
      } else if (modelElement instanceof DefaultTrait) {
        overlayTooltip += 'Characteristic/Constraint';
      } else if (modelElement instanceof DefaultCharacteristic) {
        overlayTooltip += MxGraphHelper.isComplexEnumeration(modelElement) ? 'Entity Value' : 'Entity';
        modelInfo = ModelInfo.IS_CHARACTERISTIC_DATATYPE;
      }

      this.createAddIconShapeOverlay(overlayTooltip, cell, modelInfo);
    }
  }

  private createAddIconShapeOverlay(overlayTooltip: string, cell: mxgraph.mxCell, modelInfo: ModelInfo) {
    const overlay = this.createIconShapeOverlay('add-frame', overlayTooltip);
    overlay.align = mxConstants.ALIGN_CENTER;
    this.addShapeOverlayListener(overlay, cell, modelInfo);
  }

  private createArrowIconShapeOverlay(
    overlayTooltip: string,
    svg: string,
    align: any,
    offset: number,
    cell: mxgraph.mxCell,
    modelInfo: ModelInfo
  ) {
    const overlay = this.createIconShapeOverlay(svg, overlayTooltip);
    overlay.align = align;
    overlay.offset.x = overlay.offset.x - offset;
    this.addShapeOverlayListener(overlay, cell, modelInfo);
  }

  private addShapeOverlayListener(overlay: any, cell: mxgraph.mxCell, modelInfo: ModelInfo = ModelInfo.IS_CHARACTERISTIC) {
    overlay.addListener(mxEvent.CLICK, () => this.addShapeAction(cell, modelInfo));
    this.mxGraphAttributeService.graph.addCellOverlay(cell, overlay);
  }

  /**
   * Checks and adds complex enumeration icon and + button for adding new entity value if special conditions are fulfilled.
   */
  checkComplexEnumerationOverlays(modelElement: BaseMetaModelElement, cell: mxgraph.mxCell): void {
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
  removeShapeActionIconsByLoading(modelElement: BaseMetaModelElement, cell: mxgraph.mxCell): void {
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    if (modelElement instanceof DefaultEntity) {
      return;
    }

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

    if (!incomingEdge) {
      return;
    }

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

    if (modelElement.isPredefined()) {
      this.removeOverlay(incomingEdges[0]?.target, MxGraphHelper.getNewShapeOverlayButton(incomingEdges[0]?.target));
    }
  }

  /**
   * Add icon in to mxGraph cell for complex data type enumerations
   */
  addComplexEnumerationShapeOverlay(cell: mxgraph.mxCell): void {
    if (!this.mxGraphAttributeService.graph.isCellCollapsed(cell)) {
      const overlay = this.createIconShapeOverlay('batch', 'Complex data types Enumeration');

      overlay.align = mxConstants.ALIGN_RIGHT;
      overlay.verticalAlign = mxConstants.ALIGN_TOP;
      overlay.offset.x -= 15;
      overlay.offset.y += 15;

      this.mxGraphAttributeService.graph.addCellOverlay(cell, overlay);
    }
  }

  removeComplexTypeShapeOverlays(cell: mxgraph.mxCell): void {
    this.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
    this.removeOverlay(cell, MxGraphHelper.getNewShapeOverlayButton(cell));
  }

  /**
   *
   * Check if a redraw of the overlay is necessary whenever we change metaModel from or into Either.
   *
   */
  public changeEitherOverlay(cell: mxgraph.mxCell) {
    this.removeOverlay(cell, null);
    this.addBottomShapeOverlay(cell);
  }

  /*
   *Checks if we delete a trait and adds back the shape overlay for source characteristic
   */
  public checkAndAddTopShapeActionIcon(outgoingEdges: Array<mxgraph.mxCell>, modelElement: BaseMetaModelElement) {
    if (outgoingEdges.length && modelElement instanceof DefaultTrait) {
      const incomingCharacteristic = this.mxGraphAttributeService.graph
        .getIncomingEdges(outgoingEdges[0].target)
        .filter(
          edge =>
            MxGraphHelper.getModelElement(edge.source) instanceof DefaultCharacteristic &&
            !(MxGraphHelper.getModelElement(edge.source) instanceof DefaultEither)
        );
      if (incomingCharacteristic.length === 1) {
        this.addTopShapeOverlay(outgoingEdges[0].target);
      }
    }
  }

  public checkAndAddShapeActionIcon(incomingEdges: Array<mxgraph.mxCell>, modelElement: BaseMetaModelElement): void {
    if (!incomingEdges.length) {
      return;
    }

    if (modelElement instanceof DefaultCharacteristic) {
      incomingEdges.forEach(edge => {
        const metaModelElement = MxGraphHelper.getModelElement(edge.source);
        if (!(metaModelElement instanceof DefaultCollection) && !(metaModelElement instanceof DefaultEither)) {
          if (!!edge.target) {
            this.addTopShapeOverlay(edge.target);
          }
          this.addBottomShapeOverlay(edge.source);
        }
      });
      return;
    }

    // This will add back the + overlay for characteristic if we remove the entity and for property if we remove the characteristic
    if (modelElement instanceof DefaultProperty || incomingEdges.some(edge => MxGraphHelper.isCharacteristicWithoutDataType(edge.source))) {
      incomingEdges.forEach(edge => this.addBottomShapeOverlay(edge.source));
    }
  }

  public createShape(
    modelElement: BaseMetaModelElement,
    geometry?: mxgraph.mxGeometry,
    cellConfiguration?: PropertyInformation[]
  ): mxgraph.mxCell {
    const graph = this.mxGraphAttributeService.graph;
    const element = document.createElement('model');

    element.setAttribute('label', modelElement.name);
    element.setAttribute('parent', 'yes');
    element.setAttribute('name', modelElement.name);

    const modelElementCell = graph.insertVertex(
      graph.getDefaultParent(),
      modelElement.name,
      element,
      geometry.x,
      geometry.y,
      geometry.width,
      geometry.height,
      ModelStyleResolver.resolve(modelElement)
    );

    modelElementCell.setId(modelElement.name);
    modelElementCell['configuration'] = {
      baseProperties: MxGraphVisitorHelper.getModelInfo(
        modelElement,
        MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getAspectCell())
      ),
      fields: cellConfiguration,
    };
    graph.foldingEnabled = false;
    return modelElementCell;
  }
}
