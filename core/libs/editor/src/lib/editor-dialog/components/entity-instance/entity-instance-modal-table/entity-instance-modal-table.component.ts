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

import {LoadedFilesService} from '@ame/cache';
import {DataType, EditorDialogValidators, FormFieldHelper} from '@ame/editor';
import {AsyncPipe, NgClass} from '@angular/common';
import {ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, UntypedFormGroup} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {
  CacheStrategy,
  Characteristic,
  DefaultCollection,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  EntityInstanceProperty,
  PropertyPayload,
  Value,
} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import * as locale from 'locale-codes';
import {map, Observable, of, startWith} from 'rxjs';
import {EntityInstanceUtil} from '../utils/EntityInstanceUtil';

@Component({
  selector: 'ame-entity-instance-modal-table',
  templateUrl: './entity-instance-modal-table.component.html',
  styleUrls: ['./entity-instance-modal-table.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDivider,
    MatIconModule,
    MatFormField,
    MatLabel,
    MatAutocompleteTrigger,
    MatInput,
    MatIconButton,
    MatOption,
    MatError,
    MatMiniFabButton,
    TranslatePipe,
    MatAutocomplete,
    AsyncPipe,
    MatOptgroup,
    NgClass,
  ],
})
export class EntityInstanceModalTableComponent implements OnChanges {
  @ViewChildren(MatAutocompleteTrigger) autocompleteTriggers: QueryList<MatAutocompleteTrigger>;

  @Input() form: FormGroup;
  @Input() entity: DefaultEntity;
  @Input() enumeration: DefaultEnumeration;
  @Input() entityValue: DefaultEntityInstance;

  private destroyRef = inject(DestroyRef);
  private loadedFiles = inject(LoadedFilesService);
  private changeDetector = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  protected readonly EntityInstanceUtil = EntityInstanceUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  sources: EntityInstanceProperty<DefaultProperty>[] = [];

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  get propertiesForm(): FormGroup {
    return this.form.get('properties') as FormGroup;
  }

  get currentCachedFile(): CacheStrategy {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('entity' in changes && this.entity) {
      this.sources = this.buildEntityValueArray();

      this.entity.properties.forEach((property: DefaultProperty) => {
        const propertyName = property.name;

        this.filteredEntityValues$[propertyName] = of(this.getPropertyValues(property));

        if (EntityInstanceUtil.isDefaultPropertyWithLangString(property)) {
          this.filteredLanguageValues$[propertyName] = of(locale.all.filter(lang => lang.tag));
        }
      });
    }
  }

  getFormArray(value: string): FormArray {
    return this.propertiesForm.get(value) as FormArray;
  }

  getPropertyPayload(propertyUrn: string): PropertyPayload {
    return this.entity.propertiesPayload[propertyUrn];
  }

  private buildEntityValueArray(): EntityInstanceProperty<DefaultProperty>[] {
    return this.entity.properties.map(prop => this.createEntityValueProp(prop));
  }

  private createEntityValueProp(prop: DefaultProperty): EntityInstanceProperty<DefaultProperty> {
    const valueControl = this.createFormControl(prop);
    this.subscribeToEntityValueChanges(valueControl, prop);

    const group = new UntypedFormGroup({value: valueControl});
    this.addGroupToPropertiesForm(prop.name, group);

    if (EntityInstanceUtil.isDefaultPropertyWithLangString(prop)) {
      const languageControl = this.createFormControl(prop);
      this.subscribeToLangValueChanges(languageControl, prop);
      group.addControl('language', languageControl);
    }

    return [prop, new Value('', prop.characteristic?.dataType, EntityInstanceUtil.isDefaultPropertyWithLangString(prop) ? '' : undefined)];
  }

  private createFormControl(prop: DefaultProperty): FormControl {
    const propertyPayload = this.entity.propertiesPayload[prop.aspectModelUrn];
    return new FormControl('', propertyPayload?.optional ? null : EditorDialogValidators.requiredObject);
  }

  private subscribeToEntityValueChanges(control: FormControl, prop: DefaultProperty): void {
    control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.changeEntityValueInput(prop as DefaultProperty, value));
  }

  private subscribeToLangValueChanges(control: FormControl, prop: DefaultProperty): void {
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => this.changeLanguageInput(prop.name, value));
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
    EntityInstanceUtil.createNewEntityValue(this.form, property, entityValue);
    this.changeDetector.detectChanges();
  }

  addLanguage([property]: EntityInstanceProperty<DefaultProperty>): void {
    const propertyPayload = this.entity.propertiesPayload[property.aspectModelUrn];

    const fieldValidators = propertyPayload?.optional ? null : EditorDialogValidators.requiredObject;
    const languagesFormArray = this.propertiesForm.get(property.name) as FormArray;

    const languageInputControl = new FormControl('', fieldValidators);

    languageInputControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.changeLanguageInput(property.name, value);
    });

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

  removeLanguage([property]: EntityInstanceProperty<DefaultProperty>, index: number): void {
    const languagesFormArray = this.propertiesForm.get(property.name) as FormArray;
    languagesFormArray.removeAt(index);
  }

  isCharacteristicCollectionType(characteristic: Characteristic | undefined): boolean {
    return characteristic instanceof DefaultCollection;
  }
}
