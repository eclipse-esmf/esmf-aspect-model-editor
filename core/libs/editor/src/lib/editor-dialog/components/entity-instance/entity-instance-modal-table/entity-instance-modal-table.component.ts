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

import {LoadedFilesService} from '@ame/cache';
import {extractNamespace} from '@ame/utils';
import {NgClass} from '@angular/common';
import {Component, computed, effect, inject, input, signal, viewChildren} from '@angular/core';
import {form, FormField, validate} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  CacheStrategy,
  Characteristic,
  DefaultCollection,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultTrait,
  EntityInstanceProperty,
  PropertyPayload,
  Value,
} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import * as locale from 'locale-codes';
import {DataType, FormFieldHelper} from '../../../../helpers/form-field.helper';
import {
  emptyEntityInstanceProperties,
  entityInstanceProperties,
  EntityInstancePropertiesModel,
  EntityInstancePropertyLocks,
  hasMissingRequiredEntityInstanceValue,
} from '../utils/entity-instance-form';
import {EntityInstanceUtil} from '../utils/EntityInstanceUtil';

@Component({
  selector: 'ame-entity-instance-modal-table',
  templateUrl: './entity-instance-modal-table.component.html',
  styleUrls: ['./entity-instance-modal-table.component.scss'],
  imports: [
    MatDivider,
    MatIconModule,
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    MatInput,
    MatIconButton,
    MatOption,
    MatError,
    MatMiniFabButton,
    TranslocoDirective,
    MatAutocomplete,
    MatOptgroup,
    NgClass,
    FormField,
  ],
})
export class EntityInstanceModalTableComponent {
  readonly autocompleteTriggers = viewChildren(MatAutocompleteTrigger);

  readonly entity = input<DefaultEntity>();
  readonly enumeration = input<DefaultEnumeration>();
  readonly entityValue = input<DefaultEntityInstance>();

  private loadedFiles = inject(LoadedFilesService);

  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  readonly sources = computed<EntityInstanceProperty<DefaultProperty>[]>(() => {
    const entity = this.entity();
    if (!entity) return [];
    return entity.properties
      .filter(property => !property.isAbstract)
      .map(property => [
        property,
        new Value('', property.characteristic?.dataType, EntityInstanceUtil.isDefaultPropertyWithLangString(property) ? '' : undefined),
      ]);
  });
  readonly propertiesModel = signal<EntityInstancePropertiesModel>({});
  readonly locks = signal<EntityInstancePropertyLocks>({});
  readonly newEntityValues = signal<DefaultEntityInstance[]>([]);
  readonly propertiesForm = form(this.propertiesModel, path => {
    validate(path, () =>
      this.entity() && hasMissingRequiredEntityInstanceValue(this.entity(), this.propertiesModel())
        ? {kind: 'required', message: 'Please define all required property values'}
        : null,
    );
  });

  get currentCachedFile(): CacheStrategy {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  constructor() {
    effect(() => {
      const entity = this.entity();
      if (!entity) return;

      const entityValue = this.entityValue();
      if (entityValue) {
        const initial = entityInstanceProperties(entityValue, urn => this.loadedFiles.getElement<DefaultProperty>(urn));
        this.propertiesModel.set(initial.properties);
        this.locks.set(initial.locks);
      } else {
        this.propertiesModel.set(emptyEntityInstanceProperties(entity));
        this.locks.set(
          Object.fromEntries(
            entity.properties.filter(property => !property.isAbstract).map(property => [property.name, [{value: false, language: false}]]),
          ),
        );
      }
      this.newEntityValues.set([]);
    });
  }

  getPropertyPayload(propertyUrn: string): PropertyPayload {
    return this.entity().propertiesPayload[propertyUrn];
  }

  rows(propertyName: string) {
    return this.propertiesModel()[propertyName] || [];
  }

  isLocked(propertyName: string, index: number, control: 'value' | 'language'): boolean {
    return !!this.locks()[propertyName]?.[index]?.[control];
  }

  unlockValue(propertyName: string, index: number, control: 'value' | 'language'): void {
    this.propertiesModel.update(properties => ({
      ...properties,
      [propertyName]: properties[propertyName].map((row, rowIndex) => (rowIndex === index ? {...row, [control]: ''} : row)),
    }));
    this.locks.update(locks => ({
      ...locks,
      [propertyName]: locks[propertyName].map((row, rowIndex) => (rowIndex === index ? {...row, [control]: false} : row)),
    }));
  }

  filteredEntityValues(property: DefaultProperty, index: number): DefaultEntityInstance[] {
    const search = String(this.rows(property.name)[index]?.value || '').toLowerCase();
    return [...EntityInstanceUtil.existingEntityValues(this.currentCachedFile, property), ...this.entityValues(property)].filter(value =>
      value.name.toLowerCase().startsWith(search),
    );
  }

  filteredLanguageValues(propertyName: string, index: number) {
    const search = String(this.rows(propertyName)[index]?.language || '').toLowerCase();
    return locale.all.filter(language => language.tag?.toLowerCase().startsWith(search));
  }

  showCreateNewEntityOption(property: DefaultProperty, index: number): boolean {
    const name = String(this.rows(property.name)[index]?.value || '');
    const values = this.filteredEntityValues(property, index);
    if (!name || name.includes(' ') || values.some(value => value.name === name)) return false;

    const namespace = extractNamespace(this.entity().aspectModelUrn);
    return !this.currentCachedFile.get(`${namespace}#${name}`) && !this.newEntityValues().some(value => value.name === name);
  }

  changeSelection(propertyName: string, propertyValue: DefaultEntityInstance, index = 0): void {
    this.propertiesModel.update(properties => ({
      ...properties,
      [propertyName]: properties[propertyName].map((row, rowIndex) => (rowIndex === index ? {...row, value: propertyValue.name} : row)),
    }));
    this.lock(propertyName, index, 'value');
    this.closeAllAutocompletePanels();
  }

  changeLanguageSelection([property]: EntityInstanceProperty<DefaultProperty>, language: string, index: number): void {
    this.propertiesModel.update(properties => ({
      ...properties,
      [property.name]: properties[property.name].map((row, rowIndex) => (rowIndex === index ? {...row, language} : row)),
    }));
    this.lock(property.name, index, 'language');
    this.closeAllAutocompletePanels();
  }

  createNewEntityValue(property: DefaultProperty, entityValueName: string): void {
    const characteristic: Characteristic =
      property.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
    const entityValue = new DefaultEntityInstance({
      metaModelVersion: property.metaModelVersion,
      name: entityValueName,
      aspectModelUrn: `${property.aspectModelUrn.split('#')[0]}#${entityValueName}`,
      type: characteristic?.dataType as DefaultEntity,
      assertions: new Map(),
    });
    for (const nestedProperty of entityValue.type?.properties || []) {
      if (!nestedProperty.isAbstract) entityValue.assertions.set(nestedProperty.aspectModelUrn, []);
    }

    this.newEntityValues.update(values => [...values.filter(value => this.selectedEntityNames().includes(value.name)), entityValue]);
    this.changeSelection(property.name, entityValue);
  }

  addLanguage([property]: EntityInstanceProperty<DefaultProperty>): void {
    this.propertiesModel.update(properties => ({
      ...properties,
      [property.name]: [...properties[property.name], {value: '', language: ''}],
    }));
    this.locks.update(locks => ({
      ...locks,
      [property.name]: [...locks[property.name], {value: false, language: false}],
    }));
  }

  removeLanguage([property]: EntityInstanceProperty<DefaultProperty>, index: number): void {
    this.propertiesModel.update(properties => ({
      ...properties,
      [property.name]: properties[property.name].filter((_, rowIndex) => rowIndex !== index),
    }));
    this.locks.update(locks => ({
      ...locks,
      [property.name]: locks[property.name].filter((_, rowIndex) => rowIndex !== index),
    }));
  }

  isRequiredInvalid(property: DefaultProperty, index: number, control: 'value' | 'language'): boolean {
    if (this.getPropertyPayload(property.aspectModelUrn)?.optional) return false;
    const value = this.rows(property.name)[index]?.[control];
    return value === '' || value === null || value === undefined;
  }

  isCharacteristicCollectionType(characteristic: Characteristic | undefined): boolean {
    return characteristic instanceof DefaultCollection;
  }

  private entityValues(property: DefaultProperty): DefaultEntityInstance[] {
    const characteristic =
      property.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
    return this.newEntityValues().filter(value => value.type.aspectModelUrn === characteristic?.dataType?.getUrn?.());
  }

  private selectedEntityNames(): string[] {
    return Object.values(this.propertiesModel()).flatMap(rows => rows.map(row => row.value));
  }

  private lock(propertyName: string, index: number, control: 'value' | 'language'): void {
    this.locks.update(locks => ({
      ...locks,
      [propertyName]: locks[propertyName].map((row, rowIndex) => (rowIndex === index ? {...row, [control]: true} : row)),
    }));
  }

  private closeAllAutocompletePanels(): void {
    this.autocompleteTriggers().forEach(trigger => trigger.closePanel());
  }
}
