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

import {ENTER} from '@angular/cdk/keycodes';
import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatChipGrid, MatChipInput, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultQuantityKind, DefaultUnit} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-quantity-kinds-input-field',
  templateUrl: './quantity-kinds-input-field.component.html',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatChipGrid,
    FormField,
    MatChipRow,
    MatIconModule,
    MatAutocompleteTrigger,
    MatChipInput,
    MatInput,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    MatChipsModule,
    MatIconModule,
    TranslocoDirective,
  ],
})
export class QuantityKindsInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  private supportedQuantityKinds: string[] = [];
  private readonly inputModel = signal('');
  private readonly quantityKindsModel = signal<string[]>([]);
  private unregisterField = () => undefined;

  readonly inputField = form(this.inputModel, path => disabled(path, {when: () => !this.editable()}));
  readonly quantityKindsField = form(this.quantityKindsModel, path => disabled(path, {when: () => !this.editable()}));
  readonly filteredQuantityKinds = computed(() => {
    const value = this.inputModel();
    return value ? this.supportedQuantityKinds.filter(quantityKind => quantityKind.startsWith(value)) : this.supportedQuantityKinds;
  });

  readonly separatorKeysCodes = signal([ENTER]);
  public editable = signal(true);
  public quantityKindValues = this.quantityKindsModel.asReadonly();

  ngOnInit(): void {
    this.supportedQuantityKinds = Object.keys(sammUDefinition.quantityKinds);
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setInputControl();
      });
  }

  setInputControl() {
    this.editable.set(!this.metaModelDialogService.isReadOnly());
    this.quantityKindsModel.set(
      this.metaModelElement?.quantityKinds?.map(value => (value instanceof DefaultQuantityKind ? value.name : String(value))) || [],
    );
    this.inputModel.set('');
    this.unregisterField = this.signalForm().register('quantityKindsChipList', this.quantityKindsField);
  }

  ngOnDestroy(): void {
    this.unregisterField();
    super.ngOnDestroy();
  }

  onSelectionChange(newValue: string) {
    this.inputModel.set('');
    this.inputField().markAsTouched();
    if (!this.quantityKindsModel().includes(newValue)) {
      this.quantityKindsModel.update(values => [...values, newValue]);
    }
  }

  remove(value: string) {
    const index = this.quantityKindValues().indexOf(value);

    if (index >= 0) {
      this.quantityKindsModel.update(values => values.filter(quantityKind => quantityKind !== value));
    }
  }
}
