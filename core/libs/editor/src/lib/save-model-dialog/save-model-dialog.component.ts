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

import {ModelSaverService} from '@ame/editor';
import {LanguageTranslateModule} from '@ame/translation';
import {Component, NgZone, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

@Component({
  standalone: true,
  templateUrl: 'save-model-dialog.component.html',
  styleUrls: ['save-model-dialog.component.scss'],
  imports: [MatDialogModule, LanguageTranslateModule, MatButtonModule],
})
export class SaveModelDialogComponent {
  private modelSaverService = inject(ModelSaverService);
  private matDialogRef: MatDialogRef<SaveModelDialogComponent> = inject(MatDialogRef);
  private zone: NgZone = inject(NgZone);

  public disabledButton = false;

  close(destroyWindow: boolean) {
    this.matDialogRef.close(destroyWindow);
  }

  saveModel() {
    this.disabledButton = true;
    this.zone.run(() => {
      this.modelSaverService.saveModel().subscribe(() => {
        this.disabledButton = false;
        this.matDialogRef.close(true);
      });
    });
  }
}
