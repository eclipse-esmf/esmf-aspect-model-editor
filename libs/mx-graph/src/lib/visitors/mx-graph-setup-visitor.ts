/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {mxCell, mxgraph} from 'mxgraph';
import {MxGraphHelper, MxGraphVisitorHelper, PropertyInformation} from '../helpers';
import {DefaultAspectModelVisitor} from './default-aspect-model-visitor';
import {MxGraphService, MxGraphShapeOverlayService} from '../services';
import {
  Base,
  BaseMetaModelElement,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultUnit,
} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {NamespacesCacheService} from '@bame/cache';
import {RdfModel, RdfModelUtil} from '@bame/rdf/utils';

export class MxGraphSetupVisitor extends DefaultAspectModelVisitor<mxCell, mxCell> {
  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  private shapes: Map<string, mxCell>;

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService,
    private languageSettingsService: LanguageSettingsService,
    private rdfModel: RdfModel
  ) {
    super();
    this.shapes = new Map<string, mxCell>();
  }

  // ==========================================================================================
  // Supported visitor types
  // ==========================================================================================

  visitOperation(operation: DefaultOperation, context: mxCell): mxCell {
    const cell = this.createMxCell(operation, MxGraphVisitorHelper.getOperationProperties(operation, this.languageSettingsService));
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(operation.aspectModelUrn)) {
      this.assignToParent(cell, context, operation);
    }
    return cell;
  }

  visitEntity(entity: DefaultEntity, context: mxCell): mxCell {
    if (this.shapes.get(entity.name)) {
      const cellTmp = this.shapes.get(entity.name);
      // Todo It may be that characteristics are not connected.
      if (!this.currentCachedFile.getIsolatedElement(entity.aspectModelUrn)) {
        this.mxGraphService.assignToParent(cellTmp, context);
      }
      return;
    }

    const cell = this.getOrCreateMxCell(entity, MxGraphVisitorHelper.getEntityProperties(entity, this.languageSettingsService));
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(entity.aspectModelUrn)) {
      this.assignToParent(cell, context, entity);
    }
    return cell;
  }

  visitEntityValue(entityValue: DefaultEntityValue, context: mxCell): mxCell {
    const cell = this.getOrCreateMxCell(entityValue, []);
    if (!this.currentCachedFile.getIsolatedElement(entityValue.aspectModelUrn)) {
      this.assignToParent(cell, context, entityValue);
    }

    this.mxGraphService.assignToParent(cell, context);
    return cell;
  }

  visitUnit(unit: DefaultUnit, context: mxCell): mxCell {
    if (this.inParent(unit, context) || !(MxGraphHelper.getModelElement(context) instanceof DefaultCharacteristic)) {
      return null;
    }

    const cell = this.getOrCreateMxCell(unit, MxGraphVisitorHelper.getUnitProperties(unit, this.languageSettingsService));
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(unit.aspectModelUrn)) {
      this.assignToParent(cell, context, unit);
    }
    return cell;
  }

  visitQuantityKind(quantityKind: DefaultQuantityKind, context: mxCell): mxCell {
    // The information is directly shown on the unit, mainly to reduce the amount of shapes
  }

  visitProperty(property: DefaultProperty, context: mxgraph.mxCell): mxgraph.mxCell {
    const cell = this.getOrCreateMxCell(property, MxGraphVisitorHelper.getPropertyProperties(property, this.languageSettingsService));
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(property.aspectModelUrn)) {
      this.assignToParent(cell, context, property);
    }
    return cell;
  }

  visitCharacteristic(characteristic: DefaultCharacteristic, context: mxCell): mxCell {
    const cell = this.getOrCreateMxCell(
      characteristic,
      MxGraphVisitorHelper.getCharacteristicProperties(characteristic, this.languageSettingsService)
    );
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(characteristic.aspectModelUrn)) {
      this.assignToParent(cell, context, characteristic);
    }
    return cell;
  }

  visitAspect(aspect: DefaultAspect, context: mxCell): mxCell {
    // English is our default at the moment.
    this.languageSettingsService.setLanguageCodes(['en']);
    return this.createMxCell(aspect, MxGraphVisitorHelper.getAspectProperties(aspect, this.languageSettingsService));
  }

  visitConstraint(constraint: DefaultConstraint, context: mxCell): mxCell {
    const cell = this.getOrCreateMxCell(constraint, MxGraphVisitorHelper.getConstraintProperties(constraint, this.languageSettingsService));
    MxGraphHelper.setModelElement(cell, constraint);
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(constraint.aspectModelUrn)) {
      this.assignToParent(cell, context, constraint);
    }
    return cell;
  }

  visitEvent(event: DefaultEvent, context: mxCell): mxCell {
    const cell = this.createMxCell(event, MxGraphVisitorHelper.getEventProperties(event, this.languageSettingsService));
    this.connectIsolatedElement(context, cell);

    if (!this.currentCachedFile.getIsolatedElement(event.aspectModelUrn)) {
      this.assignToParent(cell, context, event);
    }
    return cell;
  }

  // ==========================================================================================
  // Private helper functions
  // ==========================================================================================

  private inParent(element: BaseMetaModelElement, parent: mxCell) {
    return parent?.edges?.some(edge => {
      if (!edge.target) {
        return false;
      }

      return MxGraphHelper.getModelElement(edge.target).aspectModelUrn === element.aspectModelUrn;
    });
  }

  private connectIsolatedElement(parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (parentCell) {
      const child = MxGraphHelper.getModelElement(childCell);
      const parent = MxGraphHelper.getModelElement(parentCell);

      const isParentIsolated = !!this.currentCachedFile.getIsolatedElement(parent.aspectModelUrn);
      const isChildIsolated = !!this.currentCachedFile.getIsolatedElement(child.aspectModelUrn);

      if (isParentIsolated && isChildIsolated) {
        this.assignToParent(childCell, parentCell, child);
      }
    }
  }

  private createMxCell(metaModelElement: BaseMetaModelElement, mxCellAttributes: PropertyInformation[]): mxCell {
    return this.mxGraphService.renderModelElement(metaModelElement, mxCellAttributes);
  }

  private getOrCreateMxCell(base: Base, mxCellAttributes: PropertyInformation[]): mxCell {
    const shape = this.shapes.get(base.name);

    if (shape) {
      return shape;
    }

    const cell = this.createMxCell(base, mxCellAttributes);

    if (
      this.rdfModel &&
      !RdfModelUtil.isPredefinedCharacteristic(base.aspectModelUrn, this.rdfModel.BAMMC()) &&
      !RdfModelUtil.isBammuDefinition(base.aspectModelUrn, this.rdfModel.BAMMU())
    ) {
      this.shapes.set(base.name, cell);
    }

    return cell;
  }

  private assignToParent(cell: mxCell, context: mxCell, element: BaseMetaModelElement) {
    this.mxGraphService.assignToParent(cell, context);
    this.removeActionIcons(element, cell);
  }

  private removeActionIcons(baseMetaModelElement: BaseMetaModelElement, cell: mxgraph.mxCell) {
    this.mxGraphShapeOverlayService.removeShapeActionIconsByLoading(baseMetaModelElement, cell);
  }
}
