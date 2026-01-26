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

import {MxGraphService} from '@ame/mx-graph';
import {Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {EditorModelService} from '../../../../editor-model.service';

@Component({
  selector: 'ame-locate-element',
  template: `@if (element) {
    <button
      [matTooltip]="'EDITOR_CANVAS.SHAPE_SETTING.LOCATE_ELEMENT' | translate"
      (click)="locate()"
      mat-icon-button
      matTooltipPosition="above"
    >
      <mat-icon>gps_fixed</mat-icon>
    </button>
  }`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  imports: [MatTooltipModule, MatIconModule, MatIconButton, TranslatePipe],
})
export class LocateElementComponent {
  public destroyRef = inject(DestroyRef);
  public metaModelDialogService = inject(EditorModelService);
  private mxgraphService = inject(MxGraphService);

  public element: NamedElement;

  constructor() {
    this.metaModelDialogService
      .getMetaModelElement()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(element => (this.element = element));
  }

  locate() {
    if (this.element) this.mxgraphService.navigateToCellByUrn(this.element.aspectModelUrn);
  }
}
