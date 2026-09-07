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

import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {inject} from '@angular/core';
import {DefaultAspect, DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {MaxGraphHelper, MaxGraphVisitorHelper} from '../../helpers';
import {ModelStyleResolver, RendererUpdatePayload} from '../../models';
import {ThemeService} from '../../themes';
import {MaxGraphAttributeService} from '../max-graph-attribute.service';
import {MaxGraphService} from '../max-graph.service';

export abstract class BaseRenderService {
  protected readonly maxgraphService = inject(MaxGraphService);
  protected readonly sammLangService = inject(SammLanguageSettingsService);
  protected readonly loadedFilesService = inject(LoadedFilesService);
  protected readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  protected readonly themeService = inject(ThemeService);

  get graph(): Graph {
    return this.maxgraphService.graph;
  }

  public abstract isApplicable(cell: Cell): boolean;

  public update({cell, callback}: RendererUpdatePayload) {
    const modelElement = MaxGraphHelper.getModelElement(cell);

    const cellId = modelElement.isAnonymous?.() ? modelElement.aspectModelUrn : modelElement.name;
    cell.setId(cellId);
    cell.setAttribute('name', modelElement.name);

    const styleName = (cell.style?.baseStyleNames?.[0] as string) || (modelElement ? ModelStyleResolver.resolve(modelElement) : '');
    const style = this.themeService.generateThemeStyle(styleName);
    if (this.loadedFilesService.isElementExtern(modelElement)) {
      style.fillOpacity = 80;
    }
    if (modelElement?.isAnonymous?.()) {
      style.dashed = true;
      style.dashPattern = '4 4';
    }
    this.graph.setCellStyle(style, [cell]);

    const node = MaxGraphHelper.getElementNode(cell);
    if (node?.shape) {
      node.shape.maxgraphStyle = style;
    }

    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    cell['configuration'].baseProperties = MaxGraphVisitorHelper.getModelInfo(modelElement, this.loadedFilesService.currentLoadedFile);
    this.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);

    if (typeof callback === 'function') {
      callback();
    }
    this.maxgraphService.formatCell(cell);
    this.maxgraphService.formatShapes();
  }

  protected renderOptionalProperties(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultAspect | DefaultEntity>(cell);
    this.graph.getOutgoingEdges(cell, null)?.forEach((e: Cell) => {
      const property = MaxGraphHelper.getModelElement(e.target);
      if (!(property instanceof DefaultProperty)) {
        return;
      }

      this.maxgraphService.removeCells([e]);
      MaxGraphHelper.establishRelation(modelElement, property);
      this.graph.insertEdge(this.graph.getDefaultParent(), null, null, e.source, e.target, {
        baseStyleNames: [modelElement.propertiesPayload[property.aspectModelUrn]?.optional ? 'optionalPropertyEdge' : 'defaultEdge'],
        strokeColor: this.themeService.currentColors.border,
        fontColor: this.themeService.currentColors.font,
      });
    });
  }

  protected inMaxgraph(modelElement: NamedElement): Cell {
    return this.maxgraphService
      ?.getAllCells()
      ?.find(cell => MaxGraphHelper.getModelElement(cell)?.aspectModelUrn === modelElement?.aspectModelUrn);
  }

  protected renderParents(cell: Cell) {
    const parents = this.maxgraphService.resolveParents(cell);

    for (const parent of parents) {
      const parentElementModel = MaxGraphHelper.getModelElement(parent);
      parent['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(parentElementModel, this.sammLangService);
      parent['configuration'].baseProperties = MaxGraphVisitorHelper.getModelInfo(
        parentElementModel,
        this.loadedFilesService.currentLoadedFile,
      );
      this.graph.labelChanged(parent, MaxGraphHelper.createPropertiesLabel(parent), null);
    }
  }

  protected refreshPropertiesLabel(cell: Cell, modelElement: NamedElement) {
    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    this.maxgraphAttributeService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }
}
