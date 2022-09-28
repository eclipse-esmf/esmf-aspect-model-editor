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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {map, Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {Characteristic, DefaultCharacteristic, DefaultEither} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@ame/cache';
import {EditorDialogValidators} from '../../../../validators';
import {NotificationsService, SearchService} from '@ame/shared';
import {RdfService} from '@ame/rdf/services';
import {MxGraphService} from '@ame/mx-graph';

@Component({
  selector: 'ame-left-input-field',
  templateUrl: './left-input-field.component.html',
})
export class LeftInputFieldComponent extends InputFieldComponent<DefaultEither> implements OnInit, OnDestroy {
  filteredCharacteristicTypes$: Observable<any[]>;

  leftControl: FormControl;
  leftCharacteristicControl: FormControl;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private notificationsService: NotificationsService,
    public rdfService: RdfService,
    public searchService?: SearchService,
    public mxGraphService?: MxGraphService
  ) {
    super(metaModelDialogService, namespacesCacheService, searchService, mxGraphService);
    this.fieldName = 'leftCharacteristic';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setLeftControl());
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
          disabled: !!value || this.metaModelElement.isExternalReference(),
        },
        {
          validators: [
            Validators.required,
            EditorDialogValidators.disabled,
            EditorDialogValidators.duplicateNameWithDifferentType(
              this.namespacesCacheService,
              this.metaModelElement,
              this.rdfService.externalRdfModels,
              DefaultCharacteristic
            ),
          ],
        }
      )
    );

    this.parentForm.setControl(
      'leftCharacteristic',
      new FormControl({
        value: eitherLeft,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    this.leftControl = this.parentForm.get('left') as FormControl;
    this.leftCharacteristicControl = this.parentForm.get('leftCharacteristic') as FormControl;

    this.filteredCharacteristicTypes$ = this.initFilteredCharacteristicTypes(this.leftControl, this.metaModelElement.aspectModelUrn).pipe(
      map(charList => charList.filter(char => char.urn !== this.parentForm.get('rightCharacteristic')?.value?.aspectModelUrn))
    );
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'left') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let defaultCharacteristic = this.currentCachedFile
      .getCachedCharacteristics()
      .find(characteristic => characteristic.aspectModelUrn === newValue.urn);

    if (!defaultCharacteristic) {
      defaultCharacteristic = this.namespacesCacheService.findElementOnExtReference<Characteristic>(newValue.urn);
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

    const newCharacteristic = new DefaultCharacteristic(this.metaModelElement.metaModelVersion, urn, characteristicName, null);
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
