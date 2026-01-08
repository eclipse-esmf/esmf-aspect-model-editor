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
import {ElementIconComponent, simpleDataTypes} from '@ame/shared';
import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {DefaultProperty, DefaultScalar, DefaultValue, ScalarValue} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-example-value-input-field',
  templateUrl: './example-value-input-field.component.html',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatTooltip,
    MatInput,
    MatAutocompleteModule,
    MatIcon,
    MatIconButton,
    ElementIconComponent,
  ],
})
export class ExampleValueInputFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit {
  private samm = this.loadedFiles.currentLoadedFile.rdfModel.samm;
  private values: WritableSignal<DefaultValue[]> = signal([]);
  private get dataType() {
    return this.metaModelElement?.characteristic?.dataType || null;
  }

  protected readonly TRUE = new ScalarValue({
    value: 'true',
    type: new DefaultScalar({urn: simpleDataTypes.boolean.isDefinedBy, metaModelVersion: this.samm.version}),
  });
  protected readonly FALSE = new ScalarValue({
    value: 'false',
    type: new DefaultScalar({urn: simpleDataTypes.boolean.isDefinedBy, metaModelVersion: this.samm.version}),
  });

  public hasComplexDataType = false;
  public displayControl = new FormControl<string>('');
  public displaySignalValue = toSignal(this.displayControl.valueChanges, {initialValue: ''});

  public get isDataTypeBoolean(): boolean {
    return this.dataType?.getUrn() === simpleDataTypes.boolean.isDefinedBy;
  }

  public filteredValues = computed(() => {
    return this.values().filter(v => v.name.match(new RegExp(this.displaySignalValue(), 'i')));
  });

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());

    this.values.set(CacheUtils.getCachedElements(this.loadedFiles.currentLoadedFile.cachedFile, DefaultValue));
  }

  initForm() {
    this.hasComplexDataType = this.dataType?.isComplexType();
    const value = this.metaModelElement?.exampleValue;
    this.parentForm.setControl(
      'exampleValue',
      new FormControl<DefaultValue | ScalarValue>({
        value: value || new ScalarValue({value: '', type: this.dataType || null}),
        disabled:
          this.loadedFiles.isElementExtern(this.metaModelElement) ||
          this.hasComplexDataType ||
          this.metaModelElement.isPredefined ||
          this.isExtending(),
      }),
    );

    this.displayControl.setValue(this.stringifyValue(value));
    this.displayControl.value && this.displayControl.disable();
  }

  selectExampleValue(value: DefaultValue | ScalarValue | string, isLiteral = true) {
    if (isLiteral && typeof value === 'string') {
      value = new ScalarValue({value, type: this.dataType || null});
    } else if (typeof value === 'string') {
      value = new DefaultValue({
        aspectModelUrn: this.metaModelElement.namespace + `#${value}`,
        value: 'change me',
        name: value,
        metaModelVersion: this.samm.version,
      });
    }

    this.parentForm.get('exampleValue').setValue(value);

    this.displayControl.setValue(typeof value === 'string' ? value : this.stringifyValue(value));
    if (!this.isDataTypeBoolean) {
      this.displayControl.disable();
    }
  }

  unlockExampleValue(autocomplete: MatAutocomplete) {
    this.displayControl.enable();
    this.displayControl.setValue('');
    this.parentForm.get('exampleValue').enable();
    this.parentForm.get('exampleValue').setValue(new ScalarValue({value: '', type: this.dataType || null}));

    autocomplete.options.forEach(option => option.deselect());
  }

  private stringifyValue(value: DefaultValue | ScalarValue): string {
    return value instanceof DefaultValue ? value.name : `${value?.value || ''}`;
  }

  private isExtending() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }
}
