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

import {Component, inject} from '@angular/core';
import {MatButtonToggleChange, MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorViewMode, EditorViewModeService} from './editor-view-mode.service';

/** Switches the editor between the MaxGraph view and the textual (Turtle) view of the aspect model. */
@Component({
  selector: 'ame-editor-view-toggle',
  template: `
    <mat-button-toggle-group
      class="view-toggle"
      *transloco="let t"
      [value]="viewMode.mode()"
      [attr.aria-label]="t('textView.toggleLabel')"
      (change)="onChange($event)"
      hideSingleSelectionIndicator
      data-testid="editor-view-toggle"
    >
      <mat-button-toggle [matTooltip]="t('textView.graphTooltip')" matTooltipPosition="left" value="graph" data-testid="editor-view-graph">
        <mat-icon>account_tree</mat-icon>
        <span>{{ t('textView.graph') }}</span>
      </mat-button-toggle>
      <mat-button-toggle [matTooltip]="t('textView.textTooltip')" matTooltipPosition="left" value="text" data-testid="editor-view-text">
        <mat-icon>code</mat-icon>
        <span>{{ t('textView.aspectModel') }}</span>
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        padding: 0 8px;
      }

      .view-toggle {
        --mat-button-toggle-height: 26px;
        --mat-button-toggle-shape: 6px;
        --mat-button-toggle-label-text-size: 12px;
        border-color: var(--ame-gray-10);
      }

      .view-toggle ::ng-deep .mat-button-toggle-label-content {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 10px;
        line-height: 26px;
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    `,
  ],
  imports: [MatButtonToggleModule, MatIconModule, MatTooltipModule, TranslocoDirective],
})
export class EditorViewToggleComponent {
  protected readonly viewMode = inject(EditorViewModeService);

  onChange(event: MatButtonToggleChange): void {
    this.viewMode.setMode(event.value as EditorViewMode);
  }
}
