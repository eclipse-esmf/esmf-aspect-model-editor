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
import {disabled, form, FormField, required, validate} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultFixedPointConstraint} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-integer-input-field',
  templateUrl: './integer-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [MatFormFieldModule, MatLabel, MatError, MatInput, FormField, TranslocoDirective],
})
export class IntegerInputFieldComponent extends InputFieldComponent<DefaultFixedPointConstraint> implements OnInit, OnDestroy {
  private readonly model = signal<number | string | null>(null);
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => {
    required(path);
    validate(path, ({value}) => {
      const integer = value();
      if (integer === null || integer === undefined || integer === '') {
        return null;
      }
      if (typeof integer === 'number') {
        return Number.isInteger(integer) && integer > 0 ? null : {kind: 'pattern', message: 'Please provide a positive integer'};
      }
      if (typeof integer === 'string') {
        const trimmed = integer.trim();
        return trimmed === '' || /^[1-9]\d*$/.test(trimmed) ? null : {kind: 'pattern', message: 'Please provide a positive integer'};
      }
      return {kind: 'pattern', message: 'Please provide a positive integer'};
    });
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)});
  });

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'integer';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initForm();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unregisterField();
  }

  initForm() {
    const currentValue = this.getCurrentValue(this.fieldName);
    this.model.set(currentValue === '' ? null : Number(currentValue));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }
}
