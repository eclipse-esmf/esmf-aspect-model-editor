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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultEntity, DefaultState} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-default-value-input-field',
  templateUrl: './default-value-input-field.component.html',
})
export class DefaultValueInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  constructor() {
    super();
    this.fieldName = 'defaultValue';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    const defaultValue = this.getCurrentValue(this.fieldName);
    const defaultValueString = typeof defaultValue === 'string' ? defaultValue : defaultValue?.name;

    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: defaultValueString || this.metaModelElement.defaultValue,
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        Validators.required,
      ),
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity').valueChanges.subscribe(dataType => {
        if (dataType instanceof DefaultEntity) {
          this.parentForm.get(this.fieldName).patchValue('');
        }
      }),
    );
  }
}
