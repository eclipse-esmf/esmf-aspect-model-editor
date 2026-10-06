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

import {GraphNavigatorPort, ModelSessionFacade} from '@ame/domain';
import {
  APP_CONFIG,
  ElementIconComponent,
  ElementType,
  ExternalLinkDirective,
  ResizeGutterComponent,
  sammElements,
  sammSpecificationUrl,
} from '@ame/shared';
import {Component, computed, inject, signal} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {DraggableElementComponent} from '../draggable-element/draggable-element.component';
import {SidebarStateService} from '../sidebar-state.service';

@Component({
  selector: 'ame-sidebar-samm-elements',
  templateUrl: './sidebar-samm-elements.component.html',
  styleUrls: ['./sidebar-samm-elements.component.scss'],
  imports: [
    ResizeGutterComponent,
    MatIconModule,
    DraggableElementComponent,
    MatMiniFabButton,
    ExternalLinkDirective,
    MatTooltipModule,
    ElementIconComponent,
    TranslocoDirective,
  ],
})
export class SidebarSAMMElementsComponent {
  protected readonly minWidth = 250;
  protected readonly maxWidth = 700;
  protected readonly storageKey = 'ame.sidebar.sammElements.width';
  /** `null` keeps the natural width until the user resizes the panel. */
  public readonly width = signal<number | null>(null);

  private graphNavigator = inject(GraphNavigatorPort);
  private loadedFiles = inject(ModelSessionFacade);

  protected hasAspect = this.loadedFiles.hasAspect;
  protected readonly sammVersion = inject(APP_CONFIG).currentSammVersion;
  protected readonly sammDocumentationUrl = sammSpecificationUrl(this.sammVersion, 'meta-model-elements.html');

  public sidebarService = inject(SidebarStateService);
  public sammElements = sammElements;

  protected availableElements = computed(() =>
    (Object.keys(sammElements) as ElementType[]).filter(type => type !== 'entityInstance' && (type !== 'aspect' || !this.hasAspect())),
  );

  public get isEmptyModel(): boolean {
    return !this.graphNavigator.hasElements();
  }
}
