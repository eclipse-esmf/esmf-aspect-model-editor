/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {BaseMetaModelElement, DefaultEntity, DefaultEntityValue, OverWrittenProperty} from '@ame/meta-model';
import {NamespacesCacheService} from '@ame/cache';

export interface PropertiesDialogData {
  name: string;
  properties: OverWrittenProperty[];
  isExternalRef: boolean;
  metaModelElement?: BaseMetaModelElement;
}

@Component({
  templateUrl: './properties-modal.component.html',
  styleUrls: ['./properties-modal.component.scss'],
})
export class PropertiesModalComponent implements OnInit, AfterViewInit {
  public form: FormGroup;
  public keys: string[] = [];

  public headers = [];
  public standardHeaders = ['name', 'optional', 'payloadName'];
  public enumerationEntityHeaders = ['name', 'optional', 'notInPayload', 'payloadName'];
  public dataSource: MatTableDataSource<OverWrittenProperty>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public get extendedProperties(): OverWrittenProperty[] {
    return (this.data.metaModelElement as DefaultEntity)?.extendedElement.extendedProperties || [];
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PropertiesModalComponent>,
    private cacheService: NamespacesCacheService,
    @Inject(MAT_DIALOG_DATA) public data: PropertiesDialogData
  ) {}

  ngOnInit() {
    const allProperties: (OverWrittenProperty & {inherited?: boolean})[] = [
      ...((this.data.metaModelElement as DefaultEntity)?.extendedProperties || []).map(e => ({...e, inherited: true})),
      ...this.data.properties,
    ];

    this.dataSource = new MatTableDataSource(allProperties);

    const group = allProperties.reduce((acc, curr) => {
      this.keys.push(curr.property.aspectModelUrn);
      acc[curr.property.aspectModelUrn] = this.formBuilder.group({
        name: this.formBuilder.control({value: curr.property.name, disabled: curr.inherited}),
        optional: this.formBuilder.control({value: curr.keys.optional || false, disabled: curr.inherited}),
        notInPayload: this.formBuilder.control({value: curr.keys.notInPayload || false, disabled: curr.inherited}),
        payloadName: this.formBuilder.control({value: curr.keys.payloadName || '', disabled: curr.inherited}),
      });
      return acc;
    }, {});

    this.form = this.formBuilder.group(group);
    if (this.data.isExternalRef) {
      this.form.disable();
    }

    this.headers = this.standardHeaders;
    if (this.data.metaModelElement instanceof DefaultEntity) {
      const entityValues = this.cacheService.getCurrentCachedFile().getCachedEntityValues();
      entityValues.forEach((entityValue: DefaultEntityValue) => {
        if (entityValue.entity.aspectModelUrn === this.data.metaModelElement.aspectModelUrn) {
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
