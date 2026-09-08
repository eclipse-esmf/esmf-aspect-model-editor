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

import {FiltersService} from '@ame/loader-filters';
import {
  ConstraintRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
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
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class ConstraintModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly constraintRenderer = inject(ConstraintRenderService);
  private readonly filtersService = inject(FiltersService);

  update(cell: Cell, form: {[key: string]: any}) {
    let metaModelElement = MaxGraphHelper.getModelElement<DefaultConstraint>(cell);
    if (form.changedMetaModel) {
      this.currentCachedFile.removeElement(metaModelElement?.aspectModelUrn);
      this.currentCachedFile.resolveInstance(form.changedMetaModel);
      cell = this.maxgraphService.resolveCellByModelElement(metaModelElement) || cell;

      cell.edges?.forEach(({source}) => {
        const trait = MaxGraphHelper.getModelElement<DefaultTrait>(source);
        trait.constraints = trait.constraints.filter(constraint => constraint.aspectModelUrn !== metaModelElement.aspectModelUrn);
        MaxGraphHelper.removeRelation(trait, metaModelElement);
        MaxGraphHelper.establishRelation(trait, form.changedMetaModel);
      });

      this.updateModelOfParent(cell, form.changedMetaModel);
      MaxGraphHelper.setElementNode(cell, this.filtersService.createNode(form.changedMetaModel));
      metaModelElement = form.changedMetaModel; // set the changed meta model as the actual
    }
    super.update(cell, form);
    this.updateFields(metaModelElement, form);

    this.constraintRenderer.update({cell});
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultConstraint;
  }

  delete(cell: Cell) {
    super.delete(cell);
    const elementModel = MaxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.maxgraphService.removeCells([cell]);
  }

  private updateModelOfParent(cell: Cell, value: any) {
    this.maxgraphAttributeService.graph.getIncomingEdges(cell, null).forEach(cellParent => {
      const parentModel = MaxGraphHelper.getModelElement<NamedElement>(cellParent.source);
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
