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

import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultUnit} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-code-input-field',
  templateUrl: './code-input-field.component.html',
})
export class CodeInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.initCodeForm());
  }

  initCodeForm() {
    this.parentForm.setControl(
      'code',
      new FormControl({
        value: this.metaModelElement?.code,
        disabled: this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );
  }
}
