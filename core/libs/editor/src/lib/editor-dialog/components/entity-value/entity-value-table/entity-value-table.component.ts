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

import {ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  BaseMetaModelElement,
  Characteristic,
  DefaultAbstractProperty,
  DefaultCollection,
  DefaultEntityValue,
  DefaultProperty,
  EntityValueProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {DataType, EditorDialogValidators, EntityValueUtil, FormFieldHelper} from '@ame/editor';
import {InputFieldComponent} from '../../fields';
import {map, Observable, of, startWith, Subscription} from 'rxjs';
import * as locale from 'locale-codes';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'ame-entity-value-table',
  templateUrl: './entity-value-table.component.html',
  styleUrls: ['./entity-value-table.component.scss'],
})
export class EntityValueTableComponent extends InputFieldComponent<DefaultEntityValue> implements OnInit, OnChanges, OnDestroy {
  @ViewChildren(MatAutocompleteTrigger) autocompleteTriggers: QueryList<MatAutocompleteTrigger>;

  protected readonly EntityValueUtil = EntityValueUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  propertiesForm: FormGroup;
  sources: EntityValueProperty[] = [];
  subscriptions = new Subscription();

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  get entityValuePropertiesForm(): FormGroup {
    return this.parentForm.get('entityValueProperties') as FormGroup;
  }

  getFormArray(value: string): FormArray {
    return this.entityValuePropertiesForm.get(value) as FormArray;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.getMetaModelData().subscribe((metaModelElement: BaseMetaModelElement) => {
        this.propertiesForm = new FormGroup({});
        this.metaModelElement = metaModelElement as DefaultEntityValue;
        this.parentForm.setControl('entityValueProperties', this.propertiesForm);

        const {properties, entity} = this.metaModelElement;

        if (!properties.length && entity.allProperties.length) {
          for (const property of entity.allProperties) {
            this.metaModelElement.addProperty(property);
          }
        }

        this.metaModelElement.properties.forEach(entityValueProperty => {
          const property = entityValueProperty.key.property;
          const validators = this.getValidators(entityValueProperty);
          const {value, language} = entityValueProperty;

          this.initializeFormControl(property, validators, value, language);
        });

        this.sources = this.metaModelElement?.entity?.allProperties.map(prop => this.createEntityValueProp(prop));
      }),
    );
  }

  private createEntityValueProp(prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): EntityValueProperty {
    const property = prop.property as DefaultProperty;
    const propertyControl = this.propertiesForm.get(property.name);

    if (!propertyControl) {
      const propertiesFormArray = EntityValueUtil.getDisplayControl(this.propertiesForm, property.name);
      const valueControl = this.createFormControl(prop);
      this.subscribeToEntityValueChanges(valueControl, prop.property as DefaultProperty);

      const group = new UntypedFormGroup({value: valueControl});
      propertiesFormArray.push(group);

      if (EntityValueUtil.isDefaultPropertyWithLangString(prop)) {
        const languageControl = this.createFormControl(prop);
        this.subscribeToLangValueChanges(languageControl, property);
        group.addControl('language', languageControl);
      }
    }

    return {
      key: prop as OverWrittenProperty,
      value: '',
      language: EntityValueUtil.isDefaultPropertyWithLangString(prop) ? '' : undefined,
      optional: prop.keys.optional,
    };
  }

  private createFormControl(prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): FormControl {
    return new FormControl('', prop.keys.optional ? null : EditorDialogValidators.requiredObject);
  }

  private getValidators(entityValueProperty: EntityValueProperty): (control: AbstractControl) => ValidationErrors | null {
    return entityValueProperty.key.keys.optional ? null : Validators.required;
  }

  private initializeFormControl(
    property: DefaultProperty,
    validators: (control: AbstractControl) => ValidationErrors | null,
    propertyValue: string | number | boolean | DefaultEntityValue,
    propertyLanguage: string,
  ): void {
    // Ensure the properties FormArray exists and is correctly initialized
    const propertiesFormArray = this.ensurePropertiesFormArray(property.name);

    // Create and configure the value control, including disabling if necessary
    const valueControl = this.createValueControl(propertyValue, validators);
    this.subscribeToEntityValueChanges(valueControl, property);

    // Create the form group, potentially including a language control
    const group = new UntypedFormGroup({value: valueControl});
    this.addLanguageControl(group, propertyLanguage, validators, property);

    propertiesFormArray.push(group);
  }

  private ensurePropertiesFormArray(propertyName: string): FormArray {
    let propertiesFormArray = this.propertiesForm.get(propertyName) as FormArray;
    if (!propertiesFormArray) {
      propertiesFormArray = new FormArray([]);
      this.propertiesForm.setControl(propertyName, propertiesFormArray);
    }
    return propertiesFormArray;
  }

  private createValueControl(propertyValue: string | number | boolean | DefaultEntityValue, validators): FormControl {
    const isEntityValue = propertyValue instanceof DefaultEntityValue;
    return new FormControl({value: propertyValue, disabled: isEntityValue}, validators);
  }

  private addLanguageControl(group: UntypedFormGroup, propertyLanguage: string, validators, property): void {
    if (propertyLanguage) {
      const languageControl = new FormControl({value: propertyLanguage, disabled: true}, validators);
      this.subscribeToLangValueChanges(languageControl, property);
      group.addControl('language', languageControl);
    }
  }

  private subscribeToEntityValueChanges(control: FormControl, property: DefaultProperty): void {
    this.subscriptions.add(control.valueChanges.subscribe(value => this.changeEntityValueInput(property, value)));
  }

  private changeEntityValueInput(property: DefaultProperty, value: string): void {
    this.filteredEntityValues$[property.name] = of(this.getPropertyValues(property)).pipe(
      map(ev => ev.filter(entityValue => entityValue.name.startsWith(value))),
    );
  }

  private subscribeToLangValueChanges(control: FormControl, property: DefaultProperty): void {
    this.subscriptions.add(control.valueChanges.subscribe(value => this.changeLanguageInput(property.name, value)));
  }

  private changeLanguageInput(name: string, value: string): void {
    this.filteredLanguageValues$[name] = of(locale.all.filter(lang => lang.tag)).pipe(
      startWith(locale.all),
      map(local => local.filter(lang => lang.tag.startsWith(value))),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('parentForm' in changes && this.parentForm) {
      this.parentForm.setControl('entityValueProperties', this.propertiesForm);
    }
  }

  private getPropertyValues(property: DefaultProperty): DefaultEntityValue[] {
    const existingEntityValues = EntityValueUtil.existingEntityValues(this.currentCachedFile, property);
    const entityValues = EntityValueUtil.entityValues(this.parentForm, property);
    return [...existingEntityValues, ...entityValues];
  }

  changeSelection(controlName: string, propertyValue: any): void {
    EntityValueUtil.changeSelection(this.entityValuePropertiesForm, controlName, propertyValue);
    this.closeAllAutocompletePanels();
    this.changeDetector.detectChanges();
  }

  changeLanguageSelection(ev: EntityValueProperty, propertyValue: string, index: number): void {
    EntityValueUtil.changeLanguageSelection(this.propertiesForm, ev, propertyValue, index);
    this.closeAllAutocompletePanels();
    this.changeDetector.detectChanges();
  }

  private closeAllAutocompletePanels() {
    this.autocompleteTriggers.forEach(trigger => {
      trigger.closePanel();
    });
  }

  createNewEntityValue(property: DefaultProperty, entityValue: string) {
    EntityValueUtil.createNewEntityValue(this.parentForm, property, entityValue);
    this.changeDetector.detectChanges();
  }

  addLanguage(entityValueProp: EntityValueProperty): void {
    const fieldValidators = entityValueProp.optional ? null : EditorDialogValidators.requiredObject;
    const languagesFormArray = this.propertiesForm.get(entityValueProp.key.property.name) as FormArray;

    const languageInputControl = new FormControl('', fieldValidators);

    this.subscriptions.add(
      languageInputControl.valueChanges.subscribe(value => {
        this.changeLanguageInput(entityValueProp.key.property.name, value);
      }),
    );

    const languageFormGroup = this.fb.group({
      value: ['', fieldValidators],
      language: languageInputControl,
    });

    languagesFormArray.push(languageFormGroup);
  }

  removeLanguage(entityValueProp: EntityValueProperty, index: number): void {
    const languagesFormArray = this.propertiesForm.get(entityValueProp.key.property.name) as FormArray;
    languagesFormArray.removeAt(index);
  }

  isCharacteristicCollectionType(characteristic: Characteristic | undefined): boolean {
    return characteristic instanceof DefaultCollection;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
