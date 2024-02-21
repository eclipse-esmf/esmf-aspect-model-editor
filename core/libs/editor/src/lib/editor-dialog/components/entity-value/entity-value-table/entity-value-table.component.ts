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

import {ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {BaseMetaModelElement, DefaultEntityValue, DefaultProperty, EntityValueProperty, LangStringProperty} from '@ame/meta-model';
import {DataType, EntityValueUtil, FormFieldHelper} from '@ame/editor';
import {InputFieldComponent} from '../../fields';
import {MatTableDataSource} from '@angular/material/table';
import {map, Observable, startWith} from 'rxjs';
import * as locale from 'locale-codes';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'ame-entity-value-table',
  templateUrl: './entity-value-table.component.html',
  styleUrls: ['./entity-value-table.component.scss'],
})
export class EntityValueTableComponent extends InputFieldComponent<DefaultEntityValue> implements OnInit, OnChanges, OnDestroy {
  @ViewChild('autoTrigger') autocompleteTrigger: MatAutocompleteTrigger;

  protected readonly EntityValueUtil = EntityValueUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  displayedColumns = ['key', 'value'];
  dataSource: MatTableDataSource<EntityValueProperty>;

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  displayForm = new FormGroup({});
  propertiesForm: FormGroup = new FormGroup({});

  get entityValuePropertiesForm(): FormGroup {
    return this.parentForm.get('entityValueProperties') as FormGroup;
  }

  constructor(private changeDetector: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.getMetaModelData().subscribe((metaModelElement: BaseMetaModelElement) => {
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
          const isLangString = EntityValueUtil.isDefaultPropertyWithLangString(entityValueProperty.key);
          const validators = this.getValidators(entityValueProperty);
          const propertyValue = this.extractPropertyValue(entityValueProperty, isLangString);

          this.initializeFormControl(property.name, propertyValue, validators);
          this.initializeFilteredEntityValues(property);

          if (isLangString) {
            this.handleLangStringProperty(entityValueProperty, property, validators);
          }
        });

        this.dataSource = new MatTableDataSource(this.metaModelElement.properties);
      }),
    );
  }

  private getValidators(entityValueProperty: EntityValueProperty): (control: AbstractControl) => ValidationErrors | null {
    return entityValueProperty.key.keys.optional ? null : Validators.required;
  }

  private extractPropertyValue(entityValueProperty: EntityValueProperty, isLangString: boolean) {
    if (isLangString) {
      return (entityValueProperty.value as LangStringProperty).value;
    }

    return entityValueProperty.value;
  }

  private initializeFormControl(
    propertyName: string,
    propertyValue: any,
    validators: (control: AbstractControl) => ValidationErrors | null,
  ) {
    this.propertiesForm.setControl(propertyName, new FormControl(propertyValue, validators));

    if (propertyValue instanceof DefaultEntityValue) {
      this.displayForm.setControl(propertyName, new FormControl(propertyValue['name'], validators));
    } else {
      this.displayForm.setControl(propertyName, new FormControl(propertyValue, validators));
    }

    if (propertyValue) {
      this.displayForm.get(propertyName).disable();
    }
  }

  private initializeFilteredEntityValues(property: DefaultProperty) {
    this.filteredEntityValues$[property.name] = EntityValueUtil.initFilteredEntityValues(property, this.displayForm).pipe(
      startWith(''),
      map(value => this.getPropertyValues(property).filter(entityValue => entityValue.name.startsWith(value))),
    );
  }

  private handleLangStringProperty(
    entityValueProperty: EntityValueProperty,
    property: DefaultProperty,
    validators: (control: AbstractControl) => ValidationErrors | null,
  ) {
    if (!this.displayedColumns.includes('language')) {
      this.displayedColumns.push('language');
    }

    const language = (entityValueProperty.value as LangStringProperty).language;

    this.propertiesForm.setControl(`${property.name}-lang`, new FormControl(language, validators));
    this.displayForm.setControl(`${property.name}-lang`, new FormControl(language, validators));
    this.displayForm.get(`${property.name}-lang`).disable();

    this.filteredLanguageValues$[property.name] = EntityValueUtil.initFilteredLanguages(property, this.displayForm).pipe(
      startWith(''),
      map(value => locale.all.filter(lang => lang.tag.startsWith(value))),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('parentForm') && this.parentForm) {
      this.parentForm.setControl('entityValueProperties', this.propertiesForm);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getPropertyValues(property: DefaultProperty): DefaultEntityValue[] {
    const existingEntityValues = EntityValueUtil.existingEntityValues(this.currentCachedFile, property);
    const entityValues = EntityValueUtil.entityValues(this.parentForm, property);
    return [...existingEntityValues, ...entityValues];
  }

  changeSelection(controlName: string, propertyValue: any) {
    EntityValueUtil.changeSelection(this.displayForm, this.entityValuePropertiesForm, controlName, propertyValue);

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }

    this.changeDetector.detectChanges();
  }

  getControl(propertyControlName: string): FormControl {
    return this.propertiesForm.get(propertyControlName) as FormControl;
  }
}
