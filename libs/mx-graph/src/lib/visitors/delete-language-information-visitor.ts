/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {
  BaseMetaModelElement,
  DefaultAspect,
  DefaultProperty,
  DefaultConstraint,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultOperation,
  DefaultUnit,
  DefaultQuantityKind,
  DefaultEvent,
} from '@bame/meta-model';
import {LogService} from '@bame/shared';
import {MxGraphHelper} from '../helpers';
import {MxAttributeName} from '../models';
import {MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService} from '../services';
import {DefaultAspectModelVisitor} from './default-aspect-model-visitor';

export class DeleteLanguageInformationVisitor extends DefaultAspectModelVisitor<BaseMetaModelElement, Array<BaseMetaModelElement>> {
  constructor(
    private locals: Array<string>,
    private mxGraphService: MxGraphService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private logService: LogService,
    private mxGraphAttributeService: MxGraphAttributeService
  ) {
    super();
  }

  visit(): BaseMetaModelElement {
    this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent()).forEach(mxCell => {
      const modelElement = MxGraphHelper.getModelElement(mxCell);

      if (!modelElement) {
        return;
      }

      const parents = this.mxGraphService.resolveParents(mxCell).map(parentCell => MxGraphHelper.getModelElement(parentCell));

      if (modelElement instanceof DefaultAspect) {
        this.visitAspect(modelElement, parents);
      } else if (modelElement instanceof DefaultProperty) {
        this.visitProperty(modelElement, parents);
      } else if (modelElement instanceof DefaultConstraint) {
        this.visitConstraint(modelElement, parents);
      } else if (modelElement instanceof DefaultCharacteristic) {
        this.visitCharacteristic(modelElement, parents);
      } else if (modelElement instanceof DefaultEntity) {
        this.visitEntity(modelElement, parents);
      } else if (modelElement instanceof DefaultOperation) {
        this.visitOperation(modelElement, parents);
      } else if (modelElement instanceof DefaultUnit) {
        this.visitUnit(modelElement, parents);
      } else if (modelElement instanceof DefaultQuantityKind) {
        this.visitQuantityKind(modelElement, parents);
      } else if (modelElement instanceof DefaultEvent) {
        this.visitEvent(modelElement, parents);
      }
      return;
    });

    return MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getAspectCell());
  }

  private removeLanguageInformation(element: BaseMetaModelElement) {
    const cellsToRemove = [];
    this.locals.forEach(locale => {
      if (element.getPreferredName(locale)) {
        this.logService.logInfo(`Delete '${element.getPreferredName(locale)}@${locale}' from ${element.aspectModelUrn}`);
      }
      if (element.getDescription(locale)) {
        this.logService.logInfo(`Delete '${element.getDescription(locale)}@${locale}' from ${element.aspectModelUrn}`);
      }
      element.removePreferredName(locale);
      element.removeDescription(locale);

      const cell = this.mxGraphService.resolveCellByModelElement(element);
      if (!cell.children) {
        return;
      }
      cell.children.forEach(childCell => {
        if (
          (childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === 'description' ||
            childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === 'preferredName') &&
          childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY_LOCALE) === locale
        ) {
          cellsToRemove.push(childCell);
        }
      });
    });
    this.mxGraphService.removeCells(cellsToRemove);
  }

  visitAspect(aspect: DefaultAspect, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(aspect);
    return aspect;
  }

  visitCharacteristic(characteristic: DefaultCharacteristic, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(characteristic);
    return characteristic;
  }

  visitConstraint(constraint: DefaultConstraint, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(constraint);
    return constraint;
  }

  visitEntity(entity: DefaultEntity, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(entity);
    return entity;
  }

  visitOperation(operation: DefaultOperation, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(operation);
    return operation;
  }

  visitProperty(property: DefaultProperty, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(property);
    return property;
  }

  visitQuantityKind(quantityKind: DefaultQuantityKind, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(quantityKind);
    return quantityKind;
  }

  visitUnit(unit: DefaultUnit, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(unit);
    return unit;
  }

  visitEvent(event: DefaultEvent, context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(event);
    return event;
  }
}
