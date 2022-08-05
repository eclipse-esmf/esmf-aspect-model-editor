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

import {Injectable} from '@angular/core';
import {ShapeConnectorService} from '@ame/connection';
import {
  BaseMetaModelElement,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultStructuredValue,
  DefaultUnit,
  Type,
} from '@ame/meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphCharacteristicHelper, MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {ModelInfo, RendererUpdatePayload} from '../../models';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {UnitRenderService} from './unit-render.service';
import {NamespacesCacheService} from '@ame/cache';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicRenderService extends BaseRenderService {
  private metaModelElement;

  constructor(
    mxGraphService: MxGraphService,
    languageSettingsService: LanguageSettingsService,
    private shapeConnectorService: ShapeConnectorService,
    private unitRendererService: UnitRenderService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService
  ) {
    super(mxGraphService, languageSettingsService);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultCharacteristic;
  }

  update({cell, form}: RendererUpdatePayload) {
    this.metaModelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (this.metaModelElement instanceof DefaultEither) {
      this.removeObsoleteEntityValues(cell);
      this.metaModelElement.dataType = null;
      this.mxGraphShapeOverlayService.changeEitherOverlay(cell);
      this.removeEitherTargetShape(cell, form.leftCharacteristic, form.rightCharacteristic);
      this.handleEitherCharacteristic(cell, form.leftCharacteristic, ModelInfo.IS_EITHER_LEFT);
      this.handleEitherCharacteristic(cell, form.rightCharacteristic, ModelInfo.IS_EITHER_RIGHT);
    } else if (this.metaModelElement instanceof DefaultStructuredValue) {
      this.handleDataType(cell, form.dataTypeEntity);
      this.removeStructuredValueProperties(cell);
      this.removeEverythingForStructuredValue(cell);
      this.addStructuredValueProperties(cell);
      this.handleOverlay(cell);
    } else {
      this.handleOverlay(cell);
      this.handlePredefinedCharacteristicConnections(cell);
      this.removeCharacteristicTargetShape(cell);
      this.handleDataType(cell, form.dataTypeEntity);
      this.handleUnit(cell, form.unit);
      this.handleElementCharacteristic(cell, form.elementCharacteristic);
      this.removeStructuredValueProperties(cell);
    }

    super.update({cell});
  }

  private removeStructuredValueProperties(cell: mxgraph.mxCell) {
    const outGoingEdges = this.mxGraphService.graph.getOutgoingEdges(cell);
    const toRemove = [];
    for (const edge of outGoingEdges) {
      const metaModel = MxGraphHelper.getModelElement(edge.target);
      metaModel instanceof DefaultProperty && toRemove.push(edge);
    }

    this.mxGraphService.graph.removeCells(toRemove);
  }

  private addStructuredValueProperties(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultStructuredValue>(cell);
    for (const element of modelElement.elements) {
      if (typeof element === 'string') {
        continue;
      }

      let propertyCell = this.mxGraphService.resolveCellByModelElement(element.property);
      this.shapeConnectorService.connectShapes(
        this.metaModelElement,
        element.property,
        cell,
        propertyCell || this.mxGraphService.renderModelElement(element.property)
      );

      propertyCell = this.mxGraphService.resolveCellByModelElement(element.property);
      propertyCell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(element.property, this.languageSettingsService);
      this.graph.labelChanged(propertyCell, MxGraphHelper.createPropertiesLabel(propertyCell));

      if (!element.property?.characteristic) {
        continue;
      }

      let childCharacteristicCell = this.mxGraphService.resolveCellByModelElement(element.property.characteristic);
      this.shapeConnectorService.connectShapes(
        element.property,
        element.property.characteristic,
        propertyCell,
        childCharacteristicCell || this.mxGraphService.renderModelElement(element.property.characteristic)
      );

      childCharacteristicCell = this.mxGraphService.resolveCellByModelElement(element.property.characteristic);
      childCharacteristicCell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
        element.property.characteristic,
        this.languageSettingsService
      );
      this.graph.labelChanged(childCharacteristicCell, MxGraphHelper.createPropertiesLabel(childCharacteristicCell));

      this.mxGraphShapeOverlayService.removeOverlay(
        childCharacteristicCell,
        MxGraphHelper.getNewShapeOverlayButton(childCharacteristicCell)
      );
    }
  }

  private removeEverythingForStructuredValue(cell: mxgraph.mxCell) {
    const outGoingEdges = this.mxGraphService.graph.getOutgoingEdges(cell);
    this.mxGraphService.graph.removeCells(outGoingEdges || []);
  }

  private removeEitherTargetShape(cell: mxgraph.mxCell, left: DefaultCharacteristic, right: DefaultCharacteristic) {
    this.mxGraphService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (modelElement && modelElement.aspectModelUrn !== left.aspectModelUrn && modelElement.aspectModelUrn !== right.aspectModelUrn) {
        this.mxGraphService.graph.removeCells([edge], true);
      }
    });
  }

  private handleEitherCharacteristic(cell: mxgraph.mxCell, characteristic: DefaultCharacteristic, modelInfo: ModelInfo) {
    const cachedCharacteristic = this.namespacesCacheService.resolveCachedElement(characteristic);
    const childCell = this.mxGraphService.resolveCellByModelElement(cachedCharacteristic);
    this.unitRendererService.removeFrom(cell);
    this.shapeConnectorService.connectShapes(
      this.metaModelElement,
      cachedCharacteristic,
      cell,
      childCell ? childCell : this.mxGraphService.renderModelElement(cachedCharacteristic),
      modelInfo
    );
  }

  private handleOverlay(cell: mxgraph.mxCell) {
    if (!(this.metaModelElement instanceof DefaultEither)) {
      this.mxGraphShapeOverlayService.removeOverlay(cell, null);
      if (this.metaModelElement?.isPredefined()) {
        this.mxGraphShapeOverlayService.addTopShapeOverlay(cell);
      } else {
        this.mxGraphShapeOverlayService.addTopShapeOverlay(cell);
        this.mxGraphShapeOverlayService.addBottomShapeOverlay(cell);
      }
    }
  }

  private handlePredefinedCharacteristicConnections(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (!modelElement?.isPredefined()) {
      return;
    }

    const edgesToRemove = cell.edges?.filter(
      edge => MxGraphHelper.getModelElement(edge.target).aspectModelUrn !== modelElement.aspectModelUrn
    );
    this.mxGraphService.removeCells(edgesToRemove || []);
  }

  private removeCharacteristicTargetShape(cell: mxgraph.mxCell) {
    this.mxGraphService.graph.getOutgoingEdges(cell).forEach(edge => {
      const targetMetaModel = MxGraphHelper.getModelElement(edge.target);
      if (targetMetaModel instanceof DefaultCharacteristic) {
        this.mxGraphService.graph.removeCells([edge], true);
      }
    });
  }

  private handleDataType(cell: mxgraph.mxCell, newDataType: BaseMetaModelElement | Type) {
    if (this.metaModelElement instanceof DefaultStructuredValue) {
      this.removeOutgoingComplexDataType(cell);
    }

    if (newDataType instanceof DefaultEntity) {
      this.removeOutgoingComplexDataType(cell);
      this.handleComplexDataType(cell, newDataType);
    } else if (newDataType instanceof DefaultScalar) {
      this.removeOutgoingComplexDataType(cell);
      this.handleScalarDataType(newDataType);
    } else {
      this.metaModelElement.dataType = null;
      this.removeOutgoingComplexDataType(cell);
    }
  }

  private handleComplexDataType(cell: mxgraph.mxCell, newDataType: DefaultEntity) {
    if (this.metaModelElement instanceof DefaultStructuredValue) {
      return;
    }
    const cachedEntity = this.namespacesCacheService.resolveCachedElement(newDataType);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(newDataType);
    this.shapeConnectorService.connectShapes(this.metaModelElement, newDataType, cell, entityCell);
  }

  private removeObsoleteEntityValues(cell: mxgraph.mxCell) {
    this.mxGraphService.graph.getOutgoingEdges(cell).forEach(outEdge => {
      if (MxGraphHelper.getModelElement(outEdge.target) instanceof DefaultEntityValue) {
        const entityValues = MxGraphCharacteristicHelper.findObsoleteEntityValues(outEdge);
        this.mxGraphService.removeCells(entityValues);
      }
    });
  }

  private handleScalarDataType(newDataType: BaseMetaModelElement | Type) {
    this.metaModelElement.update(newDataType);
  }

  private removeOutgoingComplexDataType(cell: mxgraph.mxCell) {
    const outGoingEdges = this.mxGraphService.graph.getOutgoingEdges(cell);
    if (outGoingEdges.length) {
      outGoingEdges.forEach(edge => {
        const modelElement = MxGraphHelper.getModelElement(edge.target);
        if (modelElement instanceof DefaultEntity) {
          this.metaModelElement.delete(modelElement);
          this.mxGraphService.graph.removeCells([edge], true);
        }
      });
    }
  }

  private handleUnit(cell: mxgraph.mxCell, unit: DefaultUnit) {
    const isSameUnit = this.mxGraphService.graph
      .getOutgoingEdges(cell)
      .find(edge => MxGraphHelper.getModelElement(edge.target).aspectModelUrn === unit?.aspectModelUrn);

    if (!isSameUnit) {
      this.unassignUnit(cell);
    }

    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!(modelElement instanceof DefaultQuantifiable)) {
      this.unitRendererService.removeFrom(cell);
      return;
    }
    if (unit && !isSameUnit && !unit.isPredefined()) {
      // if this is a custom unit
      let unitCell = this.mxGraphService.resolveCellByModelElement(unit);
      if (!unitCell) {
        // if there is no cell (new custom unit)
        unitCell = this.mxGraphService.renderModelElement(unit);
      }
      this.shapeConnectorService.connectShapes(modelElement, unit, cell, unitCell);
    } else if (unit && !isSameUnit) {
      this.removeCharacteristic(cell, MxGraphHelper.getModelElement(cell));
      this.unitRendererService.create(cell, unit);
    }
  }

  private unassignUnit(cell: mxgraph.mxCell) {
    const oldUnitCell = this.mxGraphService.graph
      .getOutgoingEdges(cell)
      .find(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultUnit);
    if (!oldUnitCell) {
      return;
    }
    if (MxGraphHelper.getModelElement<DefaultUnit>(oldUnitCell.target).isPredefined()) {
      this.mxGraphService.graph.removeCells([oldUnitCell.target], true);
    } else {
      this.mxGraphService.graph.removeCells([oldUnitCell]);
    }
  }

  private handleElementCharacteristic(cell: mxgraph.mxCell, elementCharacteristic: DefaultCharacteristic) {
    if (this.metaModelElement instanceof DefaultCollection) {
      if (elementCharacteristic) {
        this.mxGraphService.graph.getOutgoingEdges(cell).forEach(edge => {
          const modelElement = MxGraphHelper.getModelElement(edge.target);
          if (
            modelElement &&
            modelElement.aspectModelUrn !== elementCharacteristic.aspectModelUrn &&
            modelElement instanceof DefaultCharacteristic
          ) {
            this.mxGraphService.graph.removeCells([edge], true);
          }
        });
        const cachedCharacteristic = this.namespacesCacheService.resolveCachedElement(elementCharacteristic);
        const childCell = this.mxGraphService.resolveCellByModelElement(cachedCharacteristic);
        this.unitRendererService.removeFrom(cell);
        this.shapeConnectorService.connectShapes(
          this.metaModelElement,
          cachedCharacteristic,
          cell,
          childCell ? childCell : this.mxGraphService.renderModelElement(cachedCharacteristic),
          ModelInfo.IS_CHARACTERISTIC
        );
      } else {
        this.removeCharacteristic(cell, this.metaModelElement);
      }
    }
  }

  private removeCharacteristic(cell: mxgraph.mxCell, modelElement: DefaultCharacteristic) {
    const edgesToRemove = cell.edges?.filter(edge => {
      const sourceModel = MxGraphHelper.getModelElement(edge.source);
      if (modelElement.aspectModelUrn !== sourceModel.aspectModelUrn) {
        return false;
      }

      const targetModel = MxGraphHelper.getModelElement(edge.target);
      return targetModel instanceof DefaultCharacteristic && targetModel.aspectModelUrn !== sourceModel.aspectModelUrn;
    });

    this.mxGraphService.removeCells(edgesToRemove || []);
  }
}
