/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EditorModelService} from '../../../editor-model.service';
import {EditorDialogValidators} from '../../../validators';
import {DefaultEntity, DefaultEntityValue, DefaultEnumeration, OverWrittenProperty} from '@ame/meta-model';
import {NamespacesCacheService} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';

export interface NewEntityValueDialogOptions {
  metaModel: DefaultEnumeration | DefaultEntityValue;
  dataType: DefaultEntity;
  complexValues;
}

@Component({
  templateUrl: './entity-value-modal.component.html',
  styleUrls: ['./entity-value-modal.component.scss'],
})
export class EntityValueModalComponent {
  public title: string;

  public form: FormGroup;
  public entityValueName: FormControl;

  public entity: DefaultEntity;
  public entityValue: DefaultEntityValue;
  public enumeration: DefaultEnumeration;
  public complexValues: DefaultEntity[] = []; // already existing complex values

  readonly displayedColumns = ['key', 'value'];
  readonly addTitle = 'Add new entity value';
  readonly editTitle = 'Edit entity value';

  get propertiesForm(): FormGroup {
    return this.form?.get('properties') as FormGroup;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: NewEntityValueDialogOptions,
    private dialogRef: MatDialogRef<EntityValueModalComponent>,
    private editorModelService: EditorModelService,
    private namespacesCacheService: NamespacesCacheService,
    private rdfService: RdfService
  ) {
    this.complexValues = data.complexValues;
    if (data.metaModel instanceof DefaultEnumeration) {
      this.enumeration = data.metaModel;
      this.entity = this.data.dataType;
      this.title = this.addTitle;
      this.entityValueName = new FormControl('', [
        Validators.required,
        EditorDialogValidators.noWhiteSpace,
        EditorDialogValidators.duplicateNameString(this.namespacesCacheService, this.entity.aspectModelUrn.split('#')[0]),
      ]);
    } else {
      this.entityValue = data.metaModel;
      this.entity = this.entityValue.entity as DefaultEntity;
      this.title = this.editTitle;
      this.entityValueName = new FormControl('', [
        Validators.required,
        EditorDialogValidators.noWhiteSpace,
        EditorDialogValidators.duplicateName(this.namespacesCacheService, this.entityValue, this.rdfService.externalRdfModels),
      ]);
    }
    this.buildForm();
  }

  private buildForm(): void {
    this.form = new FormGroup({
      entityValueName: this.entityValueName,
      properties: new FormGroup({}),
      newEntityValues: new FormControl([]),
    });

    this.entity.allProperties.forEach((property: OverWrittenProperty<any>) => {
      const validators = [];
      if (!property.keys.optional) {
        validators.push(EditorDialogValidators.requiredObject);
      }
      this.propertiesForm.setControl(property.property.name, new FormControl(null, validators));
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }

    if (this.isEntityValueNameAlreadyUsed(this.entityValueName.value)) {
      this.entityValueName.setErrors({
        nameAlreadyExists: {},
      });
      return;
    }

    // map with property name -> value or new/existing Entity Value
    const propertyEntityValueMap = {};
    Object.keys(this.propertiesForm.controls).forEach(key => {
      propertyEntityValueMap[key] = this.propertiesForm.get(key).value;
    });

    this.dialogRef.close({
      entityValue: this.createNewEntityValue(),
      newEntityValues: this.form.get('newEntityValues').value,
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private getAspectModelUrnFromName(name: string): string {
    const nameSpace = this.editorModelService.getAspectModelUrn();
    return `${nameSpace}${name}`;
  }

  private createNewEntityValue(): DefaultEntityValue {
    const entityValue = DefaultEntityValue.createInstance();

    entityValue.name = this.entityValueName.value;
    entityValue.aspectModelUrn = this.getAspectModelUrnFromName(this.entityValueName.value);
    entityValue.entity = this.entity;

    this.entity.allProperties.forEach(data => {
      const value = this.form.get('properties').get(data.property.name).value;
      entityValue.addProperty(data, value);
    });

    entityValue.addParent(this.enumeration);
    return entityValue;
  }

  isEntityValueNameAlreadyUsed(entityValueName: string): boolean {
    return this.complexValues.some(value => value.name === entityValueName);
  }
}
