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

import {EntityInstanceService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {ModelElementNamingService} from '@ame/meta-model';
import {MxGraphHelper, MxGraphRenderer, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {Injectable, inject} from '@angular/core';
import {DefaultProperty, Entity} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EntityConnectionHandler implements SingleShapeConnector<Entity> {
  private mxGraphShapeOverlay = inject(MxGraphShapeOverlayService);
  private sammLangService = inject(SammLanguageSettingsService);
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private entityInstanceService: EntityInstanceService,
    private filtersService: FiltersService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(entity: Entity, source: mxgraph.mxCell) {
    const defaultProperty = this.elementCreator.createEmptyElement(DefaultProperty);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const mxRenderer = new MxGraphRenderer(this.mxGraphService, this.mxGraphShapeOverlay, this.sammLangService, null);
    mxRenderer.render(this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}), source);
    entity.properties.push(defaultProperty);
    this.entityInstanceService.onNewProperty(defaultProperty, entity);
    this.mxGraphService.formatCell(source, true);
  }
}
