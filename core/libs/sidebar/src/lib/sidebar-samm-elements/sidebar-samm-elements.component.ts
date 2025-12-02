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
import {ElementIconComponent, ElementType, sammElements} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {Component, inject} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Aspect} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {DraggableElementComponent} from '../draggable-element/draggable-element.component';

@Component({
  selector: 'ame-sidebar-samm-elements',
  templateUrl: './sidebar-samm-elements.component.html',
  styleUrls: ['./sidebar-samm-elements.component.scss'],
  imports: [MatIconModule, DraggableElementComponent, MatMiniFabButton, ElementIconComponent, TranslatePipe],
})
export class SidebarSAMMElementsComponent {
  private mxGraphService = inject(MxGraphService);
  private loadedFiles = inject(LoadedFilesService);

  public sidebarService = inject(SidebarStateService);
  public sammElements = sammElements;
  public elementsOrder: ElementType[] = [
    'aspect',
    'abstract-property',
    'property',
    'characteristic',
    'abstract-entity',
    'entity',
    'unit',
    'constraint',
    'trait',
    'operation',
    'event',
    'value',
  ];

  public get isEmptyModel(): boolean {
    return !this.mxGraphService.getAllCells()?.length;
  }

  public isAspectAvailable(): Aspect {
    return this.loadedFiles.currentLoadedFile?.aspect;
  }
}
