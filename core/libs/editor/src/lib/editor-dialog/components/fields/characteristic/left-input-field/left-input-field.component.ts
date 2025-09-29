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

import {CacheUtils} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService} from '@ame/shared';
import {AsyncPipe} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Characteristic, DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {map, Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-left-input-field',
  templateUrl: './left-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    MatIconModule,
    MatIconButton,
    AsyncPipe,
    MatAutocomplete,
    MatOption,
    MatError,
  ],
})
export class LeftInputFieldComponent extends InputFieldComponent<DefaultEither> implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private validators = inject(EditorDialogValidators);
  public rdfService = inject(RdfService);

  filteredCharacteristicTypes$: Observable<any[]>;

  leftControl: FormControl;
  leftCharacteristicControl: FormControl;

  constructor() {
    super();
    this.fieldName = 'leftCharacteristic';
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setLeftControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('left');
    this.parentForm.removeControl('leftCharacteristic');
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.left || null;
  }

  setLeftControl() {
    const eitherLeft = this.getCurrentValue();
    const value = eitherLeft?.name || '';

    this.parentForm.setControl(
      'left',
      new FormControl(
        {
          value,
          disabled: !!value || this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        {
          validators: [
            Validators.required,
            EditorDialogValidators.disabled,
            this.validators.duplicateNameWithDifferentType(this.metaModelElement, DefaultCharacteristic),
          ],
        },
      ),
    );

    this.parentForm.setControl(
      'leftCharacteristic',
      new FormControl({
        value: eitherLeft,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    this.leftControl = this.parentForm.get('left') as FormControl;
    this.leftCharacteristicControl = this.parentForm.get('leftCharacteristic') as FormControl;

    this.filteredCharacteristicTypes$ = this.initFilteredCharacteristicTypes(this.leftControl, this.metaModelElement.aspectModelUrn).pipe(
      map(charList => charList.filter(char => char.urn !== this.parentForm.get('rightCharacteristic')?.value?.aspectModelUrn)),
    );
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'left') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let defaultCharacteristic = CacheUtils.getCachedElements(this.currentCachedFile, DefaultCharacteristic).find(
      characteristic => characteristic.aspectModelUrn === newValue.urn,
    );

    if (!defaultCharacteristic) {
      defaultCharacteristic = this.loadedFiles.findElementOnExtReferences<Characteristic>(newValue.urn);
    }

    this.parentForm.setControl('leftCharacteristic', new FormControl(defaultCharacteristic));

    this.leftControl.patchValue(newValue.name);
    this.leftCharacteristicControl.setValue(defaultCharacteristic);
    this.leftControl.disable();
  }

  createNewCharacteristic(characteristicName: string) {
    if (!this.isUpperCase(characteristicName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${characteristicName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === characteristicName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.leftControl.setValue('');
      return;
    }

    if (characteristicName === this.parentForm.get('rightCharacteristic')?.value?.name) {
      this.notificationsService.error({title: 'Element left cannot point to the same characteristic as the right element.'});
      this.leftControl.setValue('');
      return;
    }

    const newCharacteristic = new DefaultCharacteristic({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: characteristicName,
      dataType: null,
    });
    this.parentForm.setControl('leftCharacteristic', new FormControl(newCharacteristic));

    this.leftControl.patchValue(characteristicName);
    this.leftCharacteristicControl.setValue(newCharacteristic);
    this.leftControl.disable();
  }

  unlockLeft() {
    this.leftControl.enable();
    this.leftControl.patchValue('');
    this.leftCharacteristicControl.patchValue('');
    this.parentForm.setControl('leftCharacteristic', new FormControl(null));
    this.leftCharacteristicControl.markAllAsTouched();
  }
}
