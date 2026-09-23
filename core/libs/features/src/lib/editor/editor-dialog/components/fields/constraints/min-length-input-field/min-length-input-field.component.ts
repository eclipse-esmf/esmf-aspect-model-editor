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
import {disabled, form, FormField, validate} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultLengthConstraint} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-min-length-input-field',
  templateUrl: './min-length-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput, MatError, TranslocoDirective],
})
export class MinLengthInputFieldComponent extends InputFieldComponent<DefaultLengthConstraint> implements OnInit, OnDestroy {
  private readonly model = signal<number | string | null>(null);
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => {
    validate(path, ({value}) => {
      const length = value();
      if (length === null || length === undefined || length === '') {
        return null;
      }
      if (typeof length === 'number') {
        return Number.isInteger(length) && length >= 0 ? null : {kind: 'pattern', message: 'Please provide a non-negative integer'};
      }
      if (typeof length === 'string') {
        const trimmed = length.trim();
        return trimmed === '' || /^\d+$/.test(trimmed) ? null : {kind: 'pattern', message: 'Please provide a non-negative integer'};
      }
      return {kind: 'pattern', message: 'Please provide a non-negative integer'};
    });
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)});
  });

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'minValue';
  }

  getCurrentValue(key: string) {
    return this.previousData()[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initForm();
      });
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  initForm() {
    const value = this.getCurrentValue(this.fieldName);
    this.model.set(value === '' || value === null || value === undefined ? null : Number(value));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }
}
