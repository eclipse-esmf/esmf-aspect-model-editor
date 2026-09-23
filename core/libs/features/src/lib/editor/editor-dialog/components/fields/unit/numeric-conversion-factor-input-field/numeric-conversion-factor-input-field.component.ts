/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultUnit} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-numeric-conversion-factor-input-field',
  templateUrl: './numeric-conversion-factor-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput],
})
export class NumericConversionFactorInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  private readonly model = signal<number | null>(null);
  private unregisterField = () => undefined;

  readonly field = form(this.model, path =>
    disabled(path, {
      when: () =>
        !!this.metaModelElement && (this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement)),
    }),
  );

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initConversionFactorForm());
  }

  initConversionFactorForm() {
    this.model.set(this.metaModelElement?.numericConversionFactor ?? null);
    this.unregisterField = this.signalForm().register('numericConversionFactor', this.field);
  }

  ngOnDestroy(): void {
    this.unregisterField();
    super.ngOnDestroy();
  }
}
