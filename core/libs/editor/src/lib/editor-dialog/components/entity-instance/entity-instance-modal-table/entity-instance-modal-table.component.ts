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

import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, UntypedFormGroup} from '@angular/forms';
import {
  Characteristic,
  DefaultAbstractProperty,
  DefaultCollection,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  EntityValueProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {DataType, EditorDialogValidators, FormFieldHelper} from '@ame/editor';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {EntityInstanceUtil} from '../utils/EntityInstanceUtil';
import {map, Observable, of, startWith, Subscription} from 'rxjs';
import * as locale from 'locale-codes';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'ame-entity-instance-modal-table',
  templateUrl: './entity-instance-modal-table.component.html',
  styleUrls: ['./entity-instance-modal-table.component.scss'],
})
export class EntityInstanceModalTableComponent implements OnChanges, OnDestroy {
  @Input()
  form: FormGroup;

  @Input()
  entity: DefaultEntity;

  @Input()
  enumeration: DefaultEnumeration;

  @Input()
  entityValue: DefaultEntityInstance;

  @ViewChildren(MatAutocompleteTrigger) autocompleteTriggers: QueryList<MatAutocompleteTrigger>;

  protected readonly EntityInstanceUtil = EntityInstanceUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  sources: EntityValueProperty[] = [];

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  subscriptions = new Subscription();

  get propertiesForm(): FormGroup {
    return this.form.get('properties') as FormGroup;
  }

  get currentCachedFile(): CachedFile {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private namespacesCacheService: NamespacesCacheService,
    private fb: FormBuilder,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('entity' in changes && this.entity) {
      this.sources = this.buildEntityValueArray();

      this.entity.allProperties.forEach((element: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>) => {
        const propertyName = (element.property as DefaultProperty).name;

        this.filteredEntityValues$[propertyName] = of(this.getPropertyValues(element.property as DefaultProperty));

        if (EntityInstanceUtil.isDefaultPropertyWithLangString(element)) {
          this.filteredLanguageValues$[propertyName] = of(locale.all.filter(lang => lang.tag));
        }
      });
    }
  }

  getFormArray(value: string): FormArray {
    return this.propertiesForm.get(value) as FormArray;
  }

  private buildEntityValueArray(): EntityValueProperty[] {
    return this.entity.allProperties.map(prop => this.createEntityValueProp(prop));
  }

  private createEntityValueProp(prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): EntityValueProperty {
    const valueControl = this.createFormControl(prop);
    this.subscribeToEntityValueChanges(valueControl, prop);

    const group = new UntypedFormGroup({value: valueControl});
    this.addGroupToPropertiesForm(prop.property.name, group);

    if (EntityInstanceUtil.isDefaultPropertyWithLangString(prop)) {
      const languageControl = this.createFormControl(prop);
      this.subscribeToLangValueChanges(languageControl, prop);
      group.addControl('language', languageControl);
    }

    return {
      key: prop as OverWrittenProperty,
      value: '',
      language: EntityInstanceUtil.isDefaultPropertyWithLangString(prop) ? '' : undefined,
      optional: prop.keys.optional,
    };
  }

  private createFormControl(prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): FormControl {
    return new FormControl('', prop.keys.optional ? null : EditorDialogValidators.requiredObject);
  }

  private subscribeToEntityValueChanges(control: FormControl, prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): void {
    this.subscriptions.add(control.valueChanges.subscribe(value => this.changeEntityValueInput(prop.property as DefaultProperty, value)));
  }

  private subscribeToLangValueChanges(control: FormControl, prop: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): void {
    this.subscriptions.add(control.valueChanges.subscribe(value => this.changeLanguageInput(prop.property.name, value)));
  }

  private addGroupToPropertiesForm(propertyName: string, group: UntypedFormGroup): void {
    const propertiesArray = this.propertiesForm.get(propertyName) as FormArray;
    propertiesArray.push(group);
  }

  private changeEntityValueInput(property: DefaultProperty, value: string): void {
    this.filteredEntityValues$[property.name] = of(this.getPropertyValues(property)).pipe(
      map(ev => ev.filter(entityValue => entityValue.name.startsWith(value))),
    );
  }

  private getPropertyValues(property: DefaultProperty): DefaultEntityInstance[] {
    const existingEntityValues = EntityInstanceUtil.existingEntityValues(this.currentCachedFile, property);
    const entityValues = EntityInstanceUtil.entityValues(this.form, property);
    return [...existingEntityValues, ...entityValues];
  }

  changeSelection(controlName: string, propertyValue: any): void {
    EntityInstanceUtil.changeSelection(this.propertiesForm, controlName, propertyValue);
    this.closeAllAutocompletePanels();
    this.changeDetector.detectChanges();
  }

  changeLanguageSelection(ev: EntityValueProperty, propertyValue: string, index: number): void {
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
    EntityInstanceUtil.createNewEntityValue(this.form, property, entityValue);
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

  private changeLanguageInput(name: string, value: string): void {
    this.filteredLanguageValues$[name] = of(locale.all.filter(lang => lang.tag)).pipe(
      startWith(locale.all),
      map(local => local.filter(lang => lang.tag.startsWith(value))),
    );
  }

  removeLanguage(entityValueProp: EntityValueProperty, index: number): void {
    const languagesFormArray = this.propertiesForm.get(entityValueProp.key.property.name) as FormArray;
    languagesFormArray.removeAt(index);
  }

  isCharacteristicCollectionType(characteristic: Characteristic | undefined): boolean {
    return characteristic instanceof DefaultCollection;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
