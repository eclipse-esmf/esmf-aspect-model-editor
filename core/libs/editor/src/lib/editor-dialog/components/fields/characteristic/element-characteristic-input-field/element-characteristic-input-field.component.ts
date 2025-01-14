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
import {FormControl} from '@angular/forms';
import {Characteristic, DefaultCharacteristic, DefaultCollection} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-element-characteristic-input-field',
  templateUrl: './element-characteristic-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class ElementCharacteristicInputFieldComponent extends InputFieldComponent<DefaultCollection> implements OnInit, OnDestroy {
  filteredCharacteristicTypes$: Observable<any[]>;

  elementCharacteristicDisplayControl: FormControl;
  elementCharacteristicControl: FormControl;
  isDisabled = false;

  constructor(
    private notificationsService: NotificationsService,
    public rdfService: RdfService,
    private validators: EditorDialogValidators,
  ) {
    super();
    this.fieldName = 'elementCharacteristic';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.setElementCharacteristicControl();
    });

    this.enableWhenEmpty(() => this.elementCharacteristicDisplayControl, 'dataTypeEntity');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('elementCharacteristicDisplay');
    this.parentForm.removeControl('elementCharacteristic');
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.elementCharacteristic || null;
  }

  setElementCharacteristicControl() {
    const elementCharacteristic = this.getCurrentValue();
    const value = elementCharacteristic?.name || '';

    this.parentForm.setControl(
      'elementCharacteristicDisplay',
      new FormControl(
        {
          value,
          disabled: !!value || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled,
        },
        [this.validators.duplicateNameWithDifferentType(this.metaModelElement, DefaultCharacteristic)],
      ),
    );
    this.getControl('elementCharacteristicDisplay').markAsTouched();
    this.parentForm.setControl(
      'elementCharacteristic',
      new FormControl({
        value: elementCharacteristic,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled,
      }),
    );

    this.elementCharacteristicDisplayControl = this.parentForm.get('elementCharacteristicDisplay') as FormControl;
    this.elementCharacteristicControl = this.parentForm.get('elementCharacteristic') as FormControl;

    this.filteredCharacteristicTypes$ = this.initFilteredCharacteristicTypes(
      this.elementCharacteristicDisplayControl,
      this.metaModelElement.aspectModelUrn,
    );
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'elementCharacteristicDisplay') {
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

    this.parentForm.get('elementCharacteristic').setValue(defaultCharacteristic);

    this.elementCharacteristicDisplayControl.patchValue(newValue.name);
    this.elementCharacteristicControl.setValue(defaultCharacteristic);
    this.elementCharacteristicDisplayControl.disable();
  }

  createNewCharacteristic(characteristicName: string) {
    if (!this.isUpperCase(characteristicName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${characteristicName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === characteristicName) {
      this.notificationsService.error({title: 'Element characteristic cannot link itself.'});
      this.elementCharacteristicDisplayControl.setValue('');
      return;
    }

    const newCharacteristic = new DefaultCharacteristic({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: characteristicName,
    });
    this.parentForm.get('elementCharacteristic').setValue(newCharacteristic);

    this.elementCharacteristicDisplayControl.patchValue(characteristicName);
    this.elementCharacteristicControl.setValue(newCharacteristic);
    this.elementCharacteristicDisplayControl.disable();
  }

  unlockElementCharacteristic() {
    this.elementCharacteristicDisplayControl.enable();
    this.elementCharacteristicDisplayControl.patchValue('');
    this.elementCharacteristicControl.patchValue('');
    this.parentForm.get('elementCharacteristic').setValue(null);
    this.elementCharacteristicControl.markAllAsTouched();
  }
}
