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

import {Injectable, inject} from '@angular/core';
import {DefaultAbstractProperty} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {NamespacesCacheService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {RdfService} from '@ame/rdf/services';
import {FiltersService} from '@ame/loader-filters';

@Injectable({
  providedIn: 'root',
})
export class AbstractPropertyRenderService extends BaseRenderService {
  private filtersService = inject(FiltersService);

  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    rdfService: RdfService,
    private namespacesCacheService: NamespacesCacheService,
    private shapeConnectorService: ShapeConnectorService
  ) {
    super(mxGraphService, sammLangService, rdfService);
  }

  update({cell, callback}: RendererUpdatePayload) {
    this.handleExtendsElement(cell);
    this.renderParents(cell);

    super.update({cell, callback});
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultAbstractProperty;
  }

  private handleExtendsElement(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultAbstractProperty>(cell);
    if (!metaModelElement.extendedElement) {
      return;
    }

    const extendsElement = metaModelElement.extendedElement as DefaultAbstractProperty;
    const cachedEntity = this.namespacesCacheService.resolveCachedElement(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(this.filtersService.createNode(extendsElement, {parent: metaModelElement}));
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }
}
