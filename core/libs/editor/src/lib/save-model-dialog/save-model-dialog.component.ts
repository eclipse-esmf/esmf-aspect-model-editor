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

import {Component, NgZone} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {EditorService} from '@ame/editor';
import {LanguageTranslateModule} from '@ame/translation';
import {MatButtonModule} from '@angular/material/button';

@Component({
  standalone: true,
  templateUrl: 'save-model-dialog.component.html',
  styleUrls: ['save-model-dialog.component.scss'],
  imports: [MatDialogModule, LanguageTranslateModule, MatButtonModule],
})
export class SaveModelDialogComponent {
  public disabledButton = false;

  constructor(
    private matDialogRef: MatDialogRef<SaveModelDialogComponent>,
    private editorService: EditorService,
    private zone: NgZone,
  ) {}

  close(destroyWindow: boolean) {
    this.matDialogRef.close(destroyWindow);
  }

  saveModel() {
    this.disabledButton = true;
    this.zone.run(() => {
      this.editorService.saveModel().subscribe(() => {
        this.disabledButton = false;
        this.matDialogRef.close(true);
      });
    });
  }
}
