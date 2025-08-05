/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {Directive, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';

@Directive()
export class BaseConnectionHandler {
  protected readonly sammLangService = inject(SammLanguageSettingsService);
  protected readonly mxGraphAttributeService = inject(MxGraphAttributeService);
  protected readonly elementCreator = inject(ElementCreatorService);
  protected readonly mxGraphService = inject(MxGraphService);
  protected readonly filtersService = inject(FiltersService);
  protected mxGraphShapeOverlay = inject(MxGraphShapeOverlayService);

  refreshPropertiesLabel(cell: mxgraph.mxCell, modelElement: NamedElement) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    this.mxGraphAttributeService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }

  renderTree(modelElement: NamedElement, parent: mxgraph.mxCell): mxgraph.mxCell {
    const node = this.filtersService.createNode(modelElement, {parent: MxGraphHelper.getModelElement(parent)});
    const mxRenderer = new MxGraphRenderer(this.mxGraphService, this.mxGraphShapeOverlay, this.sammLangService, null);
    return mxRenderer.render(node, parent);
  }
}
