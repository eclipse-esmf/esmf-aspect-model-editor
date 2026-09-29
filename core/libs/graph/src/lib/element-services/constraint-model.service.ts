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

import {ElementRelationUtil, useUpdater} from '@ame/shared';
import {Injectable} from '@angular/core';
import {
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  DefaultTrait,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class ConstraintModelService extends BaseModelService {
  update(cell: any, form: {[key: string]: any}) {
    let metaModelElement = ElementRelationUtil.getModelElement<DefaultConstraint>(cell);
    if (form.changedMetaModel) {
      this.currentCachedFile.removeElement(metaModelElement?.aspectModelUrn);
      this.currentCachedFile.resolveInstance(form.changedMetaModel);
      cell = this.graphAdapter?.resolveCellByModelElement(metaModelElement) || cell;

      cell.edges?.forEach(({source}) => {
        const trait = ElementRelationUtil.getModelElement<DefaultTrait>(source);
        trait.constraints = trait.constraints.filter(constraint => constraint.aspectModelUrn !== metaModelElement.aspectModelUrn);
        ElementRelationUtil.removeRelation(trait, metaModelElement);
        ElementRelationUtil.establishRelation(trait, form.changedMetaModel);
      });

      this.updateModelOfParent(cell, form.changedMetaModel);
      this.graphAdapter?.setElementFilterNode(cell, form.changedMetaModel);
      metaModelElement = form.changedMetaModel; // set the changed meta model as the actual
    }
    super.update(cell, form);
    this.updateFields(metaModelElement, form);

    this.graphAdapter?.updateCell(cell);
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultConstraint;
  }

  delete(cell: any) {
    super.delete(cell);
    const elementModel = ElementRelationUtil.getModelElement(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.graphAdapter?.removeCells([cell]);
  }

  private updateModelOfParent(cell: any, value: any) {
    (this.graphAdapter?.getIncomingEdges(cell) || []).forEach(cellParent => {
      const parentModel = ElementRelationUtil.getModelElement<NamedElement>(cellParent.source);
      useUpdater(parentModel).update(value);
    });
  }

  private updateFields(metaModelElement: DefaultConstraint, form: {[key: string]: any}) {
    if (metaModelElement instanceof DefaultFixedPointConstraint) {
      metaModelElement.scale = form.scale;
      metaModelElement.integer = form.integer;
    } else if (metaModelElement instanceof DefaultEncodingConstraint) {
      metaModelElement.value = form.value;
    } else if (metaModelElement instanceof DefaultLanguageConstraint) {
      metaModelElement.languageCode = form.languageCode;
    } else if (metaModelElement instanceof DefaultLengthConstraint) {
      metaModelElement.minValue = form.minValue;
      metaModelElement.maxValue = form.maxValue;
    } else if (metaModelElement instanceof DefaultLocaleConstraint) {
      metaModelElement.localeCode = form.localeCode;
    } else if (metaModelElement instanceof DefaultRangeConstraint) {
      metaModelElement.minValue = form.minValue;
      metaModelElement.maxValue = form.maxValue;
      metaModelElement.upperBoundDefinition = form.upperBoundDefinition;
      metaModelElement.lowerBoundDefinition = form.lowerBoundDefinition;
    } else if (metaModelElement instanceof DefaultRegularExpressionConstraint) {
      metaModelElement.value = form.value;
    }
  }
}
