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

import {CacheUtils, LoadedFilesService, NamespaceFile} from '@ame/cache';
import {NotificationsService} from '@ame/shared';
import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, validateAsync} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, Entity, useLoader} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

export interface EntityExtendsOption {
  name: string;
  description: string;
  urn: string;
  namespace?: string;
  entity?: Entity;
}

@Component({
  selector: 'ame-entity-extends-field',
  templateUrl: './extends-field.component.html',
  styleUrls: ['./extends-field.component.scss', '../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    FormField,
    MatInput,
    MatIconButton,
    MatAutocomplete,
    MatIconModule,
    MatOptgroup,
    MatOption,
    MatError,
    TranslocoDirective,
  ],
})
export class EntityExtendsFieldComponent extends InputFieldComponent<DefaultEntity> implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private editorDialogValidators = inject(EditorDialogValidators);
  private loadedFilesService = inject(LoadedFilesService);
  private readonly displayModel = signal('');
  private readonly extendsModel = signal<Entity | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  private unregisterDisplay = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.editorDialogValidators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultEntity)
          : of(null),
    });

  readonly displayField = form(this.displayModel, path => {
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result?.['foundModel'] ? 'foundModel' : result && Object.keys(result)[0];
        return kind ? {kind, message: 'Entity name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Entity name could not be validated'}),
    });
    disabled(path, {when: () => this.locked() || this.blocked()});
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly filteredEntities = computed<EntityExtendsOption[]>(() => this.filterEntities(false));
  readonly filteredAbstractEntities = computed<EntityExtendsOption[]>(() => {
    const entities = this.metaModelElement instanceof DefaultEntity ? this.filteredEntities() : [];
    return [...entities, ...this.filterEntities(true)].filter(entity => entity.name !== this.metaModelElement?.name);
  });
  public predefinedEntities: {
    name: string;
    entity: Entity;
    urn: string;
    description: string;
    complex: boolean;
    namespace?: string;
  }[];

  public get isAbstractEntity() {
    return (this.metaModelElement as DefaultEntity).isAbstractEntity();
  }

  get currentFile(): NamespaceFile {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor() {
    super();
    this.fieldName = 'extends';
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setExtendsControl());
    const {getAllPredefinedEntities} = useLoader({rdfModel: this.currentFile.rdfModel});
    const predefinedEntities = getAllPredefinedEntities();
    this.predefinedEntities = Object.values(predefinedEntities)
      .map(entity => {
        return {
          name: entity.name,
          description: entity.getDescription('en') || '',
          urn: entity.getUrn(),
          complex: false,
          entity,
        };
      })
      .sort(({name: a}, {name: b}) => (a > b ? 1 : -1));
  }

  ngOnDestroy() {
    this.unregisterDisplay();
    this.signalForm().remove('extends');
    super.ngOnDestroy();
  }

  getCurrentValue() {
    return this.previousData()?.[this.fieldName] || this.metaModelElement?.extends_ || null;
  }

  setExtendsControl() {
    const extendsElement = this.getCurrentValue();
    const value = extendsElement?.name || '';

    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement) || this.metaModelElement.isPredefined);
    this.locked.set(!!value);
    this.displayModel.set(value);
    this.extendsModel.set(extendsElement);
    this.unregisterDisplay = this.signalForm().register('extendsValue', this.displayField);
    this.signalForm().set('extends', extendsElement);
  }

  onSelectionChange(newValue: {urn: string; name: string; entity?: Entity} | null) {
    if (newValue === null) {
      return; // happens on reset form
    }

    let foundEntity = this.currentFile.cachedFile.get<Entity>(newValue.urn);

    if (!foundEntity) {
      foundEntity = this.loadedFilesService.findElementOnExtReferences(newValue.urn);
    }

    if (!foundEntity) {
      foundEntity = newValue.entity;
    }

    this.selectEntity(foundEntity, newValue.name);
  }

  createNewAbstractEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.signalForm().get('name') === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.displayModel.set('');
      return;
    }

    const newAbstractEntity = new DefaultEntity({
      isAbstract: true,
      name: entityName,
      aspectModelUrn: urn,
      metaModelVersion: this.metaModelElement.metaModelVersion,
    });
    this.selectEntity(newAbstractEntity, entityName);
  }

  createEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.signalForm().get('name') === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.displayModel.set('');
      return;
    }

    const newAbstractEntity = new DefaultEntity({
      name: entityName,
      aspectModelUrn: urn,
      metaModelVersion: this.metaModelElement.metaModelVersion,
    });
    this.selectEntity(newAbstractEntity, entityName);
  }

  unlockExtends() {
    this.locked.set(false);
    this.displayModel.set('');
    this.extendsModel.set(null);
    this.signalForm().set('extends', null);
    this.displayField().markAsTouched();
  }

  hasError(kind: string): boolean {
    return this.displayField()
      .errors()
      .some(error => error.kind === kind);
  }

  private selectEntity(entity: Entity, name: string): void {
    this.displayModel.set(name);
    this.extendsModel.set(entity);
    this.signalForm().set('extends', entity);
    this.locked.set(true);
  }

  private filterEntities(isAbstract: boolean): EntityExtendsOption[] {
    const value = this.displayModel();
    const local = CacheUtils.getCachedElements(this.currentFile.cachedFile, DefaultEntity)
      .filter(entity => entity.isAbstractEntity() === isAbstract)
      .map(entity => ({
        name: entity.name,
        description: entity.getDescription('en') || '',
        urn: entity.aspectModelUrn,
        namespace: undefined as string | undefined,
      }));
    const external = isAbstract ? this.searchExtAbstractEntity(value) : this.searchExtEntity(value);
    return [...local, ...external].filter(entity => this.inSearchList(entity, value));
  }
}
