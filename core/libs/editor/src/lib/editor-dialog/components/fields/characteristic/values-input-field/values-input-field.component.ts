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

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatChipInputEvent, MatChipGrid} from '@angular/material/chips';
import {debounceTime} from 'rxjs/operators';
import {ENTER} from '@angular/cdk/keycodes';
import {InputFieldComponent} from '../../input-field.component';
import {BaseMetaModelElement, DefaultEntity, DefaultEntityValue, DefaultEnumeration} from '@ame/meta-model';
import {DataTypeService} from '@ame/shared';
import {NamespacesCacheService} from '@ame/cache';

@Component({
  selector: 'ame-values-input-field',
  templateUrl: './values-input-field.component.html',
  styleUrls: ['./values-input-field.component.scss', '../../field.scss'],
})
export class ValuesInputFieldComponent extends InputFieldComponent<DefaultEnumeration> implements OnInit, OnDestroy {
  @ViewChild('chipList') chipList: MatChipGrid;

  readonly separatorKeysCodes: number[] = [ENTER];

  public visible = true;
  public removable = true;
  public addOnBlur = true;
  public hasComplexValues = false;
  public enumValues: Array<string | number | boolean | Partial<DefaultEntityValue>> = [];

  get enumEntityValues(): DefaultEntityValue[] {
    return this.enumValues as DefaultEntityValue[];
  }

  constructor(public namespacesCacheService: NamespacesCacheService, private dataTypeService: DataTypeService) {
    super();
  }

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.handleNextModelElement(this.metaModelElement);
      this.initForm();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('enumValues');
    this.parentForm.removeControl('chipList');
    this.parentForm.removeControl('deletedEntityValues');
    this.parentForm.removeControl('newEntityValues');
    this.enumValues = [];
  }

  getCurrentValue() {
    return this.previousData?.['chipList'] || this.metaModelElement.values || [];
  }

  onEnumChange() {
    this.parentForm.setControl('enumValues', new FormControl(this.enumValues));
  }

  add(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    if (value && value.trim().length > 0) {
      this.enumValues.push({name: value.trim()});
    }

    if (input) {
      input.value = '';
    }

    this.parentForm.get('chipList').setValue(this.enumValues);
  }

  paste(event: ClipboardEvent): void {
    event.preventDefault();
    event.clipboardData
      .getData('Text')
      .split(/;/)
      .forEach(value => {
        if (value.trim()) {
          this.enumValues.push({name: value.trim()});
        }
      });
  }

  remove(value: string | number | boolean | Partial<DefaultEntityValue>) {
    const index = this.enumValues.indexOf(value);

    if (index >= 0) {
      this.enumValues.splice(index, 1);
    }
  }

  enumValueChange(enumValues: DefaultEntityValue[]) {
    this.enumValues = enumValues;
    this.parentForm.get('chipList').setValue(this.enumValues);
  }

  initForm() {
    this.parentForm.setControl('values', new FormControl({value: '', disabled: this.metaModelElement?.isExternalReference()}));
    this.parentForm.setControl(
      'chipList',
      new FormControl({value: this.enumValues, disabled: this.metaModelElement?.isExternalReference()}, Validators.required)
    );

    if (this.parentForm.get('dataTypeEntity').value instanceof DefaultEntity) {
      this.hasComplexValues = true;
    }

    this.formSubscription.add(
      this.parentForm
        .get('dataType')
        .valueChanges.pipe(debounceTime(300))
        .subscribe(value => this.changeValuesByDataType(value))
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity')?.valueChanges.subscribe(entity => {
        this.hasComplexValues = !!entity;
      })
    );
  }

  private changeValuesByDataType(dataType: string) {
    const dataTypeKeys = Object.keys(this.dataTypeService.getDataTypes());

    if (dataTypeKeys.includes(dataType)) {
      this.hasComplexValues = false;
      return;
    }

    this.parentForm.get('values').setValue([]);
    this.enumValueChange([]);

    this.currentCachedFile.getCachedEntities().forEach(entity => {
      if (entity.name === dataType) {
        this.hasComplexValues = true;
      }
    });
  }

  private handleNextModelElement(modelElement: BaseMetaModelElement): void {
    this.enumValues = [];
    if (!(modelElement instanceof DefaultEnumeration)) {
      return;
    }

    const currentValues = this.getCurrentValue();
    this.hasComplexValues = modelElement.dataType instanceof DefaultEntity;
    if (!currentValues || (Array.isArray(currentValues) && currentValues.length === 0)) {
      return;
    }

    this.enumValues = currentValues.some(val => val instanceof DefaultEntityValue)
      ? currentValues
      : (currentValues.map(value => (typeof value === 'string' ? {name: value} : value)) as any[]);
  }
}
