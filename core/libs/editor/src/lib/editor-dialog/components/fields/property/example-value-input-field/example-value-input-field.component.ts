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

import {CacheUtils} from '@ame/cache';
import {ElementIconComponent, simpleDataTypes} from '@ame/shared';
import {Component, computed, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {DefaultProperty, DefaultScalar, DefaultValue, ScalarValue} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-example-value-input-field',
  templateUrl: './example-value-input-field.component.html',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatSelect,
    FormField,
    MatOption,
    MatTooltip,
    MatInput,
    MatAutocompleteModule,
    MatIcon,
    MatIconButton,
    ElementIconComponent,
    TranslocoDirective,
  ],
})
export class ExampleValueInputFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit, OnDestroy {
  private samm = this.loadedFiles.currentLoadedFile.rdfModel.samm;
  private values: WritableSignal<DefaultValue[]> = signal([]);
  private readonly displayModel = signal('');
  private readonly exampleValueModel = signal<DefaultValue | ScalarValue | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  private unregisterField = () => undefined;
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

  public hasComplexDataType = signal(false);
  readonly displayField = form(this.displayModel, path => disabled(path, {when: () => this.locked() || this.blocked()}));
  readonly displayValue = this.displayModel.asReadonly();

  public get isDataTypeBoolean(): boolean {
    return this.dataType?.getUrn() === simpleDataTypes.boolean.isDefinedBy;
  }

  public filteredValues = computed(() => {
    return this.values().filter(v => v.name.match(new RegExp(this.displayModel(), 'i')));
  });

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());

    this.values.set(CacheUtils.getCachedElements(this.loadedFiles.currentLoadedFile.cachedFile, DefaultValue));
  }

  initForm() {
    this.hasComplexDataType.set(this.dataType?.isComplexType());
    const value = this.metaModelElement?.exampleValue;
    this.blocked.set(
      this.loadedFiles.isElementExtern(this.metaModelElement) ||
        this.hasComplexDataType() ||
        this.metaModelElement.isPredefined ||
        this.isExtending(),
    );
    const initialVal = value || new ScalarValue({value: '', type: this.dataType || null});
    this.exampleValueModel.set(initialVal);
    this.displayModel.set(this.stringifyValue(value));
    this.locked.set(!!this.displayModel());
    this.unregisterField = this.signalForm().register('exampleValueDisplay', this.displayField);
    this.signalForm().set('exampleValue', initialVal);
  }

  selectExampleValue(value: DefaultValue | ScalarValue | string, isLiteral = true) {
    if (isLiteral && typeof value === 'string') {
      value = new ScalarValue({value, type: this.dataType || null});
    } else if (typeof value === 'string') {
      value = new DefaultValue({
        aspectModelUrn: this.metaModelElement.namespace + `#${value}`,
        value: 'Value',
        name: value,
        metaModelVersion: this.samm.version,
      });
    }

    this.exampleValueModel.set(value);
    this.signalForm().set('exampleValue', value);
    this.displayModel.set(this.stringifyValue(value));
    if (!this.isDataTypeBoolean) {
      this.locked.set(true);
    }
  }

  unlockExampleValue(autocomplete: MatAutocomplete) {
    this.locked.set(false);
    this.displayModel.set('');
    const emptyVal = new ScalarValue({value: '', type: this.dataType || null});
    this.exampleValueModel.set(emptyVal);
    this.signalForm().set('exampleValue', emptyVal);
    this.displayField().markAsTouched();

    autocomplete.options.forEach(option => option.deselect());
  }

  ngOnDestroy(): void {
    this.unregisterField();
    this.signalForm().remove('exampleValue');
    super.ngOnDestroy();
  }

  private stringifyValue(value: DefaultValue | ScalarValue): string {
    return value instanceof DefaultValue ? value.name : `${value?.value || ''}`;
  }

  private isExtending() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }
}
