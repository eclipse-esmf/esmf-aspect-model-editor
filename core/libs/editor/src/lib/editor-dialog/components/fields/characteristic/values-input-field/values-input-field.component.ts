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
import {DataTypeService, ElementIconComponent} from '@ame/shared';
import {ENTER} from '@angular/cdk/keycodes';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  runInInjectionContext,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipEditedEvent, MatChipGrid, MatChipInput, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultValue,
  NamedElement,
  ScalarValue,
  Value,
} from '@esmf/aspect-model-loader';
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
    MatAutocompleteModule,
    ElementIconComponent,
  ],
})
export class ValuesInputFieldComponent extends InputFieldComponent<DefaultEnumeration> implements OnInit, OnDestroy {
  private autoComplete = viewChild(MatAutocomplete);
  private valuesInput = viewChild<ElementRef<HTMLInputElement>>('valuesInput');

  private injector = inject(Injector);
  private dataTypeService = inject(DataTypeService);
  private values = signal<DefaultValue[]>([]);
  private valueControlSignal: Signal<string>;

  readonly separatorKeysCodes: number[] = [ENTER];

  public visible = true;
  public editable = true;
  public removable = true;
  public hasComplexValues = signal(false);
  public initialValues: Record<string, boolean> = {};

  public enumValues: WritableSignal<Array<Value | DefaultValue | DefaultEntityInstance>> = signal([]);
  public enumEntityValues = computed(() => this.enumValues().filter(v => v instanceof DefaultEntityInstance));
  public valuesElements = computed(() => this.enumValues().filter(v => v instanceof DefaultValue));

  private valuesElementsMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const value of this.valuesElements()) {
      map[value.name] = true;
    }
    return map;
  });

  public filteredValues = computed(() => {
    const valuesElementsMap = this.valuesElementsMap();
    return this.values().filter(v => !valuesElementsMap[v.name] && v.name.match(new RegExp(this.valueControlSignal(), 'i')));
  });

  get samm() {
    return this.loadedFiles.currentLoadedFile.rdfModel.samm;
  }

  constructor() {
    super();

    effect(() => {
      this.onEnumChange();
    });
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.handleNextModelElement(this.metaModelElement);
        this.initForm();

        runInInjectionContext(this.injector, () => {
          this.valueControlSignal = toSignal(this.parentForm.get('values').valueChanges, {initialValue: ''});
        });
      });

    this.values.set(CacheUtils.getCachedElements(this.loadedFiles.currentLoadedFile.cachedFile, DefaultValue));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('enumValues');
    this.parentForm.removeControl('chipList');
    this.parentForm.removeControl('deletedEntityValues');
    this.parentForm.removeControl('newEntityValues');
    this.enumValues.set([]);
  }

  getCurrentValue() {
    return this.previousData?.['chipList'] || this.metaModelElement.values || [];
  }

  onEnumChange() {
    this.parentForm.get('enumValues')?.setValue(this.enumValues());
  }

  addValue(value: ScalarValue | DefaultValue | string, isLiteral = true) {
    this.getControl('values').setValue('');
    this.valuesInput().nativeElement.value = '';

    if (isLiteral && typeof value === 'string') {
      value = new ScalarValue({value, type: this.metaModelElement.dataType || null});
    } else if (typeof value === 'string') {
      value = new DefaultValue({
        aspectModelUrn: this.metaModelElement.namespace + `#${value}`,
        value: 'Value',
        name: value,
        metaModelVersion: this.samm.version,
      });
    }

    this.enumValues.update(values => [...values, value]);
    this.parentForm.get('chipList').setValue(this.enumValues());
    this.onEnumChange();

    this.autoComplete().options.forEach(option => option.deselect());
  }

  editValue(value: Value | DefaultValue, event: MatChipEditedEvent) {
    if (value instanceof DefaultValue) {
      value.name = event.value;
    } else {
      value.value = event.value;
    }
  }

  paste(event: ClipboardEvent): void {
    event.preventDefault();
    event.clipboardData
      .getData('Text')
      .split(/;/)
      .forEach(value => {
        if (value.trim()) {
          this.enumValues.update(values => [
            ...values,
            new ScalarValue({value: value.trim(), type: this.metaModelElement.dataType || null}),
          ]);
        }
      });
  }

  remove(value: Value | DefaultValue) {
    const index = this.enumValues().indexOf(value);

    if (index >= 0) {
      this.enumValues.update(values => values.filter((_, i) => i !== index));
    }
  }

  enumValueChange(enumValues: DefaultEntityInstance[]) {
    this.enumValues.set(enumValues);
    this.parentForm.get('chipList').setValue(this.enumEntityValues());
  }

  initForm() {
    this.parentForm.setControl('values', new FormControl({value: '', disabled: this.loadedFiles.isElementExtern(this.metaModelElement)}));
    this.parentForm.setControl(
      'chipList',
      new FormControl({value: this.enumValues(), disabled: this.loadedFiles.isElementExtern(this.metaModelElement)}, Validators.required),
    );
    this.enumValues.set(this.metaModelElement.values || []);
    this.parentForm.setControl('enumValues', new FormControl(this.enumValues()));

    if (this.parentForm.get('dataTypeEntity').value instanceof DefaultEntity) {
      this.enumValueChange((this.metaModelElement.values as DefaultEntityInstance[]) || []);
      this.hasComplexValues.set(true);
    }

    this.formSubscription.add(
      this.parentForm
        .get('dataType')
        .valueChanges.pipe(debounceTime(300))
        .subscribe(value => this.changeValuesByDataType(value)),
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity')?.valueChanges.subscribe(entity => {
        this.hasComplexValues.set(!!entity);
      }),
    );

    for (const value of this.enumValues()) {
      if (!(value instanceof DefaultValue)) continue;

      this.initialValues[value.aspectModelUrn] = true;
    }
  }

  private changeValuesByDataType(dataType: string) {
    const dataTypeKeys = Object.keys(this.dataTypeService.getDataTypes());

    if (dataTypeKeys.includes(dataType)) {
      this.hasComplexValues.set(false);
      return;
    }

    this.parentForm.get('values').setValue([]);
    this.enumValueChange([]);

    CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntity)
      .filter(e => !e.isAbstractEntity())
      .forEach(entity => {
        if (entity.name === dataType) {
          this.hasComplexValues.set(true);
        }
      });
  }

  private handleNextModelElement(modelElement: NamedElement): void {
    this.enumValues.set([]);
    if (!(modelElement instanceof DefaultEnumeration)) {
      return;
    }

    const currentValues = this.getCurrentValue();
    this.hasComplexValues.set(modelElement.dataType instanceof DefaultEntity);
    if (!currentValues || (Array.isArray(currentValues) && currentValues.length === 0)) {
      return;
    }

    this.enumValues.set(currentValues);
  }
}
