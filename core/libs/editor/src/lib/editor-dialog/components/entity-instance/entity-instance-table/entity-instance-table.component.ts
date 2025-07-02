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

import {DataType, EditorDialogValidators, EntityInstanceUtil, FormFieldHelper} from '@ame/editor';
import {isDataTypeLangString} from '@ame/shared';
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
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {
  Characteristic,
  DefaultCollection,
  DefaultEntityInstance,
  DefaultProperty,
  EntityInstanceProperty,
  NamedElement,
  PropertyPayload,
  Value,
} from '@esmf/aspect-model-loader';
import * as locale from 'locale-codes';
import {Observable, Subscription, map, of, startWith} from 'rxjs';
import {InputFieldComponent} from '../../fields';

@Component({
  selector: 'ame-entity-instance-table',
  templateUrl: './entity-instance-table.component.html',
  styleUrls: ['./entity-instance-table.component.scss'],
})
export class EntityInstanceTableComponent extends InputFieldComponent<DefaultEntityInstance> implements OnInit, OnChanges, OnDestroy {
  @ViewChildren(MatAutocompleteTrigger) autocompleteTriggers: QueryList<MatAutocompleteTrigger>;

  protected readonly EntityValueUtil = EntityInstanceUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  propertiesForm: FormGroup;
  sources: EntityInstanceProperty<DefaultProperty>[] = [];
  subscriptions = new Subscription();

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  get entityValuePropertiesForm(): FormGroup {
    return this.parentForm.get('entityValueProperties') as FormGroup;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.getMetaModelData().subscribe((metaModelElement: NamedElement) => {
        this.propertiesForm = new FormGroup({});
        this.metaModelElement = metaModelElement as DefaultEntityInstance;
        this.parentForm.setControl('entityValueProperties', this.propertiesForm);

        const {assertions: properties, type: entity} = this.metaModelElement;

        if (!properties.size && entity.properties.length) {
          for (const property of entity.properties) {
            !this.metaModelElement.getAssertion(property.aspectModelUrn).length &&
              this.metaModelElement.setAssertion(property.aspectModelUrn, new Value('', property.characteristic?.dataType));
          }
        }

        this.metaModelElement.getTuples().forEach(([propertyUrn, value]) => {
          const property = this.loadedFiles.getElement<DefaultProperty>(propertyUrn);
          const validators = this.getValidators([propertyUrn, value]);

          this.initializeFormControl(property, validators, value instanceof DefaultEntityInstance ? value : value.value, value.language);
        });

        this.sources = this.metaModelElement?.type?.properties.map(prop => this.createEntityValueProp(prop));
      }),
    );
  }

  getFormArray(value: string): FormArray {
    return this.entityValuePropertiesForm.get(value) as FormArray;
  }

  getPropertyPayload(propertyUrn: string): PropertyPayload {
    return this.metaModelElement.type.propertiesPayload[propertyUrn];
  }

  private createEntityValueProp(property: DefaultProperty): EntityInstanceProperty<DefaultProperty> {
    const propertyControl = this.propertiesForm.get(property.name);

    if (!propertyControl) {
      const propertiesFormArray = EntityInstanceUtil.getDisplayControl(this.propertiesForm, property.name);
      const valueControl = this.createFormControl(property);
      this.subscribeToEntityValueChanges(valueControl, property);

      const group = new UntypedFormGroup({value: valueControl});
      propertiesFormArray.push(group);

      if (EntityInstanceUtil.isDefaultPropertyWithLangString(property)) {
        const languageControl = this.createFormControl(property);
        this.subscribeToLangValueChanges(languageControl, property);
        group.addControl('language', languageControl);
      }
    }

    return [
      property,
      new Value('', property.characteristic?.dataType, EntityInstanceUtil.isDefaultPropertyWithLangString(property) ? '' : undefined),
    ];
  }

  private createFormControl(prop: DefaultProperty): FormControl {
    const propertyPayload = this.metaModelElement.type.propertiesPayload[prop.aspectModelUrn];
    return new FormControl('', propertyPayload?.optional ? null : EditorDialogValidators.requiredObject);
  }

  private getValidators([propertyUrn]: EntityInstanceProperty): (control: AbstractControl) => ValidationErrors | null {
    const propertyPayload = this.metaModelElement.type.propertiesPayload[propertyUrn];
    return propertyPayload?.optional ? null : Validators.required;
  }

  private initializeFormControl(
    property: DefaultProperty,
    validators: (control: AbstractControl) => ValidationErrors | null,
    propertyValue: string | number | boolean | DefaultEntityInstance,
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

  private createValueControl(
    propertyValue: string | number | boolean | DefaultEntityInstance,
    validators: ValidationErrors | null,
  ): FormControl {
    const isEntityValue = propertyValue instanceof DefaultEntityInstance;
    return new FormControl({value: propertyValue, disabled: isEntityValue}, validators);
  }

  private addLanguageControl(
    group: UntypedFormGroup,
    propertyLanguage: string,
    validators: ValidationErrors | null,
    property: DefaultProperty,
  ): void {
    if ((propertyLanguage || propertyLanguage === '') && isDataTypeLangString(property.characteristic.dataType)) {
      const languageControl = new FormControl(
        {
          value: propertyLanguage,
          disabled: propertyLanguage !== '',
        },
        validators,
      );
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

  private getPropertyValues(property: DefaultProperty): DefaultEntityInstance[] {
    const existingEntityValues = EntityInstanceUtil.existingEntityValues(this.currentCachedFile, property);
    const entityValues = EntityInstanceUtil.entityValues(this.parentForm, property);
    return [...existingEntityValues, ...entityValues];
  }

  changeSelection(controlName: string, propertyValue: any): void {
    EntityInstanceUtil.changeSelection(this.entityValuePropertiesForm, controlName, propertyValue);
    this.closeAllAutocompletePanels();
    this.changeDetector.detectChanges();
  }

  changeLanguageSelection(ev: EntityInstanceProperty<DefaultProperty>, propertyValue: string, index: number): void {
    EntityInstanceUtil.changeLanguageSelection(this.propertiesForm, ev, propertyValue, index);
    this.closeAllAutocompletePanels();
    this.changeDetector.detectChanges();
  }

  private closeAllAutocompletePanels() {
    this.autocompleteTriggers.forEach(trigger => {
      trigger.closePanel();
    });
  }

  createNewEntityValue(property: DefaultProperty, entityValue: string) {
    EntityInstanceUtil.createNewEntityValue(this.parentForm, property, entityValue);
    this.changeDetector.detectChanges();
  }

  addLanguage([property]: EntityInstanceProperty<DefaultProperty>): void {
    const propertyPayload = this.metaModelElement.type.propertiesPayload[property.aspectModelUrn];

    const fieldValidators = propertyPayload?.optional ? null : EditorDialogValidators.requiredObject;
    const languagesFormArray = this.propertiesForm.get(property.name) as FormArray;

    const languageInputControl = new FormControl('', fieldValidators);

    this.subscriptions.add(
      languageInputControl.valueChanges.subscribe(value => {
        this.changeLanguageInput(property.name, value);
      }),
    );

    const languageFormGroup = this.fb.group({
      value: ['', fieldValidators],
      language: languageInputControl,
    });

    languagesFormArray.push(languageFormGroup);
  }

  removeLanguage([property]: EntityInstanceProperty<DefaultProperty>, index: number): void {
    const languagesFormArray = this.propertiesForm.get(property.name) as FormArray;
    languagesFormArray.removeAt(index);
  }

  isCharacteristicCollectionType(characteristic: Characteristic | undefined): boolean {
    return characteristic instanceof DefaultCollection;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
