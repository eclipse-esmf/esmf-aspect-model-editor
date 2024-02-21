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

import {Component, Input} from '@angular/core';

@Component({
  selector: 'ame-workspace-empty',
  templateUrl: './workspace-empty.component.html',
  styleUrls: ['./workspace-empty.component.scss'],
})
export class WorkspaceEmptyComponent {
  @Input() loading = false;
}
