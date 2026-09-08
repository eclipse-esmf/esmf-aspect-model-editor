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
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphRenderer,
  MaxGraphService,
  MaxGraphShapeOverlayService,
  MaxGraphVisitorHelper,
} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {Directive, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';

@Directive()
export class BaseConnectionHandler {
  protected readonly sammLangService = inject(SammLanguageSettingsService);
  protected readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  protected readonly elementCreator = inject(ElementCreatorService);
  protected readonly maxgraphService = inject(MaxGraphService);
  protected readonly filtersService = inject(FiltersService);
  protected readonly maxgraphShapeOverlay = inject(MaxGraphShapeOverlayService);

  refreshPropertiesLabel(cell: Cell, modelElement: NamedElement) {
    if (cell && (cell as any).configuration) {
      (cell as any).configuration.fields = MaxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    }
    this.maxgraphAttributeService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }

  renderTree(modelElement: NamedElement, parent: Cell): Cell {
    const node = this.filtersService.createNode(modelElement, {parent: MaxGraphHelper.getModelElement(parent)});
    const mxRenderer = new MaxGraphRenderer(this.maxgraphService, this.maxgraphShapeOverlay, this.sammLangService, null);
    return mxRenderer.render(node, parent);
  }
}
