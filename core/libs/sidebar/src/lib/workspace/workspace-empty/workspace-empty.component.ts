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

import {NamespacesManagerService} from '@ame/namespace-manager';
import {Component, input} from '@angular/core';

@Component({
  selector: 'ame-workspace-empty',
  templateUrl: './workspace-empty.component.html',
  styleUrls: ['./workspace-empty.component.scss'],
})
export class WorkspaceEmptyComponent {
  loading = input(false);
  file: File | null = null;

  constructor(private namespacesManagerService: NamespacesManagerService) {}

  onFileInput(files: FileList | null): void {
    if (files) {
      this.file = files.item(0);
      this.namespacesManagerService.importNamespaces(this.file).subscribe();
    }
  }
}
