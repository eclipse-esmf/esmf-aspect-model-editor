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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultValue} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-value-input-field',
  templateUrl: './value-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, ReactiveFormsModule, MatInput, TranslatePipe],
})
export class ValueInputFieldComponent extends InputFieldComponent<DefaultValue> implements OnInit {
  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  initForm() {
    this.parentForm.setControl(
      'value',
      new FormControl({value: this.metaModelElement?.value || '', disabled: false}, {validators: [Validators.required]}),
    );
  }
}
