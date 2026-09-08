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
import {config} from '@ame/shared';
import {NgClass} from '@angular/common';
import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {form, FormField, required, validate} from '@angular/forms/signals';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, Value} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../../editor-model.service';
import {EntityInstanceModalTableComponent} from '../entity-instance-modal-table/entity-instance-modal-table.component';
import {EntityInstanceUtil} from '../utils/EntityInstanceUtil';

export interface NewEntityInstanceDialogOptions {
  metaModel: DefaultEnumeration | DefaultEntityInstance;
  dataType: DefaultEntity;
  complexValues: DefaultEntityInstance[];
}

export interface NewEntityInstanceDialogResult {
  entityValue: DefaultEntityInstance;
  newEntityValues: DefaultEntityInstance[];
}

@Component({
  templateUrl: './entity-instance-modal.component.html',
  styleUrls: ['./entity-instance-modal.component.scss'],
  imports: [
    MatDialogTitle,
    MatIconModule,
    MatIconButton,
    MatFormFieldModule,
    MatDialogContent,
    MatLabel,
    NgClass,
    MatInput,
    MatError,
    MatButton,
    TranslocoDirective,
    EntityInstanceModalTableComponent,
    MatDialogActions,
    FormField,
  ],
})
export class EntityInstanceModalComponent {
  private dialogRef = inject(MatDialogRef<EntityInstanceModalComponent>);
  private editorModelService = inject(EditorModelService);
  private loadedFilesService = inject(LoadedFilesService);
  private table = viewChild(EntityInstanceModalTableComponent);

  readonly data: NewEntityInstanceDialogOptions = inject(MAT_DIALOG_DATA);
  readonly title = signal('Add new entity instance');
  readonly entity = signal(this.data.dataType);
  readonly entityValue = signal<DefaultEntityInstance>(undefined);
  readonly enumeration = signal(this.data.metaModel as DefaultEnumeration);
  readonly complexValues = signal(this.data.complexValues || []);
  readonly entityValueNameModel = signal('');
  readonly entityValueName = form(this.entityValueNameModel, path => {
    required(path);
    validate(path, ({value}) => (value().includes(' ') ? {kind: 'whitespace', message: 'The name cannot contain whitespace'} : null));
    validate(path, ({value}) => {
      if (!value()) return null;
      const namespace = this.entity().aspectModelUrn.split('#')[0];
      return this.loadedFilesService.currentLoadedFile.cachedFile.get(`${namespace}#${value()}`)
        ? {kind: 'checkShapeName', message: 'The name is already used'}
        : null;
    });
    validate(path, ({value}) =>
      this.complexValues().some(entityValue => entityValue.name === value())
        ? {kind: 'nameAlreadyExists', message: 'The entity instance name is already used'}
        : null,
    );
  });
  readonly valid = computed(() => this.entityValueName().valid() && !!this.table()?.propertiesForm().valid());

  onSave(): void {
    const table = this.table();
    if (!this.valid() || !table) return;

    const result: NewEntityInstanceDialogResult = {
      entityValue: this.createNewEntityValue(),
      newEntityValues: table.newEntityValues(),
    };
    this.dialogRef.close(result);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  hasNameError(kind: string): boolean {
    return this.entityValueName()
      .errors()
      .some(error => error.kind === kind);
  }

  isEntityValueNameAlreadyUsed(entityValueName: string): boolean {
    return this.complexValues().some(value => value.name === entityValueName);
  }

  private getAspectModelUrnFromName(name: string): string {
    return `${this.editorModelService.getAspectModelUrn()}${name}`;
  }

  private createNewEntityValue(): DefaultEntityInstance {
    const table = this.table();
    const name = this.entityValueNameModel();
    const entityValue = new DefaultEntityInstance({
      name,
      aspectModelUrn: this.getAspectModelUrnFromName(name),
      metaModelVersion: config.currentSammVersion,
      type: this.entity(),
    });

    const properties = table.propertiesModel();

    for (const property of this.entity().properties.filter(property => !property.isAbstract)) {
      for (const row of properties[property.name] || []) {
        if (EntityInstanceUtil.isDefaultPropertyWithLangString(property)) {
          entityValue.setAssertion(property.aspectModelUrn, new Value(row.value, property.characteristic?.dataType, row.language));
        } else if (property.characteristic?.dataType instanceof DefaultEntity) {
          const nestedEntity =
            table.newEntityValues().find(value => value.name === row.value) ||
            new DefaultEntityInstance({
              name: String(row.value),
              aspectModelUrn: this.getAspectModelUrnFromName(String(row.value)),
              metaModelVersion: config.currentSammVersion,
              type: property.characteristic.dataType,
            });
          entityValue.setAssertion(property.aspectModelUrn, nestedEntity);
        } else {
          entityValue.setAssertion(property.aspectModelUrn, new Value(row.value, property.characteristic?.dataType));
        }
      }
    }

    return entityValue;
  }
}
