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
import {MaxGraphService} from '@ame/max-graph';
import {ElementIconComponent, ElementType, sammElements} from '@ame/shared';
import {Component, computed, inject} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';
import {DraggableElementComponent} from '../draggable-element/draggable-element.component';
import {SidebarStateService} from '../sidebar-state.service';

@Component({
  selector: 'ame-sidebar-samm-elements',
  templateUrl: './sidebar-samm-elements.component.html',
  styleUrls: ['./sidebar-samm-elements.component.scss'],
  imports: [MatIconModule, DraggableElementComponent, MatMiniFabButton, ElementIconComponent, TranslocoDirective],
})
export class SidebarSAMMElementsComponent {
  private maxgraphService = inject(MaxGraphService);
  private loadedFiles = inject(LoadedFilesService);

  protected hasAspect = this.loadedFiles.hasAspect;

  public sidebarService = inject(SidebarStateService);
  public sammElements = sammElements;

  protected availableElements = computed(() =>
    (Object.keys(sammElements) as ElementType[]).filter(type => type !== 'entityInstance' && (type !== 'aspect' || !this.hasAspect())),
  );

  public get isEmptyModel(): boolean {
    return !this.maxgraphService.getAllCells()?.length;
  }
}
