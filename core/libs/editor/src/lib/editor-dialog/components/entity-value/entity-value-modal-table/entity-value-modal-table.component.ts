/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {
  DefaultAbstractProperty,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  EntityValueProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {DataType, EditorModelService, FormFieldHelper} from '@ame/editor';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {MatTableDataSource} from '@angular/material/table';
import {EntityValueUtil} from '../utils/EntityValueUtil';
import {map, Observable, startWith} from 'rxjs';
import * as locale from 'locale-codes';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'ame-entity-value-modal-table',
  templateUrl: './entity-value-modal-table.component.html',
  styleUrls: ['./entity-value-modal-table.component.scss'],
})
export class EntityValueModalTableComponent implements OnChanges {
  @Input()
  form: FormGroup;

  @Input()
  entity: DefaultEntity;

  @Input()
  enumeration: DefaultEnumeration;

  @Input()
  entityValue: DefaultEntityValue;

  @ViewChild('autoTrigger') autocompleteTrigger: MatAutocompleteTrigger;

  protected readonly EntityValueUtil = EntityValueUtil;
  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  // only used for displaying the name of an entity value within an input as string
  displayForm = new FormGroup({});

  displayedColumns = ['key', 'value'];
  dataSource: MatTableDataSource<EntityValueProperty>;

  filteredEntityValues$: {[key: string]: Observable<any[]>} = {};
  filteredLanguageValues$: {[key: string]: Observable<any[]>} = {};

  get propertiesForm(): FormGroup {
    return this.form.get('properties') as FormGroup;
  }

  get currentCachedFile(): CachedFile {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(private changeDetector: ChangeDetectorRef, private namespacesCacheService: NamespacesCacheService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.hasOwnProperty('entity') || !this.entity) return;

    const entityValue = this.buildEntityValueArray();
    this.dataSource = new MatTableDataSource(entityValue);

    this.entity.allProperties.forEach((element: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>) => {
      const property = element.property as DefaultProperty;

      this.filteredEntityValues$[property.name] = EntityValueUtil.initFilteredEntityValues(property, this.displayForm).pipe(
        startWith(''),
        map(value => this.getPropertyValues(property).filter(entityValue => entityValue.name.startsWith(value)))
      );

      if (EntityValueUtil.isDefaultPropertyWithLangString(element)) {
        this.filteredLanguageValues$[property.name] = EntityValueUtil.initFilteredLanguages(property, this.displayForm).pipe(
          startWith(''),
          map(value => locale.all.filter(lang => lang.tag.startsWith(value)))
        );
      }
    });
  }

  getControl(controlName: string): FormControl {
    return this.propertiesForm.get(controlName) as FormControl;
  }

  changeSelection(controlName: string, propertyValue: any) {
    EntityValueUtil.changeSelection(this.displayForm, this.propertiesForm, controlName, propertyValue);

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }

    this.changeDetector.detectChanges();
  }

  createNewEntityValue(property: DefaultProperty, entityValue: string) {
    EntityValueUtil.createNewEntityValue(this.displayForm, this.form, property, entityValue);
    this.changeDetector.detectChanges();
  }

  private buildEntityValueArray(): EntityValueProperty[] {
    const entityValues: EntityValueProperty[] = [];

    for (const element of this.entity.allProperties) {
      if (EntityValueUtil.isDefaultPropertyWithLangString(element)) {
        if (!this.displayedColumns.includes('language')) {
          this.displayedColumns.push('language');
        }

        entityValues.push(this.getLangStringEntityValues(element as OverWrittenProperty));
        continue;
      }

      entityValues.push({key: element as OverWrittenProperty, value: ''});
    }

    return entityValues;
  }

  private getLangStringEntityValues(element: OverWrittenProperty): EntityValueProperty {
    return {
      key: element,
      value: {value: '', language: ''},
    };
  }

  private getPropertyValues(property: DefaultProperty): DefaultEntityValue[] {
    const existingEntityValues = EntityValueUtil.existingEntityValues(this.currentCachedFile, property);
    const entityValues = EntityValueUtil.entityValues(this.form, property);
    return [...existingEntityValues, ...entityValues];
  }
}
