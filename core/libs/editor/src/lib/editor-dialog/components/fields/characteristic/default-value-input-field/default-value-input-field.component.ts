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

import {ElementIconComponent} from '@ame/shared';
import {Component, computed, inject, Injector, OnDestroy, OnInit, runInInjectionContext, Signal, viewChild} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, DefaultEntityInstance, DefaultState, DefaultValue, ScalarValue} from '@esmf/aspect-model-loader';
import {map} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-default-value-input-field',
  templateUrl: './default-value-input-field.component.html',
  imports: [
    MatFormFieldModule,
    MatLabel,
    ReactiveFormsModule,
    MatInput,
    MatAutocompleteModule,
    ElementIconComponent,
    MatIcon,
    MatIconButton,
  ],
})
export class DefaultValueInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  private injector = inject(Injector);
  private autoComplete = viewChild.required(MatAutocomplete);

  public displayControl = new FormControl<string>('');
  public displaySignalValue = toSignal(this.displayControl.valueChanges, {initialValue: ''});

  public createdValues: Signal<DefaultValue[]>;
  public createdEntityValues: Signal<DefaultEntityInstance[]>;
  public isComplexDatatype: Signal<boolean>;

  public filteredValues = computed(() => {
    return this.createdValues().filter(v => v instanceof DefaultValue && v.name.match(new RegExp(this.displaySignalValue(), 'i')));
  });

  public filteredEntityValues = computed(() => {
    return this.createdEntityValues().filter(
      v => v instanceof DefaultEntityInstance && v.name.match(new RegExp(this.displaySignalValue(), 'i')),
    );
  });

  private get samm() {
    return this.loadedFiles.currentLoadedFile.rdfModel.samm;
  }

  private get dataType() {
    return this.metaModelElement.dataType;
  }

  constructor() {
    super();
    this.fieldName = 'defaultValue';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    const defaultValue = this.metaModelElement.defaultValue;

    this.displayControl.setValue(defaultValue?.['name'] || defaultValue?.['value'] || '');
    this.displayControl.value && this.displayControl.disable();

    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: defaultValue || new ScalarValue({value: '', type: this.dataType || null}),
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        Validators.required,
      ),
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity').valueChanges.subscribe(dataType => {
        if (dataType instanceof DefaultEntity) {
          this.parentForm.get(this.fieldName).patchValue('');
        }
      }),
    );

    this.setValueSignals();
  }

  addValue(value: ScalarValue | DefaultValue | string, isLiteral = true) {
    if (isLiteral && typeof value === 'string') {
      value = new ScalarValue({value, type: this.metaModelElement.dataType || null});
    } else if (typeof value === 'string') {
      value = new DefaultValue({
        aspectModelUrn: this.metaModelElement.namespace + `#${value}`,
        value: '',
        name: value,
        metaModelVersion: this.samm.version,
      });
    }

    this.displayControl.disable();
    this.parentForm.get(this.fieldName).setValue(value);
    this.parentForm.get(this.fieldName).disable();
  }

  unlockDefaultValue() {
    this.displayControl.enable();
    this.displayControl.setValue('');
    this.parentForm.get(this.fieldName).enable();
    this.parentForm.get(this.fieldName).setValue(new ScalarValue({value: '', type: this.dataType || null}));

    this.autoComplete().options.forEach(option => option.deselect());
  }

  private setValueSignals() {
    const filterByType =
      <T>(type: {new (...x: any[]): T}) =>
      (values: T[]) =>
        values.filter(value => value instanceof type);

    runInInjectionContext(this.injector, () => {
      this.createdValues = toSignal(this.parentForm.get<string>('enumValues').valueChanges.pipe(map(filterByType(DefaultValue))), {
        initialValue: filterByType(DefaultValue)(this.parentForm.get<string>('enumValues').value || []),
      });

      this.createdEntityValues = toSignal(
        this.parentForm.get<string>('chipList').valueChanges.pipe(map(filterByType(DefaultEntityInstance))),
        {initialValue: filterByType(DefaultEntityInstance)(this.parentForm.get<string>('chipList').value || [])},
      );

      this.isComplexDatatype = toSignal(this.parentForm.get('dataTypeEntity').valueChanges, {
        initialValue: this.dataType instanceof DefaultEntity,
      });
    });
  }
}
