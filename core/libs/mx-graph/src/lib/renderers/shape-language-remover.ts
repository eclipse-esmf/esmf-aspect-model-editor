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

import {NamedElement} from '@esmf/aspect-model-loader';
import {MxGraphHelper} from '../helpers';
import {MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService} from '../services';

export class ShapeLanguageRemover {
  constructor(
    private locals: Array<string>,
    private mxGraphService: MxGraphService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {}

  removeUnnecessaryLanguages(): NamedElement {
    this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent()).forEach(mxCell => {
      const modelElement = MxGraphHelper.getModelElement(mxCell);
      if (!modelElement) {
        return;
      }

      this.removeLanguageInformation(modelElement);
    });

    return MxGraphHelper.getModelElement(this.mxGraphShapeSelectorService.getAspectCell());
  }

  private removeLanguageInformation(element: NamedElement) {
    this.locals.forEach(locale => {
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
