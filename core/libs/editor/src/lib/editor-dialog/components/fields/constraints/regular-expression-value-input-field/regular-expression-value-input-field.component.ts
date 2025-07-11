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
import {DefaultRegularExpressionConstraint} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-regular-expression-value-input-field',
  templateUrl: './regular-expression-value-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class RegularExpressionValueInputFieldComponent
  extends InputFieldComponent<DefaultRegularExpressionConstraint>
  implements OnInit, OnDestroy
{
  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'value';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: this.getCurrentValue(this.fieldName),
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        Validators.required,
      ),
    );
  }
}
