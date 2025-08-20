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

import {FiltersService} from '@ame/loader-filters';
import {ConstraintRenderService, MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {useUpdater} from '@ame/utils';
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
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class ConstraintModelService extends BaseModelService {
  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private constraintRenderer: ConstraintRenderService,
    private filtersService: FiltersService,
  ) {
    super();
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    let metaModelElement = MxGraphHelper.getModelElement<DefaultConstraint>(cell);
    if (form.changedMetaModel) {
      this.currentCachedFile.removeElement(metaModelElement?.aspectModelUrn);
      this.currentCachedFile.resolveInstance(form.changedMetaModel);
      cell = this.mxGraphService.resolveCellByModelElement(metaModelElement);

      cell.edges?.forEach(({source}) => {
        const trait = MxGraphHelper.getModelElement<DefaultTrait>(source);
        trait.constraints = trait.constraints.filter(constraint => constraint.aspectModelUrn !== metaModelElement.aspectModelUrn);
        MxGraphHelper.removeRelation(trait, metaModelElement);
        MxGraphHelper.establishRelation(trait, form.changedMetaModel);
      });

      this.updateModelOfParent(cell, form.changedMetaModel);
      MxGraphHelper.setElementNode(cell, this.filtersService.createNode(form.changedMetaModel));
      metaModelElement = form.changedMetaModel; // set the changed meta model as the actual
    }
    super.update(cell, form);
    this.updateFields(metaModelElement, form);

    this.constraintRenderer.update({cell});
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultConstraint;
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    const elementModel = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.mxGraphService.removeCells([cell]);
  }

  private updateModelOfParent(cell: mxgraph.mxCell, value: any) {
    this.mxGraphAttributeService.graph.getIncomingEdges(cell).forEach(cellParent => {
      const parentModel = MxGraphHelper.getModelElement<NamedElement>(cellParent.source);
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
