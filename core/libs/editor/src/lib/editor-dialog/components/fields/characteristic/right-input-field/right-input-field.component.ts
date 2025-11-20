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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {Characteristic, DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {map, Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-right-input-field',
  templateUrl: './right-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    MatIconModule,
    MatAutocomplete,
    MatIconButton,
    AsyncPipe,
    MatOption,
    MatError,
  ],
})
export class RightInputFieldComponent extends InputFieldComponent<DefaultEither> implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private validators = inject(EditorDialogValidators);
  public rdfService = inject(RdfService);

  filteredCharacteristicTypes$: Observable<any[]>;

  rightControl: FormControl;
  rightCharacteristicControl: FormControl;

  constructor() {
    super();
    this.fieldName = 'rightCharacteristic';
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.right || null;
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setRightControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('right');
    this.parentForm.removeControl('rightCharacteristic');
  }

  setRightControl() {
    const eitherRight = this.getCurrentValue();
    const value = eitherRight?.name || '';

    this.parentForm.setControl(
      'right',
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
      'rightCharacteristic',
      new FormControl({
        value: eitherRight,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    this.rightControl = this.parentForm.get('right') as FormControl;
    this.rightCharacteristicControl = this.parentForm.get('rightCharacteristic') as FormControl;

    this.filteredCharacteristicTypes$ = this.initFilteredCharacteristicTypes(this.rightControl, this.metaModelElement.aspectModelUrn).pipe(
      map(charList => charList.filter(char => char.urn !== this.parentForm.get('leftCharacteristic')?.value?.aspectModelUrn)),
    );
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'right') {
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

    this.parentForm.setControl('rightCharacteristic', new FormControl(defaultCharacteristic));

    this.rightControl.patchValue(newValue.name);
    this.rightCharacteristicControl.setValue(defaultCharacteristic);
    this.rightControl.disable();
  }

  createNewCharacteristic(characteristicName: string) {
    if (!this.isUpperCase(characteristicName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${characteristicName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === characteristicName) {
      this.notificationsService.error({title: 'Element right cannot link itself'});
      this.rightControl.setValue('');
      return;
    }

    if (characteristicName === this.parentForm.get('leftCharacteristic')?.value?.name) {
      this.notificationsService.error({title: 'Element right cannot point to the same characteristic as the left element.'});
      this.rightControl.setValue('');
      return;
    }

    const newCharacteristic = new DefaultCharacteristic({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: characteristicName,
    });
    this.parentForm.setControl('rightCharacteristic', new FormControl(newCharacteristic));

    this.rightControl.patchValue(characteristicName);
    this.rightCharacteristicControl.setValue(newCharacteristic);
    this.rightControl.disable();
  }

  unlockRight() {
    this.rightControl.enable();
    this.rightControl.patchValue('');
    this.rightCharacteristicControl.patchValue('');
    this.parentForm.setControl('rightCharacteristic', new FormControl(null));
    this.rightCharacteristicControl.markAllAsTouched();
  }
}
