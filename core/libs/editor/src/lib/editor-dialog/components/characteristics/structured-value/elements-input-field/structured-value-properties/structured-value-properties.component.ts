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

import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {StructuredValuePropertyFieldComponent} from '../structured-value-property-field/structured-value-property-field.component';

@Component({
  selector: 'ame-structured-value-properties',
  templateUrl: './structured-value-properties.component.html',
  styleUrls: ['./structured-value-properties.component.scss'],
  imports: [
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatColumnDef,
    StructuredValuePropertyFieldComponent,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatButton,
  ],
})
export class StructuredValuePropertiesComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StructuredValuePropertiesComponent>);

  public readonly displayedColumns = ['regex', 'property'];
  public dataSource: MatTableDataSource<any>;
  public form = new FormGroup({});

  ngOnInit() {
    this.dataSource = new MatTableDataSource(
      this.data.groups.map(group => ({data: group, regex: group.text, property: group.property || ''})),
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
