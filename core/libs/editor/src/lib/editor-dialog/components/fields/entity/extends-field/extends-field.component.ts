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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService} from '@ame/shared';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultEntity, Entity, useLoader} from '@esmf/aspect-model-loader';
import {Observable, combineLatest, map, of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-entity-extends-field',
  templateUrl: './extends-field.component.html',
  styleUrls: ['./extends-field.component.scss', '../../field.scss'],
})
export class EntityExtendsFieldComponent extends InputFieldComponent<DefaultEntity> implements OnInit, OnDestroy {
  public filteredAbstractEntities$: Observable<any[]>;
  public filteredEntities$: Observable<any[]>;

  public extendsValueControl: FormControl;
  public extendsControl: FormControl;
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

  constructor(
    private notificationsService: NotificationsService,
    public rdfService: RdfService,
    private validators: EditorDialogValidators,
    private loadedFilesService: LoadedFilesService,
  ) {
    super();
    this.fieldName = 'extends';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setExtendsControl());
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
    super.ngOnDestroy();
    this.parentForm.removeControl('extendsValue');
    this.parentForm.removeControl('extends');
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.extends_ || null;
  }

  setExtendsControl() {
    const extendsElement = this.getCurrentValue();
    const value = extendsElement?.name || '';

    this.parentForm.setControl(
      'extendsValue',
      new FormControl(
        {
          value,
          disabled: !!value || this.loadedFiles.isElementExtern(this.metaModelElement) || this.metaModelElement.isPredefined,
        },
        {
          validators: [this.validators.duplicateNameWithDifferentType(this.metaModelElement, DefaultEntity)],
        },
      ),
    );

    this.parentForm.setControl(
      'extends',
      new FormControl({
        value: extendsElement,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    this.extendsValueControl = this.parentForm.get('extendsValue') as FormControl;
    this.extendsControl = this.parentForm.get('extends') as FormControl;

    this.filteredAbstractEntities$ = combineLatest([
      this.metaModelElement instanceof DefaultEntity ? this.initFilteredEntities(this.extendsValueControl) : of([]),
      this.initFilteredAbstractEntities(this.extendsValueControl),
    ]).pipe(map(([a, b]) => [...a, ...b].filter(e => e.name !== this.metaModelElement.name)));

    this.filteredEntities$ = this.initFilteredEntities(this.extendsValueControl);
  }

  onSelectionChange(newValue: any) {
    if (newValue === null) {
      return; // happens on reset form
    }

    let foundEntity: DefaultEntity = this.currentFile.cachedFile.get(newValue.urn);

    if (!foundEntity) {
      foundEntity = this.loadedFilesService.findElementOnExtReferences(newValue.urn);
    }

    if (!foundEntity) {
      foundEntity = newValue.entity;
    }

    this.parentForm.setControl('extends', new FormControl(foundEntity));

    this.extendsValueControl.patchValue(newValue.name);
    this.extendsControl.setValue(foundEntity);
    this.extendsValueControl.disable();
  }

  createNewAbstractEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.extendsValueControl.setValue('');
      return;
    }

    // const newAbstractEntity = new DefaultAbstractEntity(this.metaModelElement.metaModelVersion, urn, entityName, []);
    const newAbstractEntity = new DefaultEntity({
      isAbstract: true,
      name: entityName,
      aspectModelUrn: urn,
      metaModelVersion: this.metaModelElement.metaModelVersion,
    });
    this.parentForm.setControl('extends', new FormControl(newAbstractEntity));

    this.extendsValueControl.patchValue(entityName);
    this.extendsControl.setValue(newAbstractEntity);
    this.extendsValueControl.disable();
  }

  createEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.extendsValueControl.setValue('');
      return;
    }

    const newAbstractEntity = new DefaultEntity({
      name: entityName,
      aspectModelUrn: urn,
      metaModelVersion: this.metaModelElement.metaModelVersion,
    });
    this.parentForm.setControl('extends', new FormControl(newAbstractEntity));

    this.extendsValueControl.patchValue(entityName);
    this.extendsControl.setValue(newAbstractEntity);
    this.extendsValueControl.disable();
  }

  unlockExtends() {
    this.extendsValueControl.enable();
    this.extendsValueControl.patchValue('');
    this.extendsControl.patchValue(null);
    this.extendsControl.markAllAsTouched();
  }
}
