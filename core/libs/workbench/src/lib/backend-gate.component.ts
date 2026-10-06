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
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BackendStatusOverlayComponent} from './backend-status-overlay.component';

/**
 * Renders the routed application only after the backend was ready once and blocks it with an
 * overlay whenever the backend is not ready (starting, failed or crashed).
 */
@Component({
  selector: 'ame-backend-gate',
  template: `
    @if (backendStatus.hasBeenReady()) {
      <div class="app-content" [attr.inert]="backendStatus.isReady() ? null : ''">
        <router-outlet></router-outlet>
      </div>
    }
    @if (!backendStatus.isReady()) {
      <ame-backend-status-overlay></ame-backend-status-overlay>
    }
  `,
  styles: [':host, .app-content { display: contents; }'],
  imports: [RouterOutlet, BackendStatusOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackendGateComponent {
  protected readonly backendStatus = inject(BackendStatusService);
}
