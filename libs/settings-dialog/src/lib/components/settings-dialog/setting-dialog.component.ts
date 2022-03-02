/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'bci-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss']
})
export class SettingDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SettingDialogComponent>,
  ) { }

  tabs = [
    {
      label: 'Configuration',
      configuration: true
    }, {
      label: 'Languages',
      languages: true
    }, {
      label: 'Namespaces',
      namespaces: true
    }
  ];

  onClose(): void {
    this.dialogRef.close();
  }
}
