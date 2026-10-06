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

import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {MaxGraphHelper} from '../helpers';
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeSelectorService} from '../services';

@Injectable({providedIn: 'root'})
export class ShapeLanguageRemover {
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  removeUnnecessaryLanguages(locales: string[]) {
    this.maxgraphAttributeService.graph.getChildCells(this.maxgraphAttributeService.graph.getDefaultParent()).forEach(cell => {
      const modelElement = MaxGraphHelper.getModelElement(cell);
      if (!modelElement) {
        return;
      }

      this.removeLanguageInformation(modelElement, locales);
    });

    return MaxGraphHelper.getModelElement(this.maxgraphShapeSelectorService.getAspectCell());
  }

  private removeLanguageInformation(element: NamedElement, locales: string[]) {
    locales.forEach(locale => {
      if (element.getPreferredName(locale)) {
        console.info(`Delete '${element.getPreferredName(locale)}@${locale}' from ${element.aspectModelUrn}`);
      }
      if (element.getDescription(locale)) {
        console.info(`Delete '${element.getDescription(locale)}@${locale}' from ${element.aspectModelUrn}`);
      }
      element.preferredNames.delete(locale);
      element.descriptions.delete(locale);

      const cell = this.maxgraphService.resolveCellByModelElement(element);

      if (!cell?.['configuration']?.fields) {
        return;
      }

      const newCellConfig = [];
      cell['configuration'].fields.forEach(conf => {
        if (!((conf.key == 'description' || conf.key == 'preferredName') && conf.lang == locale)) {
          newCellConfig.push(conf);
        }
      });

      cell['configuration'].fields = newCellConfig;
      this.maxgraphAttributeService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
    });
  }
}
