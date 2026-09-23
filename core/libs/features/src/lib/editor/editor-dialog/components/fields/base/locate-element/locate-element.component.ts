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

import {MaxGraphService} from '@ame/max-graph';
import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../../../editor-model.service';

@Component({
  selector: 'ame-locate-element',
  template: `<ng-container *transloco="let t">
    @if (element()) {
      <button
        [matTooltip]="t('editorCanvas.shapeSetting.locateElement')"
        (click)="locate()"
        type="button"
        mat-icon-button
        matTooltipPosition="above"
      >
        <mat-icon>gps_fixed</mat-icon>
      </button>
    }
  </ng-container> `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  imports: [MatTooltipModule, MatIconModule, MatIconButton, TranslocoDirective],
})
export class LocateElementComponent {
  public metaModelDialogService = inject(EditorModelService);
  private maxgraphService = inject(MaxGraphService);

  public element = toSignal(this.metaModelDialogService.getMetaModelElement());

  locate() {
    const el = this.element();
    if (el) this.maxgraphService.navigateToCellByUrn(el.aspectModelUrn);
  }
}
