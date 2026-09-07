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

import {Component, inject, OnInit, signal} from '@angular/core';
import {applyEach, form, required} from '@angular/forms/signals';
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
import {DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {StructuredValuePropertyFieldComponent} from '../structured-value-property-field/structured-value-property-field.component';

export interface StructuredValuePropertyRow {
  key: string;
  regex: string;
  propertyName: string;
}

export interface StructuredValueTableRow {
  key: string;
  regex: string;
  property: DefaultProperty | null;
}

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
    TranslocoDirective,
  ],
})
export class StructuredValuePropertiesComponent implements OnInit {
  public data: {groups: Array<{start: number; end: number; text: string; property?: DefaultProperty}>; parentProperties?: NamedElement[]} =
    inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StructuredValuePropertiesComponent>);

  public readonly displayedColumns = ['regex', 'property'];
  public dataSource: MatTableDataSource<StructuredValueTableRow>;
  public propertiesMap = new Map<string, DefaultProperty>();
  public propertiesModel = signal<StructuredValuePropertyRow[]>([]);
  public propertiesForm = form(this.propertiesModel, path => {
    applyEach(path, row => required(row.propertyName));
  });

  ngOnInit() {
    const rows: StructuredValuePropertyRow[] = [];
    const tableData: StructuredValueTableRow[] = this.data.groups.map(group => {
      const key = this.getKey(group);
      if (group.property) {
        this.propertiesMap.set(key, group.property);
      }
      rows.push({
        key,
        regex: group.text,
        propertyName: group.property?.name || '',
      });
      return {
        key,
        regex: group.text,
        property: group.property || null,
      };
    });
    this.propertiesModel.set(rows);
    this.dataSource = new MatTableDataSource(tableData);
  }

  getKey(group: {start: number; end: number; text: string}) {
    return `[${group.start}-${group.end}] -> ` + group.text;
  }

  onPropertyChange(index: number, key: string, property: DefaultProperty | null) {
    if (property) {
      this.propertiesMap.set(key, property);
    } else {
      this.propertiesMap.delete(key);
    }
    this.propertiesModel.update(rows => {
      const updated = [...rows];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          propertyName: property?.name || '',
        };
      }
      return updated;
    });
  }

  closeModal(save?: boolean) {
    if (!save) {
      this.dialogRef.close(null);
      return;
    }

    if (this.propertiesForm().valid()) {
      const result = Object.fromEntries(this.propertiesModel().map(row => [row.key, this.propertiesMap.get(row.key) || null]));
      this.dialogRef.close(result);
    }
  }
}
