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

import {CacheUtils, LoadedFilesService} from '@ame/cache';
import {NgClass} from '@angular/common';
import {AfterViewInit, Component, inject, OnInit, signal, viewChild} from '@angular/core';
import {form} from '@angular/forms/signals';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
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
import {TranslocoDirective} from '@jsverse/transloco';

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

export interface PropertyItemForm {
  name: string;
  optional: boolean;
  notInPayload: boolean;
  payloadName: string;
}

export type PropertiesFormModel = Record<string, PropertyItemForm>;

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
    MatFormFieldModule,
    MatLabel,
    MatInput,
    MatCheckbox,
    MatHeaderRow,
    MatRow,
    MatPaginator,
    MatDialogActions,
    MatButton,
    TranslocoDirective,
    MatHeaderRowDef,
    MatRowDef,
  ],
})
export class PropertiesModalComponent implements OnInit, AfterViewInit {
  private loadedFilesService = inject(LoadedFilesService);
  private dialogRef = inject(MatDialogRef<PropertiesModalComponent>);

  public data = inject(MAT_DIALOG_DATA) as PropertiesDialogData;

  public propertiesModel = signal<PropertiesFormModel>({});
  public propertiesForm = form(this.propertiesModel);

  public keys: string[] = [];
  public isReadonly = signal(false);

  public standardHeaders = ['name', 'optional', 'payloadName'];
  public enumerationEntityHeaders = ['name', 'optional', 'notInPayload', 'payloadName'];

  public headers = signal(['name', 'optional', 'payloadName']);
  public dataSource: MatTableDataSource<PropertyStatus>;

  readonly paginator = viewChild(MatPaginator);

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

    const initialModel: PropertiesFormModel = {};
    for (const status of allProperties) {
      this.keys.push(status.property.aspectModelUrn);
      initialModel[status.property.aspectModelUrn] = {
        name: status.property.name,
        optional: status.propertyPayload?.optional || false,
        notInPayload: status.propertyPayload?.notInPayload || false,
        payloadName: status.propertyPayload?.payloadName || '',
      };
    }
    this.propertiesModel.set(initialModel);

    if (this.data.isExternalRef || this.data.isPredefined) {
      this.isReadonly.set(true);
    }

    this.headers.set(this.standardHeaders);
    if (this.data.metaModelElement instanceof DefaultEntity) {
      const entityValues = CacheUtils.getCachedElements(this.loadedFilesService.currentLoadedFile.cachedFile, DefaultEntityInstance);
      entityValues.forEach((entityValue: DefaultEntityInstance) => {
        if (entityValue.type.aspectModelUrn === this.data.metaModelElement.aspectModelUrn) {
          this.headers.set(this.enumerationEntityHeaders);
        }
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator();
  }

  closeModal() {
    this.dialogRef.close();
  }

  updateOptional(urn: string, checked?: boolean) {
    this.propertiesModel.update(model => {
      const current = model[urn]?.optional || false;
      const next = checked !== undefined ? checked : !current;
      return {
        ...model,
        [urn]: {...model[urn], optional: next},
      };
    });
  }

  updateNotInPayload(urn: string, checked?: boolean) {
    this.propertiesModel.update(model => {
      const current = model[urn]?.notInPayload || false;
      const next = checked !== undefined ? checked : !current;
      return {
        ...model,
        [urn]: {...model[urn], notInPayload: next},
      };
    });
  }

  updatePayloadName(urn: string, value: string) {
    this.propertiesModel.update(model => ({
      ...model,
      [urn]: {...model[urn], payloadName: value},
    }));
  }

  saveChanges() {
    this.dialogRef.close(this.propertiesModel());
  }
}
