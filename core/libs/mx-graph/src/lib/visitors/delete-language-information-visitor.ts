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

/* eslint-disable @typescript-eslint/no-unused-vars */
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
  DefaultAbstractEntity,
} from '@ame/meta-model';
import {LogService} from '@ame/shared';
import {MxGraphHelper} from '../helpers';
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
      } else if (modelElement instanceof DefaultAbstractEntity) {
        this.visitAbstractEntity(modelElement, parents);
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
    });

    return MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getAspectCell());
  }

  private removeLanguageInformation(element: BaseMetaModelElement) {
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

      if (!cell['configuration']?.fields) {
        return;
      }

      const newCellConfig = [];
      cell['configuration'].fields.forEach(conf => {
        if (!((conf.key == 'description' || conf.key == 'preferredName') && conf.lang == locale)) {
          newCellConfig.push(conf);
        }
      });

      cell['configuration'].fields = newCellConfig;
      this.mxGraphAttributeService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
    });
  }

  visitAspect(aspect: DefaultAspect, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(aspect);
    return aspect;
  }

  visitCharacteristic(characteristic: DefaultCharacteristic, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(characteristic);
    return characteristic;
  }

  visitConstraint(constraint: DefaultConstraint, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(constraint);
    return constraint;
  }

  visitEntity(entity: DefaultEntity, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(entity);
    return entity;
  }

  visitOperation(operation: DefaultOperation, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(operation);
    return operation;
  }

  visitProperty(property: DefaultProperty, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(property);
    return property;
  }

  visitQuantityKind(quantityKind: DefaultQuantityKind, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(quantityKind);
    return quantityKind;
  }

  visitUnit(unit: DefaultUnit, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(unit);
    return unit;
  }

  visitEvent(event: DefaultEvent, _context: Array<BaseMetaModelElement>): BaseMetaModelElement {
    this.removeLanguageInformation(event);
    return event;
  }

  visitAbstractEntity(abstractEntity: DefaultAbstractEntity, _context: BaseMetaModelElement[]) {
    this.removeLanguageInformation(abstractEntity);
    return abstractEntity;
  }
}
