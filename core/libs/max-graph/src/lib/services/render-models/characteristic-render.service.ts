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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultCollection,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultStructuredValue,
  DefaultUnit,
  DefaultValue,
  NamedElement,
  Type,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphCharacteristicHelper, MaxGraphHelper, MaxGraphVisitorHelper} from '../../helpers';
import {ModelInfo, RendererUpdatePayload} from '../../models';
import {MaxGraphShapeOverlayService} from '../max-graph-shape-overlay.service';
import {BaseRenderService} from './base-render-service';
import {UnitRenderService} from './unit-render.service';

@Injectable({providedIn: 'root'})
export class CharacteristicRenderService extends BaseRenderService {
  private metaModelElement: DefaultCharacteristic;
  private readonly filtersService = inject(FiltersService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly unitRendererService = inject(UnitRenderService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultCharacteristic;
  }

  update({cell, form}: RendererUpdatePayload) {
    this.metaModelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);

    this.removeValues(cell);

    if (this.metaModelElement instanceof DefaultEither) {
      this.removeObsoleteEntityValues(cell);
      this.metaModelElement.dataType = null;
      this.maxgraphShapeOverlayService.changeEitherOverlay(cell);
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

  private removeValues(cell: Cell) {
    const outGoingEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const toRemove = [];
    for (const edge of outGoingEdges) {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);

      if (modelElement instanceof DefaultValue) {
        toRemove.push(edge);
      }
    }

    this.maxgraphService.removeCells(toRemove);
  }

  private removeStructuredValueProperties(cell: Cell) {
    const outGoingEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const toRemove = [];
    for (const edge of outGoingEdges) {
      const metaModel = MaxGraphHelper.getModelElement(edge.target);

      if (metaModel instanceof DefaultProperty) {
        toRemove.push(edge);
      }
    }

    this.maxgraphService.removeCells(toRemove);
  }

  private addStructuredValueProperties(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultStructuredValue>(cell);
    for (const element of modelElement.elements) {
      if (typeof element === 'string') {
        continue;
      }

      let propertyCell = this.maxgraphService.resolveCellByModelElement(element);
      this.shapeConnectorService.connectShapes(
        this.metaModelElement,
        element,
        cell,
        propertyCell || this.maxgraphService.renderModelElement(this.filtersService.createNode(element, {parent: modelElement})),
      );

      propertyCell = this.maxgraphService.resolveCellByModelElement(element);
      propertyCell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(element, this.sammLangService);
      this.graph.labelChanged(propertyCell, MaxGraphHelper.createPropertiesLabel(propertyCell), null);

      if (!element?.characteristic) {
        continue;
      }

      let childCharacteristicCell = this.maxgraphService.resolveCellByModelElement(element.characteristic);
      this.shapeConnectorService.connectShapes(
        element,
        element.characteristic,
        propertyCell,
        childCharacteristicCell ||
          this.maxgraphService.renderModelElement(this.filtersService.createNode(element.characteristic, {parent: element})),
      );

      childCharacteristicCell = this.maxgraphService.resolveCellByModelElement(element.characteristic);
      childCharacteristicCell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(
        element.characteristic,
        this.sammLangService,
      );
      this.graph.labelChanged(childCharacteristicCell, MaxGraphHelper.createPropertiesLabel(childCharacteristicCell), null);

      this.maxgraphShapeOverlayService.removeOverlay(
        childCharacteristicCell,
        MaxGraphHelper.getNewShapeOverlayButton(childCharacteristicCell),
      );
    }
  }

  private removeEverythingForStructuredValue(cell: Cell) {
    const outGoingEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const characteristic = MaxGraphHelper.getModelElement(cell);
    for (const edge of outGoingEdges) {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);
      MaxGraphHelper.removeRelation(characteristic, modelElement);
      if (modelElement?.isPredefined) {
        this.maxgraphService.removeCells([edge.target]);
      }
    }
    this.maxgraphService.removeCells(outGoingEdges || []);
  }

  private removeEitherTargetShape(cell: Cell, left: DefaultCharacteristic, right: DefaultCharacteristic) {
    const characteristic = MaxGraphHelper.getModelElement(cell);
    this.maxgraphService.graph.getOutgoingEdges(cell, null).forEach(edge => {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);
      if (modelElement && modelElement.aspectModelUrn !== left.aspectModelUrn && modelElement.aspectModelUrn !== right.aspectModelUrn) {
        MaxGraphHelper.removeRelation(characteristic, modelElement);
        if (modelElement?.isPredefined) {
          this.maxgraphService.removeCells([edge.target], true);
        } else {
          this.maxgraphService.removeCells([edge], true);
        }
      }
    });
  }

  private handleEitherCharacteristic(cell: Cell, characteristic: DefaultCharacteristic, modelInfo: ModelInfo) {
    const cachedCharacteristic = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(characteristic);
    const childCell = this.maxgraphService.resolveCellByModelElement(cachedCharacteristic);
    this.unitRendererService.removeFrom(cell);
    this.shapeConnectorService.connectShapes(
      this.metaModelElement,
      cachedCharacteristic,
      cell,
      childCell
        ? childCell
        : this.maxgraphService.renderModelElement(this.filtersService.createNode(cachedCharacteristic, {parent: this.metaModelElement})),
      modelInfo,
    );
  }

  private handleOverlay(cell: Cell) {
    if (!(this.metaModelElement instanceof DefaultEither)) {
      this.maxgraphShapeOverlayService.removeOverlay(cell, MaxGraphHelper.getNewShapeOverlayButton(cell));
      this.maxgraphShapeOverlayService.removeOverlay(cell, MaxGraphHelper.getTopOverlayButton(cell));

      if (this.metaModelElement?.isPredefined) {
        this.maxgraphShapeOverlayService.addTopShapeOverlay(cell);
      } else {
        this.maxgraphShapeOverlayService.addTopShapeOverlay(cell);
        this.maxgraphShapeOverlayService.addBottomShapeOverlay(cell);
      }
    }
  }

  private handlePredefinedCharacteristicConnections(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (!modelElement?.isPredefined) {
      return;
    }

    const predefinedElements: Cell[] = [];
    const edgesToRemove = cell.edges?.filter(edge => {
      const element = MaxGraphHelper.getModelElement(edge.target);
      if (element.isPredefined && element.aspectModelUrn !== modelElement.aspectModelUrn) predefinedElements.push(edge.target);
      return element.aspectModelUrn !== modelElement.aspectModelUrn;
    });
    this.maxgraphService.removeCells((edgesToRemove || []).concat(predefinedElements));
  }

  private removeCharacteristicTargetShape(cell: Cell) {
    this.maxgraphService.graph.getOutgoingEdges(cell, null).forEach(edge => {
      const targetMetaModel = MaxGraphHelper.getModelElement(edge.target);
      if (targetMetaModel instanceof DefaultCharacteristic) {
        this.maxgraphService.removeCells([edge], true);
      }
    });
  }

  private handleDataType(cell: Cell, newDataType: NamedElement | Type) {
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

  private handleComplexDataType(cell: Cell, newDataType: DefaultEntity) {
    if (this.metaModelElement instanceof DefaultStructuredValue) {
      return;
    }
    const cachedEntity = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(newDataType);
    const resolvedCell = this.maxgraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.maxgraphService.renderModelElement(this.filtersService.createNode(newDataType, {parent: this.metaModelElement}));
    this.shapeConnectorService.connectShapes(this.metaModelElement, newDataType, cell, entityCell);
  }

  private removeObsoleteEntityValues(cell: Cell) {
    this.maxgraphService.graph.getOutgoingEdges(cell, null).forEach(outEdge => {
      if (MaxGraphHelper.getModelElement(outEdge.target) instanceof DefaultEntityInstance) {
        const entityValues = MaxGraphCharacteristicHelper.findObsoleteEntityValues(outEdge);
        this.maxgraphService.removeCells(entityValues);
      }
    });
  }

  private handleScalarDataType(newDataType: NamedElement | Type) {
    if (newDataType instanceof DefaultEntity || newDataType instanceof DefaultScalar) {
      this.metaModelElement.dataType = newDataType;
    }
  }

  private removeOutgoingComplexDataType(cell: Cell) {
    const outGoingEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const characteristic = MaxGraphHelper.getModelElement(cell);

    if (outGoingEdges.length) {
      outGoingEdges.forEach(edge => {
        const modelElement = MaxGraphHelper.getModelElement(edge.target);
        if (modelElement instanceof DefaultEntity) {
          MaxGraphHelper.removeRelation(characteristic, modelElement);
          const characteristicUpdater = useUpdater(this.metaModelElement);
          characteristicUpdater.delete(modelElement);

          this.maxgraphService.removeCells([edge], true);
        }
      });
    }
  }

  private handleUnit(cell: Cell, unit: DefaultUnit) {
    const isSameUnit = this.maxgraphService.graph
      .getOutgoingEdges(cell, null)
      .find(edge => MaxGraphHelper.getModelElement(edge.target).aspectModelUrn === unit?.aspectModelUrn);

    if (!isSameUnit) {
      this.unassignUnit(cell);
    }

    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!(modelElement instanceof DefaultQuantifiable)) {
      this.unitRendererService.removeFrom(cell);
      return;
    }
    if (unit && !isSameUnit && !unit.isPredefined) {
      // if this is a custom unit
      let unitCell = this.maxgraphService.resolveCellByModelElement(unit);
      if (!unitCell) {
        // if there is no cell (new custom unit)
        unitCell = this.maxgraphService.renderModelElement(this.filtersService.createNode(unit, {parent: modelElement}));
      }
      this.shapeConnectorService.connectShapes(modelElement, unit, cell, unitCell);
    } else if (unit && !isSameUnit) {
      this.removeCharacteristic(cell, MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell));
      this.unitRendererService.create(cell, unit);
    }
  }

  private unassignUnit(cell: Cell) {
    const edgeToOldUnit = this.maxgraphService.graph
      .getOutgoingEdges(cell, null)
      .find(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultUnit);

    if (!edgeToOldUnit) {
      return;
    }

    const parent = MaxGraphHelper.getModelElement(cell);
    const unit = MaxGraphHelper.getModelElement<DefaultUnit>(edgeToOldUnit.target);

    if (unit?.isPredefined) {
      MaxGraphHelper.removeRelation(parent, unit);
      this.loadedFilesService.currentLoadedFile.cachedFile.removeElement(unit.aspectModelUrn);
      this.maxgraphService.removeCells([edgeToOldUnit.target], true);
    } else if (edgeToOldUnit) {
      MaxGraphHelper.removeRelation(parent, unit);
      this.maxgraphService.removeCells([edgeToOldUnit]);
    }
  }

  private handleElementCharacteristic(cell: Cell, elementCharacteristic: DefaultCharacteristic) {
    if (this.metaModelElement instanceof DefaultCollection) {
      if (elementCharacteristic) {
        this.maxgraphService.graph.getOutgoingEdges(cell, null).forEach(edge => {
          const modelElement = MaxGraphHelper.getModelElement(edge.target);
          if (
            modelElement &&
            modelElement.aspectModelUrn !== elementCharacteristic.aspectModelUrn &&
            modelElement instanceof DefaultCharacteristic
          ) {
            this.maxgraphService.removeCells([edge], true);
          }
        });
        const cachedCharacteristic = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(elementCharacteristic);
        const childCell = this.maxgraphService.resolveCellByModelElement(cachedCharacteristic);
        this.unitRendererService.removeFrom(cell);
        this.shapeConnectorService.connectShapes(
          this.metaModelElement,
          cachedCharacteristic,
          cell,
          childCell
            ? childCell
            : this.maxgraphService.renderModelElement(
                this.filtersService.createNode(cachedCharacteristic, {parent: this.metaModelElement}),
              ),
          ModelInfo.IS_CHARACTERISTIC,
        );
      } else {
        this.removeCharacteristic(cell, this.metaModelElement);
      }
    }
  }

  private removeCharacteristic(cell: Cell, modelElement: DefaultCharacteristic) {
    const edgesToRemove = cell.edges?.filter(edge => {
      const sourceModelElement = MaxGraphHelper.getModelElement(edge.source);
      if (modelElement.aspectModelUrn !== sourceModelElement.aspectModelUrn) {
        return false;
      }

      const targetModelElement = MaxGraphHelper.getModelElement(edge.target);
      return targetModelElement instanceof DefaultCharacteristic && targetModelElement.aspectModelUrn !== sourceModelElement.aspectModelUrn;
    });

    this.maxgraphService.removeCells(edgesToRemove || []);
  }
}
