/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'ame-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss'],
})
export class SettingDialogComponent {
  constructor(private dialogRef: MatDialogRef<SettingDialogComponent>) {}

  tabs = [
    {
      label: 'Configuration',
      configuration: true,
    },
    {
      label: 'Languages',
      languages: true,
    },
    {
      label: 'Namespaces',
      namespaces: true,
    },
  ];

  onClose(): void {
    this.dialogRef.close();
  }
}
