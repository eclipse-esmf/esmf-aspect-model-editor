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

import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {MxGraphHelper} from '../helpers';
import {MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService} from '../services';

@Injectable({providedIn: 'root'})
export class ShapeLanguageRemover {
  private mxGraphService = inject(MxGraphService);
  private mxGraphShapeSelectorService = inject(MxGraphShapeSelectorService);
  private mxGraphAttributeService = inject(MxGraphAttributeService);

  removeUnnecessaryLanguages(locales: string[]) {
    this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent()).forEach(mxCell => {
      const modelElement = MxGraphHelper.getModelElement(mxCell);
      if (!modelElement) {
        return;
      }

      this.removeLanguageInformation(modelElement, locales);
    });

    return MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getAspectCell());
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

      const cell = this.mxGraphService.resolveCellByModelElement(element);

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
      this.mxGraphAttributeService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
    });
  }
}
