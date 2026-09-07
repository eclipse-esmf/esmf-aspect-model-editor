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

/* eslint-disable @typescript-eslint/no-unused-vars */
import {ModelTree} from '@ame/loader-filters';
import {RdfModelUtil} from '@ame/rdf/utils';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultUnit,
  DefaultValue,
  NamedElement,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper, MaxGraphVisitorHelper} from '../helpers';
import {ShapeConfiguration} from '../models';
import {MaxGraphService, MaxGraphShapeOverlayService} from '../services';
import {ModelRenderer} from './maxgraph-renderer.interface';

export class MaxGraphRenderer implements ModelRenderer<Cell, Cell> {
  private shapes: Map<string, Cell>;

  public visitedElements = []; // Keep track of already visited elements

  public set rdfModelValue(rdfModel: RdfModel) {
    this.rdfModel = rdfModel;
  }

  constructor(
    private maxgraphService: MaxGraphService,
    private maxgraphShapeOverlayService: MaxGraphShapeOverlayService,
    private sammLangService: SammLanguageSettingsService,
    private rdfModel: RdfModel,
  ) {
    this.shapes = new Map<string, Cell>();
  }

  render(elementTree: ModelTree<NamedElement>, parent: Cell, geometry?: ShapeConfiguration['geometry']): Cell {
    const wasVisited = this.visitedElements.includes(elementTree.element);
    const item: Cell = this.renderElement(elementTree, parent, geometry);

    if (!wasVisited) {
      this.visitedElements.push(elementTree.element);
    }

    if (wasVisited) {
      // In case the element was visited -> don't visit its lower attributes since they were already visited previously
      // This avoids duplication of samm-c elements
      // TODO Might need further investigation
      return item;
    }

    for (const child of elementTree.children) {
      this.render(child, item, null);
    }

    return item;
  }

  // ==========================================================================================
  // Supported visitor types
  // ==========================================================================================

  renderOperation(node: ModelTree<DefaultOperation>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getOperationProperties(node.element, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    if (node.element.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderEntity(node: ModelTree<DefaultEntity>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const entity = node.element;
    if (this.shapes.get(entity.aspectModelUrn)) {
      const cellTmp = this.shapes.get(entity.aspectModelUrn);

      if (parent) {
        this.maxgraphService.assignToParent(cellTmp, parent, node.fromParentArrow);
      }

      return undefined;
    }

    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getEntityProperties(entity, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    if (entity.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderEntityValue(node: ModelTree<DefaultEntityInstance>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const entityValue = node.element;
    const cell = this.getOrCreateCell(node, {shapeAttributes: [], geometry});
    if (entityValue.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }

    this.maxgraphService.assignToParent(cell, parent, node.fromParentArrow);
    return cell;
  }

  renderUnit(node: ModelTree<DefaultUnit>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const unit = node.element;
    if (parent && (this.inParentRendered(unit, parent) || !(MaxGraphHelper.getModelElement(parent) instanceof DefaultCharacteristic))) {
      return null;
    }

    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getUnitProperties(unit, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    if (unit.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderQuantityKind(node: ModelTree<DefaultQuantityKind>, _parent: Cell, _geometry: ShapeConfiguration['geometry'] = {}): Cell {
    // The information is directly shown on the unit, mainly to reduce the amount of shapes
    return undefined;
  }

  renderProperty(node: ModelTree<DefaultProperty>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const property = node.element;
    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getPropertyProperties(property, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    this.assignToParent(cell, parent, node);
    return cell;
  }

  renderAbstractProperty(node: ModelTree<DefaultProperty>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const abstractProperty = node.element;
    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getAbstractPropertyProperties(abstractProperty, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    this.assignToParent(cell, parent, node);
    return cell;
  }

  renderCharacteristic(node: ModelTree<DefaultCharacteristic>, parentCell: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const characteristic = node.element;
    const isAnonymous = characteristic?.isAnonymous?.() || characteristic?.syntheticName;
    const cell =
      (!isAnonymous ? this.shapes.get(characteristic.aspectModelUrn) : undefined) ||
      this.getOrCreateCell(node, {
        shapeAttributes: MaxGraphVisitorHelper.getCharacteristicProperties(characteristic, this.sammLangService),
        geometry,
      });
    this.connectIsolatedElement(parentCell, cell);

    const parent = MaxGraphHelper.getModelElement(parentCell);
    if (parent instanceof DefaultProperty && (parentCell as any).isAbstract) {
      return cell;
    }

    if (parent instanceof DefaultProperty) {
      node.element.parents.push(parent);
    }

    this.assignToParent(cell, parentCell, node);
    return cell;
  }

  renderValue(node: ModelTree<DefaultValue>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const value = node.element;
    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getValueProperties(value, this.sammLangService),
      geometry,
    });
    this.connectIsolatedElement(parent, cell);

    if (value.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderAbstractEntity(node: ModelTree<DefaultEntity>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const abstractEntity = node.element;
    if (this.shapes.get(abstractEntity.aspectModelUrn)) {
      const cellTmp = this.shapes.get(abstractEntity.aspectModelUrn);
      // Todo It may be that characteristics are not connected.
      if (abstractEntity.parents.length > 0) {
        this.maxgraphService.assignToParent(cellTmp, parent, node.fromParentArrow);
      }
      return undefined;
    }

    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getAbstractEntityProperties(abstractEntity, this.sammLangService),
      geometry,
    });

    this.connectIsolatedElement(parent, cell);

    this.assignToParent(cell, parent, node);
    return cell;
  }

  renderAspect(node: ModelTree<DefaultAspect>, _parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    // English is our default at the moment.
    const aspect = node.element;
    this.sammLangService.setSammLanguageCodes(['en']);
    return this.createCell(node, {shapeAttributes: MaxGraphVisitorHelper.getAspectProperties(aspect, this.sammLangService), geometry});
  }

  renderConstraint(node: ModelTree<DefaultConstraint>, context: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const cell = this.getOrCreateCell(node, {
      shapeAttributes: MaxGraphVisitorHelper.getConstraintProperties(node.element, this.sammLangService),
      geometry,
    });
    MaxGraphHelper.setElementNode(cell, node);
    this.connectIsolatedElement(context, cell);

    this.assignToParent(cell, context, node);
    return cell;
  }

  renderEvent(node: ModelTree<DefaultEvent>, parent: Cell, geometry: ShapeConfiguration['geometry'] = {}): Cell {
    const event = node.element;
    const cell = this.createCell(node, {shapeAttributes: MaxGraphVisitorHelper.getEventProperties(event, this.sammLangService), geometry});
    this.connectIsolatedElement(parent, cell);

    this.assignToParent(cell, parent, node);
    return cell;
  }

  private renderElement(node: ModelTree<any>, parent: Cell, geometry?: ShapeConfiguration['geometry']) {
    switch (true) {
      case node.element instanceof DefaultOperation:
        return this.renderOperation(node, parent, geometry);
      case node.element instanceof DefaultEntity && node.element.isAbstractEntity():
        return this.renderAbstractEntity(node, parent, geometry);
      case node.element instanceof DefaultEntity:
        return this.renderEntity(node, parent, geometry);
      case node.element instanceof DefaultEntityInstance:
        return this.renderEntityValue(node, parent, geometry);
      case node.element instanceof DefaultUnit:
        return this.renderUnit(node, parent, geometry);
      case node.element instanceof DefaultQuantityKind:
        return this.renderQuantityKind(node, parent, geometry);
      case node.element instanceof DefaultProperty && node.element.isAbstract:
        return this.renderAbstractProperty(node, parent, geometry);
      case node.element instanceof DefaultProperty:
        return this.renderProperty(node, parent, geometry);
      case node.element instanceof DefaultCharacteristic:
        return this.renderCharacteristic(node, parent, geometry);
      case node.element instanceof DefaultAspect:
        return this.renderAspect(node, parent, geometry);
      case node.element instanceof DefaultConstraint:
        return this.renderConstraint(node, parent, geometry);
      case node.element instanceof DefaultEvent:
        return this.renderEvent(node, parent, geometry);
      case node.element instanceof DefaultValue:
        return this.renderValue(node, parent, geometry);
      default:
        return null;
    }
  }

  // ==========================================================================================
  // Private helper functions
  // ==========================================================================================

  private inParentRendered(element: NamedElement, parent: Cell): boolean {
    if (!parent) {
      return false;
    }
    return (this.maxgraphService.graph?.getOutgoingEdges(parent, null) || []).some(
      cell => MaxGraphHelper.getModelElement(cell)?.aspectModelUrn === element.aspectModelUrn,
    );
  }

  private connectIsolatedElement(parentCell: Cell, childCell: Cell) {
    if (parentCell) {
      const childNode = MaxGraphHelper.getElementNode(childCell);
      const child = childNode.element;
      const parent = MaxGraphHelper.getModelElement(parentCell);

      const isParentIsolated = parent.parents.length === 0;
      const isChildIsolated = child.parents.length === 0;

      if (isParentIsolated && isChildIsolated) {
        this.assignToParent(childCell, parentCell, childNode);
      }
    }
  }

  private createCell(node: ModelTree<NamedElement>, {shapeAttributes, geometry}: ShapeConfiguration): Cell {
    return this.maxgraphService.renderModelElement(node, {shapeAttributes: shapeAttributes, geometry});
  }

  private getOrCreateCell(node: ModelTree<any>, {shapeAttributes, geometry}: ShapeConfiguration): Cell {
    const isAnonymous = node.element?.isAnonymous?.() || node.element?.syntheticName;
    const shape =
      (!isAnonymous ? this.shapes.get(node.element.aspectModelUrn) : undefined) ||
      (!isAnonymous ? this.shapes.get(node.element.name) : undefined) ||
      (!isAnonymous ? this.maxgraphService.resolveCellByModelElement(node.element) : undefined);

    if (shape) {
      return shape;
    }

    const cell = this.createCell(node, {shapeAttributes, geometry});

    if (
      !isAnonymous &&
      this.rdfModel &&
      !RdfModelUtil.isPredefinedCharacteristic(node.element.aspectModelUrn, this.rdfModel.sammC) &&
      !RdfModelUtil.isSammUDefinition(node.element.aspectModelUrn, this.rdfModel.sammU)
    ) {
      this.shapes.set(node.element.aspectModelUrn, cell);
    }

    return cell;
  }

  private assignToParent(cell: Cell, context: Cell, node: ModelTree<NamedElement>) {
    this.maxgraphService.assignToParent(cell, context, node.fromParentArrow);
    this.removeActionIcons(node.element, cell);
  }

  private removeActionIcons(NamedNode: NamedElement, cell: Cell) {
    this.maxgraphShapeOverlayService.removeShapeActionIconsByLoading(NamedNode, cell);
  }
}
