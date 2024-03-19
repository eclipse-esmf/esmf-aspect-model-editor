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

import {Component, Inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EditorModelService} from '../../../editor-model.service';
import {EditorDialogValidators} from '../../../validators';
import {
  DefaultAbstractProperty,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {NamespacesCacheService} from '@ame/cache';
import {isDataTypeLangString} from '@ame/shared';
import {EntityValueUtil} from '../utils/EntityValueUtil';

export interface NewEntityValueDialogOptions {
  metaModel: DefaultEnumeration | DefaultEntityValue;
  dataType: DefaultEntity;
  complexValues: DefaultEntity[];
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
  ) {
    this.complexValues = data.complexValues;
    this.enumeration = data.metaModel as DefaultEnumeration;
    this.entity = this.data.dataType;
    this.title = this.addTitle;
    this.entityValueName = new FormControl('', [
      Validators.required,
      EditorDialogValidators.noWhiteSpace,
      EditorDialogValidators.duplicateNameString(this.namespacesCacheService, this.entity.aspectModelUrn.split('#')[0]),
    ]);
    this.buildForm();
  }

  private buildForm(): void {
    this.form = new FormGroup({
      entityValueName: this.entityValueName,
      properties: new FormGroup({}),
      newEntityValues: new FormControl([]),
    });

    this.entity.allProperties.forEach((element: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>) =>
      this.propertiesForm.setControl(element.property.name, new FormArray([])),
    );
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
    entityValue.addParent(this.enumeration);

    const propertiesForm = this.form.get('properties');

    this.entity.allProperties.forEach(propertyElement => {
      const propertyArray = propertiesForm.get(propertyElement.property.name) as FormArray;

      if (EntityValueUtil.isDefaultPropertyWithLangString(propertyElement)) {
        propertyArray.controls.forEach(control => {
          const value = control.get('value').value;
          const language = control.get('language').value;
          entityValue.addProperty(propertyElement, value, language);
        });
      } else {
        const value = propertyArray.at(0).get('value').value;
        entityValue.addProperty(propertyElement, value);
      }
    });

    return entityValue;
  }

  isEntityValueNameAlreadyUsed(entityValueName: string): boolean {
    return this.complexValues.some(value => value.name === entityValueName);
  }
}
