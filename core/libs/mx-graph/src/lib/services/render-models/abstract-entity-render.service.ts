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
import {DefaultAbstractEntity} from '@ame/meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {NamespacesCacheService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    languageSettingsService: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService,
    private shapeConnectorService: ShapeConnectorService
  ) {
    super(mxGraphService, languageSettingsService);
  }

  update({cell}) {
    this.handleExtendsElement(cell);

    super.update({
      cell,
      callback: () => {
        this.renderOptionalProperties(cell);
      },
    });
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultAbstractEntity;
  }

  private handleExtendsElement(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultAbstractEntity>(cell);
    if (!metaModelElement.extendedElement) {
      return;
    }

    const extendsElement = metaModelElement.extendedElement as DefaultAbstractEntity;
    const cachedEntity = this.namespacesCacheService.resolveCachedElement(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(extendsElement);
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }
}
