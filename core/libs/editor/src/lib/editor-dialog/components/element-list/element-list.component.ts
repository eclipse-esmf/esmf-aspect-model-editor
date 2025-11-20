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
import {LoadedFilesService} from '@ame/cache';
import {MxGraphService} from '@ame/mx-graph';
import {ElementIconComponent, sammElements} from '@ame/shared';
import {CounterPipe} from '@ame/shared/pipes';
import {NgClass} from '@angular/common';
import {Component, inject, Input, OnInit} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {OpenReferencedElementService} from '../../../open-element-window/open-element-window.service';
import {ShapeSettingsService, ShapeSettingsStateService} from '../../services';
import {ModelElementParserPipe} from './element-list.pipe';

@Component({
  selector: 'ame-element-list',
  templateUrl: './element-list.component.html',
  styleUrls: ['element-list.component.scss'],
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIconModule,
    NgClass,
    CounterPipe,
    ModelElementParserPipe,
    ElementIconComponent,
    MatTooltipModule,
    MatIconButton,
    TranslatePipe,
  ],
})
export class ElementListComponent implements OnInit {
  @Input() public label = '';
  @Input() public iconRotation: 'rotate0' | 'rotate90' | 'rotate270' = 'rotate90';
  @Input() public elements: NamedElement[] = [];
  @Input() public isAspect? = false;

  private mxGraphService = inject(MxGraphService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private openReferencedElementService = inject(OpenReferencedElementService);
  public loadedFilesService = inject(LoadedFilesService);

  ngOnInit() {
    this.elements = Array.from(this.elements).filter(e => e instanceof NamedElement);
    if (this.elements.length > 1) {
      this.elements = this.elements.sort(this.compareByName);
    }
  }

  openElementModel(elementModel: NamedElement) {
    const cell = this.mxGraphService.resolveCellByModelElement(elementModel);
    this.shapeSettingsService.editModel(elementModel);
    if (cell) {
      this.mxGraphService.navigateToCell(cell, true);
      this.shapeSettingsStateService.selectedShapeForUpdate = cell;
    }
  }

  navigateToCell(elementModel: NamedElement) {
    this.mxGraphService.navigateToCellByUrn(elementModel.aspectModelUrn);
  }

  cellExists(elementModel: NamedElement): boolean {
    return !!this.mxGraphService.resolveCellByModelElement(elementModel);
  }

  openReferencedElement(element: NamedElement) {
    this.openReferencedElementService.openReferencedElement(element);
  }

  private compareByName(a: any, b: any): 0 | 1 | -1 {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  protected readonly sammElements = sammElements;
}
