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

import {Component, input} from '@angular/core';
import {TranslocoDirective} from '@jsverse/transloco';

interface WorkspaceValidationError {
  code: number;
  message: string;
  path: string;
}

@Component({
  selector: 'ame-workspace-error',
  templateUrl: './workspace-error.component.html',
  styleUrls: ['./workspace-error.component.scss'],
  imports: [TranslocoDirective],
})
export class WorkspaceErrorComponent {
  error = input<WorkspaceValidationError>();
}
