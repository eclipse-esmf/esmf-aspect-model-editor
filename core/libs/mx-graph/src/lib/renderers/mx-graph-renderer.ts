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

/* eslint-disable @typescript-eslint/no-unused-vars */
import {mxCell, mxgraph} from 'mxgraph';
import {MxGraphHelper, MxGraphVisitorHelper, ShapeAttribute} from '../helpers';
import {MxGraphService, MxGraphShapeOverlayService} from '../services';
import {
  Base,
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
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
} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {ModelTree} from '@ame/loader-filters';
import {ModelRenderer} from './mxgraph-renderer.interface';

export class MxGraphRenderer implements ModelRenderer<mxCell, mxCell> {
  visitedElements = []; // Keep track of already visited elements

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  private shapes: Map<string, mxCell>;

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService,
    private sammLangService: SammLanguageSettingsService,
    private rdfModel: RdfModel
  ) {
    this.shapes = new Map<string, mxCell>();
  }

  render(elementTree: ModelTree<BaseMetaModelElement>, parent: mxCell): mxCell {
    const wasVisited = this.visitedElements.includes(elementTree.element);
    const item: mxCell = this.renderElement(elementTree, parent);
    !wasVisited && this.visitedElements.push(elementTree.element);

    if (wasVisited) {
      // In case the element was visited -> don't visit its lower attributes since they were already visited previously
      // This avoids duplication of samm-c elements
      // TODO: Might need further investigation
      return item;
    }

    for (const child of elementTree.children) {
      this.render(child, item);
    }

    return item;
  }

  // ==========================================================================================
  // Supported visitor types
  // ==========================================================================================

  renderOperation(node: ModelTree<DefaultOperation>, parent: mxCell): mxCell {
    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getOperationProperties(node.element, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (node.element.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderEntity(node: ModelTree<DefaultEntity>, parent: mxCell): mxCell {
    const entity = node.element;
    if (this.shapes.get(entity.aspectModelUrn)) {
      const cellTmp = this.shapes.get(entity.aspectModelUrn);
      parent && this.mxGraphService.assignToParent(cellTmp, parent, node.fromParentArrow);
      return;
    }

    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getEntityProperties(entity, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (entity.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderEntityValue(node: ModelTree<DefaultEntityInstance>, parent: mxCell): mxCell {
    const entityValue = node.element;
    const cell = this.getOrCreateMxCell(node, []);
    if (entityValue.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }

    this.mxGraphService.assignToParent(cell, parent, node.fromParentArrow);
    return cell;
  }

  renderUnit(node: ModelTree<DefaultUnit>, parent: mxCell): mxCell {
    const unit = node.element;
    if (this.inParentRendered(unit, parent) || (parent && !(MxGraphHelper.getModelElement(parent) instanceof DefaultCharacteristic))) {
      return null;
    }

    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getUnitProperties(unit, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (unit.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderQuantityKind(node: ModelTree<DefaultQuantityKind>, _parent: mxCell): mxCell {
    // The information is directly shown on the unit, mainly to reduce the amount of shapes
  }

  renderProperty(node: ModelTree<DefaultProperty>, parent: mxgraph.mxCell): mxgraph.mxCell {
    const property = node.element;
    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getPropertyProperties(property, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (property.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderAbstractProperty(node: ModelTree<DefaultAbstractProperty>, parent: mxgraph.mxCell): mxgraph.mxCell {
    const abstractProperty = node.element;
    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getAbstractPropertyProperties(abstractProperty, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (abstractProperty.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderCharacteristic(node: ModelTree<DefaultCharacteristic>, parent: mxCell): mxCell {
    const characteristic = node.element;
    const cell =
      this.shapes.get(characteristic.aspectModelUrn) ||
      this.getOrCreateMxCell(node, MxGraphVisitorHelper.getCharacteristicProperties(characteristic, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    const parentCell = MxGraphHelper.getModelElement(parent);
    if (parentCell instanceof DefaultAbstractProperty) {
      return cell;
    }

    if (characteristic.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderAbstractEntity(node: ModelTree<DefaultAbstractEntity>, parent: mxCell) {
    const abstractEntity = node.element;
    if (this.shapes.get(abstractEntity.aspectModelUrn)) {
      const cellTmp = this.shapes.get(abstractEntity.aspectModelUrn);
      // Todo It may be that characteristics are not connected.
      if (abstractEntity.parents.length > 0) {
        this.mxGraphService.assignToParent(cellTmp, parent, node.fromParentArrow);
      }
      return;
    }

    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getAbstractEntityProperties(abstractEntity, this.sammLangService));

    this.connectIsolatedElement(parent, cell);

    if (abstractEntity.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  renderAspect(node: ModelTree<DefaultAspect>, _parent: mxCell): mxCell {
    // English is our default at the moment.
    const aspect = node.element;
    this.sammLangService.setSammLanguageCodes(['en']);
    return this.createMxCell(node, MxGraphVisitorHelper.getAspectProperties(aspect, this.sammLangService));
  }

  renderConstraint(node: ModelTree<DefaultConstraint>, context: mxCell): mxCell {
    const cell = this.getOrCreateMxCell(node, MxGraphVisitorHelper.getConstraintProperties(node.element, this.sammLangService));
    MxGraphHelper.setElementNode(cell, node);
    this.connectIsolatedElement(context, cell);

    if (node.element.parents.length > 0) {
      this.assignToParent(cell, context, node);
    }
    return cell;
  }

  renderEvent(node: ModelTree<DefaultEvent>, parent: mxCell): mxCell {
    const event = node.element;
    const cell = this.createMxCell(node, MxGraphVisitorHelper.getEventProperties(event, this.sammLangService));
    this.connectIsolatedElement(parent, cell);

    if (event.parents.length > 0) {
      this.assignToParent(cell, parent, node);
    }
    return cell;
  }

  private renderElement(node: ModelTree<any>, parent: mxCell) {
    switch (true) {
      case node.element instanceof DefaultOperation:
        return this.renderOperation(node, parent);
      case node.element instanceof DefaultEntity:
        return this.renderEntity(node, parent);
      case node.element instanceof DefaultEntityInstance:
        return this.renderEntityValue(node, parent);
      case node.element instanceof DefaultUnit:
        return this.renderUnit(node, parent);
      case node.element instanceof DefaultQuantityKind:
        return this.renderQuantityKind(node, parent);
      case node.element instanceof DefaultProperty:
        return this.renderProperty(node, parent);
      case node.element instanceof DefaultAbstractProperty:
        return this.renderAbstractProperty(node, parent);
      case node.element instanceof DefaultCharacteristic:
        return this.renderCharacteristic(node, parent);
      case node.element instanceof DefaultAbstractEntity:
        return this.renderAbstractEntity(node, parent);
      case node.element instanceof DefaultAspect:
        return this.renderAspect(node, parent);
      case node.element instanceof DefaultConstraint:
        return this.renderConstraint(node, parent);
      case node.element instanceof DefaultEvent:
        return this.renderEvent(node, parent);
      default:
        return null;
    }
  }

  // ==========================================================================================
  // Private helper functions
  // ==========================================================================================

  private inParentRendered(element: BaseMetaModelElement, parent: mxCell): boolean {
    return this.mxGraphService.graph
      .getOutgoingEdges(parent)
      .some(cell => MxGraphHelper.getModelElement(cell)?.aspectModelUrn === element.aspectModelUrn);
  }

  private connectIsolatedElement(parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (parentCell) {
      const childNode = MxGraphHelper.getElementNode(childCell);
      const child = childNode.element;
      const parent = MxGraphHelper.getModelElement(parentCell);

      const isParentIsolated = parent.parents.length === 0;
      const isChildIsolated = child.parents.length === 0;

      if (isParentIsolated && isChildIsolated) {
        this.assignToParent(childCell, parentCell, childNode);
      }
    }
  }

  private createMxCell(node: ModelTree<BaseMetaModelElement>, mxCellAttributes: ShapeAttribute[]): mxCell {
    return this.mxGraphService.renderModelElement(node, {shapeAttributes: mxCellAttributes, geometry: {}});
  }

  private getOrCreateMxCell(node: ModelTree<any>, mxCellAttributes: ShapeAttribute[]): mxCell {
    const shape = this.shapes.get(node.element.name) || this.mxGraphService.resolveCellByModelElement(node.element);

    if (shape) {
      return shape;
    }

    const cell = this.createMxCell(node, mxCellAttributes);

    if (
      this.rdfModel &&
      !RdfModelUtil.isPredefinedCharacteristic(node.element.aspectModelUrn, this.rdfModel.SAMMC()) &&
      !RdfModelUtil.isSammUDefinition(node.element.aspectModelUrn, this.rdfModel.SAMMU())
    ) {
      this.shapes.set(node.element.aspectModelUrn, cell);
    }

    return cell;
  }

  private assignToParent(cell: mxCell, context: mxCell, node: ModelTree<BaseMetaModelElement>) {
    this.mxGraphService.assignToParent(cell, context, node.fromParentArrow);
    this.removeActionIcons(node.element, cell);
  }

  private removeActionIcons(baseMetaModelElement: BaseMetaModelElement, cell: mxgraph.mxCell) {
    this.mxGraphShapeOverlayService.removeShapeActionIconsByLoading(baseMetaModelElement, cell);
  }
}
