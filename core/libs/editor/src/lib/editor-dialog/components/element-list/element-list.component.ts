/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {Component, Input} from '@angular/core';
import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {ShapeSettingsService, ShapeSettingsStateService} from '../../services';

@Component({
  selector: 'ame-element-list',
  templateUrl: './element-list.component.html',
  styleUrls: ['element-list.component.scss'],
})
export class ElementListComponent {
  @Input() public label = '';
  @Input() public iconRotation: 'rotate0' | 'rotate90' | 'rotate270' = 'rotate90';
  @Input() public elements: BaseMetaModelElement[] = [];

  constructor(
    private mxGraphService: MxGraphService,
    private shapeSettingsService: ShapeSettingsService,
    private shapeSettingsStateService: ShapeSettingsStateService
  ) {}

  editElementModel(elementModel: BaseMetaModelElement) {
    const cell = this.mxGraphService.resolveCellByModelElement(elementModel);
    this.shapeSettingsService.editModel(elementModel);
    if (cell) {
      this.mxGraphService.navigateToCell(cell, true);
      this.shapeSettingsStateService.selectedShapeForUpdate = cell;
    }
  }

  navigateToCell(elementModel: BaseMetaModelElement) {
    this.mxGraphService.navigateToCellByUrn(elementModel.aspectModelUrn);
  }

  cellExists(elementModel: BaseMetaModelElement): boolean {
    return !!this.mxGraphService.resolveCellByModelElement(elementModel);
  }
}
