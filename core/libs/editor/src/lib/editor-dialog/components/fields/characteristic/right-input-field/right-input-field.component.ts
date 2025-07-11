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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Characteristic, DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {Observable, map} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-right-input-field',
  templateUrl: './right-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class RightInputFieldComponent extends InputFieldComponent<DefaultEither> implements OnInit, OnDestroy {
  filteredCharacteristicTypes$: Observable<any[]>;

  rightControl: FormControl;
  rightCharacteristicControl: FormControl;

  constructor(
    private notificationsService: NotificationsService,
    public rdfService: RdfService,
    private validators: EditorDialogValidators,
  ) {
    super();
    this.fieldName = 'rightCharacteristic';
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.right || null;
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setRightControl());
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
