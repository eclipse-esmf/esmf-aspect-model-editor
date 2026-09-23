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

import {getModelElement, ModelInfo} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEither, DefaultTrait, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

interface EitherInformation {
  urn: string;
  left: string;
  right: string;
}

@Injectable({providedIn: 'root'})
export class TraitModelService extends BaseModelService {
  update(cell: any, form: {[key: string]: any}) {
    super.update(cell, form);
    this.graphAdapter?.updateCell(cell);
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultTrait;
  }

  delete(cell: any) {
    const sourceTargetPair = this.getSourceTargetPairForReconnect(cell);

    const informationOfEithers: Array<EitherInformation> = [];
    Array.from(sourceTargetPair.keys()).forEach(source => {
      const sourceMetaModel = getModelElement(source);
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
    const elementModel = getModelElement(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.graphAdapter?.removeCells([cell]);
    this.reconnectShapePair(sourceTargetPair, informationOfEithers);
  }

  // Used to reconnect Characteristic with Properties if you delete theTrait
  private getSourceTargetPairForReconnect(cell: any) {
    const sourceTargetPair = new Map();
    const elementModel = getModelElement(cell);
    if (this.loadedFilesService.isElementInCurrentFile(elementModel)) {
      const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
      const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];

      // outgoingEdges[0].target can be characteristic or constraint.
      // In this case we need to make sure that we relink property only to characteristic
      const characteristicEdge = outgoingEdges.find(edge => getModelElement(edge.target) instanceof DefaultCharacteristic);
      if (incomingEdges.length && outgoingEdges.length && characteristicEdge) {
        incomingEdges.forEach(incomingEdge => sourceTargetPair.set(incomingEdge.source, characteristicEdge.target));
      }
    }
    return sourceTargetPair;
  }

  // This is for the special case when a trait is deleted and thus a property is automatically connected with a characteristic.
  private reconnectShapePair(sourceTargetPair: Map<any, any>, informationOfEithers: Array<EitherInformation>) {
    sourceTargetPair.forEach((target, source) => {
      let modelInfo = null;

      const targetModelElement = getModelElement(target);
      const sourceModelElement = getModelElement(source);

      if (sourceModelElement instanceof DefaultEither) {
        const either = informationOfEithers.find(eitherInfo => eitherInfo.urn === sourceModelElement.aspectModelUrn);
        if (either.left === targetModelElement.aspectModelUrn) {
          modelInfo = ModelInfo.IS_EITHER_LEFT;
        } else if (either.right == targetModelElement.aspectModelUrn) {
          modelInfo = ModelInfo.IS_EITHER_RIGHT;
        }
      }

      this.graphAdapter?.reconnectTraitShape(source, target, sourceModelElement, targetModelElement, modelInfo);
    });
  }
}
