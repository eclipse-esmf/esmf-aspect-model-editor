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

import {CacheUtils} from '@ame/cache';
import {DataTypeService} from '@ame/shared';
import {ENTER} from '@angular/cdk/keycodes';
import {Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {debounceTime} from 'rxjs/operators';
import {EntityInstanceViewComponent} from '../../../entity-instance';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-values-input-field',
  templateUrl: './values-input-field.component.html',
  styleUrls: ['./values-input-field.component.scss', '../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatChipGrid,
    ReactiveFormsModule,
    MatChipRow,
    MatIconModule,
    MatChipInput,
    MatInput,
    EntityInstanceViewComponent,
    MatError,
    MatChipsModule,
    MatIconModule,
  ],
})
export class ValuesInputFieldComponent extends InputFieldComponent<DefaultEnumeration> implements OnInit, OnDestroy {
  @ViewChild('chipList') chipList: MatChipGrid;

  private dataTypeService = inject(DataTypeService);

  readonly separatorKeysCodes: number[] = [ENTER];

  public visible = true;
  public removable = true;
  public addOnBlur = true;
  public hasComplexValues = false;
  public enumValues: Array<string | number | boolean | Partial<DefaultEntityInstance>> = [];

  get enumEntityValues(): DefaultEntityInstance[] {
    return this.enumValues as DefaultEntityInstance[];
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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

  remove(value: string | number | boolean | Partial<DefaultEntityInstance>) {
    const index = this.enumValues.indexOf(value);

    if (index >= 0) {
      this.enumValues.splice(index, 1);
    }
  }

  enumValueChange(enumValues: DefaultEntityInstance[]) {
    this.enumValues = enumValues;
    this.parentForm.get('chipList').setValue(this.enumValues);
  }

  initForm() {
    this.parentForm.setControl('values', new FormControl({value: '', disabled: this.loadedFiles.isElementExtern(this.metaModelElement)}));
    this.parentForm.setControl(
      'chipList',
      new FormControl({value: this.enumValues, disabled: this.loadedFiles.isElementExtern(this.metaModelElement)}, Validators.required),
    );

    if (this.parentForm.get('dataTypeEntity').value instanceof DefaultEntity) {
      this.hasComplexValues = true;
    }

    this.formSubscription.add(
      this.parentForm
        .get('dataType')
        .valueChanges.pipe(debounceTime(300))
        .subscribe(value => this.changeValuesByDataType(value)),
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity')?.valueChanges.subscribe(entity => {
        this.hasComplexValues = !!entity;
      }),
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

    CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntity)
      .filter(e => !e.isAbstractEntity())
      .forEach(entity => {
        if (entity.name === dataType) {
          this.hasComplexValues = true;
        }
      });
  }

  private handleNextModelElement(modelElement: NamedElement): void {
    this.enumValues = [];
    if (!(modelElement instanceof DefaultEnumeration)) {
      return;
    }

    const currentValues = this.getCurrentValue();
    this.hasComplexValues = modelElement.dataType instanceof DefaultEntity;
    if (!currentValues || (Array.isArray(currentValues) && currentValues.length === 0)) {
      return;
    }

    this.enumValues = currentValues.some(val => val instanceof DefaultEntityInstance)
      ? currentValues
      : (currentValues.map(value => (typeof value === 'string' ? {name: value} : value?.value || value)) as any[]);
  }
}
