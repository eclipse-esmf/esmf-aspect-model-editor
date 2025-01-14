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

import {simpleDataTypes} from '@ame/shared';
import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-example-value-input-field',
  templateUrl: './example-value-input-field.component.html',
})
export class ExampleValueInputFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit {
  public hasComplexDataType = false;
  public xsdBoolean = simpleDataTypes.boolean;

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  initForm() {
    this.hasComplexDataType = this.metaModelElement.characteristic?.dataType?.isComplexType();
    this.parentForm.setControl(
      'exampleValue',
      new FormControl({
        value: this.metaModelElement?.exampleValue || '',
        disabled:
          this.loadedFiles.isElementExtern(this.metaModelElement) ||
          this.hasComplexDataType ||
          this.metaModelElement.isPredefined ||
          this.isExtending(),
      }),
    );
  }

  private isExtending() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }
}
