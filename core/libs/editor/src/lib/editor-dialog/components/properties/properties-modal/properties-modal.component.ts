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

import {CacheUtils, LoadedFilesService} from '@ame/cache';
import {NgClass} from '@angular/common';
import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatPaginator} from '@angular/material/paginator';
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
import {
  DefaultAspect,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  PropertyPayload,
  PropertyUrn,
} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';

export interface PropertiesDialogData {
  metaModelElement?: DefaultEntity | DefaultAspect;
  propertiesPayload: Record<PropertyUrn, PropertyPayload>;
  isExternalRef: boolean;
  isPredefined?: boolean;
}

export interface PropertyStatus {
  property: DefaultProperty;
  propertyPayload: PropertyPayload;
  inherited?: boolean;
  disabled?: boolean;
}

@Component({
  templateUrl: './properties-modal.component.html',
  styleUrls: ['./properties-modal.component.scss'],
  imports: [
    MatIconModule,
    MatIconButton,
    MatDialogTitle,
    MatDialogContent,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    NgClass,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatCheckbox,
    MatHeaderRow,
    MatRow,
    MatPaginator,
    MatDialogActions,
    MatButton,
    TranslatePipe,
    MatHeaderRowDef,
    MatRowDef,
  ],
})
export class PropertiesModalComponent implements OnInit, AfterViewInit {
  private loadedFilesService = inject(LoadedFilesService);
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PropertiesModalComponent>);

  public data = inject(MAT_DIALOG_DATA) as PropertiesDialogData;

  public form: FormGroup;
  public keys: string[] = [];

  public headers = [];
  public standardHeaders = ['name', 'optional', 'payloadName'];
  public enumerationEntityHeaders = ['name', 'optional', 'notInPayload', 'payloadName'];
  public dataSource: MatTableDataSource<PropertyStatus>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public get extendedProperties(): DefaultProperty[] {
    return (this.data.metaModelElement as DefaultEntity)?.extends_?.properties || [];
  }

  ngOnInit() {
    const entity = this.data.metaModelElement as DefaultEntity;
    const extendedProperties: PropertyStatus[] = this.extendedProperties
      .filter(
        property =>
          !(property.isAbstract && this.data.metaModelElement instanceof DefaultEntity && !this.data.metaModelElement.isAbstractEntity()),
      )
      .map(property => ({
        property,
        propertyPayload: this.data.propertiesPayload[property.aspectModelUrn] ?? entity.propertiesPayload?.[property.aspectModelUrn],
        inherited: true,
      }));

    const allProperties: PropertyStatus[] = [
      ...extendedProperties,
      ...entity.properties.map(property => ({
        property,
        disabled: !!(property instanceof DefaultProperty && property.extends_),
        propertyPayload: this.data.propertiesPayload[property.aspectModelUrn] ?? entity.propertiesPayload?.[property.aspectModelUrn],
      })),
    ];

    this.dataSource = new MatTableDataSource(allProperties);

    const group = allProperties.reduce((acc, status) => {
      this.keys.push(status.property.aspectModelUrn);
      acc[status.property.aspectModelUrn] = this.formBuilder.group({
        name: this.formBuilder.control({
          value: status.property.name,
          disabled: status.inherited || status.disabled,
        }),
        optional: this.formBuilder.control({
          value: status.propertyPayload?.optional || false,
          disabled: status.inherited || status.disabled,
        }),
        notInPayload: this.formBuilder.control({
          value: status.propertyPayload?.notInPayload || false,
          disabled: status.inherited || status.disabled,
        }),
        payloadName: this.formBuilder.control({
          value: status.propertyPayload?.payloadName || '',
          disabled: status.inherited || status.disabled,
        }),
      });
      return acc;
    }, {});

    this.form = this.formBuilder.group(group);
    if (this.data.isExternalRef || this.data.isPredefined) {
      this.form.disable();
    }

    this.headers = this.standardHeaders;
    if (this.data.metaModelElement instanceof DefaultEntity) {
      const entityValues = CacheUtils.getCachedElements(this.loadedFilesService.currentLoadedFile.cachedFile, DefaultEntityInstance);
      entityValues.forEach((entityValue: DefaultEntityInstance) => {
        if (entityValue.type.aspectModelUrn === this.data.metaModelElement.aspectModelUrn) {
          this.headers = this.enumerationEntityHeaders;
        }
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getControl(path: string | string[]): FormControl {
    return this.form.get(path) as FormControl;
  }

  closeModal() {
    this.dialogRef.close();
  }

  saveChanges() {
    this.dialogRef.close(this.form.value);
  }
}
