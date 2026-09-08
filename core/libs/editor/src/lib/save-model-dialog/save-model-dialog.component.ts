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

import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TranslocoDirective} from '@jsverse/transloco';
import {ModelSaverService} from '../model-saver.service';

@Component({
  templateUrl: 'save-model-dialog.component.html',
  styleUrls: ['save-model-dialog.component.scss'],
  imports: [MatDialogModule, TranslocoDirective, MatButtonModule],
})
export class SaveModelDialogComponent {
  private modelSaverService = inject(ModelSaverService);
  private matDialogRef: MatDialogRef<SaveModelDialogComponent> = inject(MatDialogRef);

  public disabledButton = signal(false);

  close(destroyWindow: boolean) {
    this.matDialogRef.close(destroyWindow);
  }

  saveModel() {
    this.disabledButton.set(true);
    this.modelSaverService.saveModel().subscribe(() => {
      this.disabledButton.set(false);
      this.matDialogRef.close(true);
    });
  }
}
