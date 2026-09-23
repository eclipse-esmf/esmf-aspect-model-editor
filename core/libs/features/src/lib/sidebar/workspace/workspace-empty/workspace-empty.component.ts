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

import {INamespacesManagerService, NAMESPACES_MANAGER_SERVICE, TauriSignalsService} from '@ame/shared';
import {Component, inject, input} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslocoDirective} from '@jsverse/transloco';

@Component({
  selector: 'ame-workspace-empty',
  templateUrl: './workspace-empty.component.html',
  styleUrls: ['./workspace-empty.component.scss'],
  imports: [MatProgressSpinner, MatButton, TranslocoDirective],
})
export class WorkspaceEmptyComponent {
  private namespacesManagerService: INamespacesManagerService = inject(NAMESPACES_MANAGER_SERVICE);
  private tauriSignalsService = inject(TauriSignalsService);

  private file: File | null = null;

  public loading = input(false);

  onFileInput(files: FileList | null): void {
    if (files) {
      this.file = files.item(0);
      this.namespacesManagerService.importNamespaces(this.file).subscribe(() => this.tauriSignalsService.call('requestRefreshWorkspaces'));
    }
  }
}
