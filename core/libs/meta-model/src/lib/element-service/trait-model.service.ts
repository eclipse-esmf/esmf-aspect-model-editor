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
import {NamespacesCacheService} from '@ame/cache';
import {
  ModelInfo,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  TraitRenderService,
} from '@ame/mx-graph';
import {mxgraph} from 'mxgraph-factory';
import {ShapeConnectorService} from '@ame/connection';
import {BaseMetaModelElement, DefaultCharacteristic, DefaultEither, DefaultTrait} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {BaseModelService} from './base-model-service';

interface EitherInformation {
  urn: string;
  left: string;
  right: string;
}

@Injectable({providedIn: 'root'})
export class TraitModelService extends BaseModelService {
  constructor(
    protected modelService: ModelService,
    protected namespacesCacheService: NamespacesCacheService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphService: MxGraphService,
    private shapeConnectorService: ShapeConnectorService,
    private traitRendererService: TraitRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    super.update(cell, form);
    this.traitRendererService.update({cell});
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultTrait;
  }

  delete(cell: mxgraph.mxCell) {
    const sourceTargetPair = this.getSourceTargetPairForReconnect(cell);

    const informationOfEithers: Array<EitherInformation> = [];
    sourceTargetPair.forEach((target, source) => {
      const sourceMetaModel = MxGraphHelper.getModelElement(source);
      if (sourceMetaModel instanceof DefaultEither) {
        informationOfEithers.push({
          urn: sourceMetaModel.aspectModelUrn,
          left:
            sourceMetaModel.left instanceof DefaultTrait
              ? sourceMetaModel.left?.baseCharacteristic?.aspectModelUrn
              : sourceMetaModel.left?.aspectModelUrn,
          right:
            sourceMetaModel.right instanceof DefaultTrait
              ? sourceMetaModel.right?.baseCharacteristic?.aspectModelUrn
              : sourceMetaModel.right?.aspectModelUrn,
        });
      }
    });

    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.mxGraphService.removeCells([cell]);
    this.reconnectShapePair(sourceTargetPair, informationOfEithers);
  }

  // Used to reconnect Characteristic with Properties if you delete theTrait
  private getSourceTargetPairForReconnect(cell: mxgraph.mxCell) {
    const sourceTargetPair = new Map();
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!modelElement.isExternalReference()) {
      const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
      const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);

      // outgoingEdges[0].target can be characteristic or constraint.
      // In this case we need to make sure that we relink property only to characteristic
      if (
        incomingEdges.length &&
        outgoingEdges.length &&
        MxGraphHelper.getModelElement(outgoingEdges[0].target) instanceof DefaultCharacteristic
      ) {
        incomingEdges.forEach(incomingEdge => {
          sourceTargetPair.set(incomingEdge.source, outgoingEdges[0].target);
        });
      }
    }
    return sourceTargetPair;
  }

  // This is for the special case when a trait is deleted and thus a property is automatically connected with a characteristic.
  private reconnectShapePair(sourceTargetPair: Map<any, any>, informationOfEithers: Array<EitherInformation>) {
    sourceTargetPair.forEach((target, source) => {
      let modelInfo = null;

      const targetModelElement = MxGraphHelper.getModelElement(target);
      const sourceModelElement = MxGraphHelper.getModelElement(source);

      if (sourceModelElement instanceof DefaultEither) {
        const either = informationOfEithers.find(eitherInfo => eitherInfo.urn === sourceModelElement.aspectModelUrn);
        if (either.left === targetModelElement.aspectModelUrn) {
          modelInfo = ModelInfo.IS_EITHER_LEFT;
        } else if (either.right == targetModelElement.aspectModelUrn) {
          modelInfo = ModelInfo.IS_EITHER_RIGHT;
        }
      }

      const newConnection = this.shapeConnectorService.connectShapes(sourceModelElement, targetModelElement, source, target, modelInfo);

      if (newConnection) {
        this.mxGraphShapeOverlayService.removeOverlay(target, MxGraphHelper.getTopOverlayButton(target));
        this.mxGraphShapeOverlayService.removeOverlaysByConnection(sourceModelElement, source);
        this.mxGraphShapeOverlayService.addTopShapeOverlay(target);
        this.mxGraphService.formatShapes();
      }
    });
  }
}
