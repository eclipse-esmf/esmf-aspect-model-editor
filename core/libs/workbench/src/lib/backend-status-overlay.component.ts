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

import {BackendStatusService} from '@ame/shared';
import {NgOptimizedImage} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TranslocoDirective} from '@jsverse/transloco';

/**
 * Full-screen blocking overlay shown while the desktop backend is starting or has failed.
 * While failed, the only possible actions are retrying the start or quitting the application.
 */
@Component({
  selector: 'ame-backend-status-overlay',
  templateUrl: './backend-status-overlay.component.html',
  styleUrls: ['./backend-status-overlay.component.scss'],
  imports: [NgOptimizedImage, MatButtonModule, MatProgressSpinnerModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alertdialog',
    'aria-modal': 'true',
    'aria-live': 'assertive',
    'data-testid': 'backend-status-overlay',
    '[attr.data-state]': 'backendStatus.status().state',
    '(contextmenu)': '$event.preventDefault(); $event.stopPropagation()',
  },
})
export class BackendStatusOverlayComponent {
  protected readonly backendStatus = inject(BackendStatusService);

  retry(): void {
    this.backendStatus.retry();
  }

  quit(): void {
    this.backendStatus.quit();
  }
}
