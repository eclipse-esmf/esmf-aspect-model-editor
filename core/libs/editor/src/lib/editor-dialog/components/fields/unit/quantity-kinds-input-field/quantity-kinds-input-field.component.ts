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

import {ENTER} from '@angular/cdk/keycodes';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultQuantityKind, DefaultUnit} from '@esmf/aspect-model-loader';
import {Observable, map} from 'rxjs';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-quantity-kinds-input-field',
  templateUrl: './quantity-kinds-input-field.component.html',
})
export class QuantityKindsInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  @ViewChild('input') inputValue: any;
  readonly separatorKeysCodes: number[] = [ENTER];

  public filteredQuantityKinds$: Observable<any[]>;
  public supportedQuantityKinds = [];
  public inputControl: FormControl;
  public selectable = true;
  public editable = true;
  public quantityKindValues: Array<string>;

  get chipListControl(): FormControl {
    return this.parentForm.get('quantityKindsChipList') as FormControl;
  }

  constructor(public metaModelDialogService: EditorModelService) {
    super();
  }

  ngOnInit(): void {
    this.supportedQuantityKinds = Object.keys(sammUDefinition.quantityKinds);
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.quantityKindValues = [];
      this.setInputControl();
    });
  }

  setInputControl() {
    this.editable = !this.metaModelDialogService.isReadOnly();
    this.quantityKindValues = [
      ...((this.metaModelElement?.quantityKinds?.map(value => (value instanceof DefaultQuantityKind ? value.name : value)) as any) || []),
    ];

    this.inputControl = new FormControl({
      value: '',
      disabled: this.metaModelDialogService.isReadOnly(),
    });

    this.parentForm.setControl(
      'quantityKindsChipList',
      new FormControl({
        value: this.quantityKindValues,
        disabled: this.metaModelDialogService.isReadOnly(),
      }),
    );

    this.filteredQuantityKinds$ = this.initFilteredQuantityKinds(this.inputControl);
  }

  initFilteredQuantityKinds(control: FormControl): Observable<Array<string>> {
    return control?.valueChanges.pipe(
      map((value: string) => {
        return value ? this.supportedQuantityKinds?.filter(qk => qk.startsWith(value)) : this.supportedQuantityKinds;
      }),
    );
  }

  onSelectionChange(newValue: string) {
    this.inputValue.nativeElement.value = '';
    this.inputControl.reset();
    this.inputControl.markAllAsTouched();

    this.quantityKindValues.push(newValue);
    this.parentForm.get('quantityKindsChipList').setValue(this.quantityKindValues);
  }

  remove(value: string) {
    const index = this.quantityKindValues.indexOf(value);

    if (index >= 0) {
      this.quantityKindValues.splice(index, 1);
      this.parentForm.get('quantityKindsChipList').setValue(this.quantityKindValues);
    }
  }
}
