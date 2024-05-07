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

import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'ame-structured-value-properties',
  templateUrl: './structured-value-properties.component.html',
  styleUrls: ['./structured-value-properties.component.scss'],
})
export class StructuredValuePropertiesComponent implements OnInit {
  public readonly displayedColumns = ['regex', 'property'];
  public dataSource: MatTableDataSource<any>;
  public form = new FormGroup({});

  constructor(@Inject(MAT_DIALOG_DATA) private data, private dialogRef: MatDialogRef<StructuredValuePropertiesComponent>) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(
      this.data.groups.map(group => ({data: group, regex: group.text, property: group.property || ''}))
    );
    for (const group of this.data.groups || []) {
      this.form.addControl(this.getKey(group), new FormControl(group.property?.property, [Validators.required]));
    }
  }

  getControl(name: string): FormControl {
    return this.form.controls[name] as FormControl;
  }

  getKey(group) {
    return `[${group.start}-${group.end}] -> ` + group.text;
  }

  closeModal(save?: boolean) {
    if (this.form.valid || !save) {
      this.dialogRef.close(save ? this.form.value : null);
    }
  }
}
