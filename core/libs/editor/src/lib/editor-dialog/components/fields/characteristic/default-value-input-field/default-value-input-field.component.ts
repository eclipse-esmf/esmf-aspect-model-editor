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

import {ElementIconComponent} from '@ame/shared';
import {Component, computed, effect, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, DefaultEntityInstance, DefaultState, DefaultValue, ScalarValue, Value} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-default-value-input-field',
  templateUrl: './default-value-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput, MatAutocompleteModule, ElementIconComponent, MatIcon, MatIconButton],
})
export class DefaultValueInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  private autoComplete = viewChild.required(MatAutocomplete);
  private readonly displayModel = signal('');
  private readonly defaultValueModel = signal<Value | DefaultValue | DefaultEntityInstance | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  private unregisterField = () => undefined;

  readonly displayField = form(this.displayModel, path => disabled(path, {when: () => this.locked() || this.blocked()}));
  readonly defaultValueField = form(this.defaultValueModel, path => {
    required(path);
    disabled(path, {when: () => this.locked() || this.blocked()});
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly createdValues = computed(() =>
    ((this.signalForm()?.value().enumValues as unknown[]) || []).filter(value => value instanceof DefaultValue),
  );
  readonly createdEntityValues = computed(() =>
    ((this.signalForm()?.value().chipList as unknown[]) || []).filter(value => value instanceof DefaultEntityInstance),
  );
  readonly isComplexDatatype = computed(() => this.signalForm()?.value().dataTypeEntity instanceof DefaultEntity);

  public filteredValues = computed(() => {
    const value = this.displayModel().toLowerCase();
    return this.createdValues().filter(v => v.name.toLowerCase().includes(value));
  });

  public filteredEntityValues = computed(() => {
    const value = this.displayModel().toLowerCase();
    return this.createdEntityValues().filter(v => v.name.toLowerCase().includes(value));
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
    effect(() => {
      if (this.metaModelElement && this.isComplexDatatype()) {
        this.defaultValueModel.set(null);
        this.displayModel.set('');
        this.locked.set(false);
      }
    });
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  initForm() {
    const defaultValue = this.metaModelElement.defaultValue;

    const displayValue = defaultValue?.['name'] || defaultValue?.['value'] || '';
    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.locked.set(!!displayValue);
    this.displayModel.set(displayValue);
    this.defaultValueModel.set(defaultValue || new ScalarValue({value: '', type: this.dataType || null}));
    this.unregisterField = this.signalForm().register(this.fieldName, this.defaultValueField);
  }

  addValue(value: ScalarValue | DefaultValue | DefaultEntityInstance | string, isLiteral = true) {
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

    this.displayModel.set(value instanceof DefaultValue || value instanceof DefaultEntityInstance ? value.name : String(value.value));
    this.defaultValueModel.set(value);
    this.locked.set(true);
  }

  unlockDefaultValue() {
    this.locked.set(false);
    this.displayModel.set('');
    this.defaultValueModel.set(new ScalarValue({value: '', type: this.dataType || null}));

    this.autoComplete().options.forEach(option => option.deselect());
  }
}
