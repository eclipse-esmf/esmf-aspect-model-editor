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
import {config} from '@ame/shared';
import {NgClass} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultProperty, Value} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {EditorModelService} from '../../../editor-model.service';
import {EditorDialogValidators} from '../../../validators';
import {EntityInstanceModalTableComponent} from '../entity-instance-modal-table/entity-instance-modal-table.component';
import {EntityInstanceUtil} from '../utils/EntityInstanceUtil';

export interface NewEntityInstanceDialogOptions {
  metaModel: DefaultEnumeration | DefaultEntityInstance;
  dataType: DefaultEntity;
  complexValues: DefaultEntity[];
}

@Component({
  templateUrl: './entity-instance-modal.component.html',
  styleUrls: ['./entity-instance-modal.component.scss'],
  imports: [
    MatDialogTitle,
    MatIconModule,
    MatIconButton,
    MatFormField,
    MatDialogContent,
    MatLabel,
    ReactiveFormsModule,
    NgClass,
    MatInput,
    MatError,
    MatButton,
    TranslatePipe,
    EntityInstanceModalTableComponent,
    MatDialogActions,
    FormsModule,
  ],
})
export class EntityInstanceModalComponent {
  private dialogRef = inject(MatDialogRef<EntityInstanceModalComponent>);
  private editorModelService = inject(EditorModelService);
  private loadedFilesService = inject(LoadedFilesService);

  public data: NewEntityInstanceDialogOptions = inject(MAT_DIALOG_DATA);

  public title: string;

  public form: FormGroup;
  public entityValueName: FormControl;

  public entity: DefaultEntity;
  public entityValue: DefaultEntityInstance;
  public enumeration: DefaultEnumeration;
  public complexValues: DefaultEntity[] = []; // already existing complex values

  readonly addTitle = 'Add new entity instance';

  get propertiesForm(): FormGroup {
    return this.form?.get('properties') as FormGroup;
  }

  constructor() {
    this.complexValues = this.data.complexValues;
    this.enumeration = this.data.metaModel as DefaultEnumeration;
    this.entity = this.data.dataType;
    this.title = this.addTitle;
    this.entityValueName = new FormControl('', [
      Validators.required,
      EditorDialogValidators.noWhiteSpace,
      EditorDialogValidators.duplicateNameString(
        this.loadedFilesService.currentLoadedFile.cachedFile,
        this.entity.aspectModelUrn.split('#')[0],
      ),
    ]);
    this.buildForm();
  }

  private buildForm(): void {
    this.form = new FormGroup({
      entityValueName: this.entityValueName,
      properties: new FormGroup({}),
      newEntityValues: new FormControl([]),
    });

    this.entity.properties.forEach((element: DefaultProperty) => this.propertiesForm.setControl(element.name, new FormArray([])));
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

  private createNewEntityValue(): DefaultEntityInstance {
    const entityValue = new DefaultEntityInstance({
      name: this.entityValueName.value,
      aspectModelUrn: this.getAspectModelUrnFromName(this.entityValueName.value),
      metaModelVersion: config.currentSammVersion,
      type: this.entity,
    });

    entityValue.addParent(this.enumeration);

    const propertiesForm = this.form.get('properties');

    this.entity.properties.forEach(propertyElement => {
      const propertyArray = propertiesForm.get(propertyElement.name) as FormArray;

      if (EntityInstanceUtil.isDefaultPropertyWithLangString(propertyElement)) {
        propertyArray.controls.forEach(control => {
          const value = control.get('value').value;
          const language = control.get('language').value;
          entityValue.setAssertion(propertyElement.aspectModelUrn, new Value(value, propertyElement.characteristic?.dataType, language));
        });
      } else if (propertyElement.characteristic?.dataType instanceof DefaultEntity) {
        const value = propertyArray.at(0).get('value').value;
        const entityInstance = new DefaultEntityInstance({
          name: value,
          aspectModelUrn: this.getAspectModelUrnFromName(value),
          metaModelVersion: config.currentSammVersion,
          type: propertyElement.characteristic?.dataType as DefaultEntity,
        });
        entityValue.setAssertion(propertyElement.aspectModelUrn, entityInstance);
      } else {
        const value = propertyArray.at(0).get('value').value;
        entityValue.setAssertion(propertyElement.aspectModelUrn, new Value(value, propertyElement.characteristic?.dataType));
      }
    });

    return entityValue;
  }

  isEntityValueNameAlreadyUsed(entityValueName: string): boolean {
    return this.complexValues.some(value => value.name === entityValueName);
  }
}
