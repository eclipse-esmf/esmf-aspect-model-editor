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

import {FiltersService} from '@ame/domain';
import {LoadedFilesService} from '@ame/infrastructure';
import {ElementCreatorService, ISammLanguageSettingsService, SAMM_LANGUAGE_SETTINGS_SERVICE} from '@ame/shared';
import {Directive, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphRenderer,
  MaxGraphService,
  MaxGraphShapeOverlayService,
  MaxGraphVisitorHelper,
} from '../max-graph';

@Directive()
export class BaseConnectionHandler {
  protected readonly sammLangService: ISammLanguageSettingsService = inject(SAMM_LANGUAGE_SETTINGS_SERVICE);
  protected readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  protected readonly elementCreator = inject(ElementCreatorService);
  protected readonly maxgraphService = inject(MaxGraphService);
  protected readonly filtersService = inject(FiltersService);
  protected readonly maxgraphShapeOverlay = inject(MaxGraphShapeOverlayService);
  protected readonly loadedFilesService = inject(LoadedFilesService);

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
