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
import {form, FormField, required} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultValue} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-value-input-field',
  templateUrl: './value-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput, TranslocoDirective],
})
export class ValueInputFieldComponent extends InputFieldComponent<DefaultValue> implements OnInit, OnDestroy {
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => required(path));

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  initForm() {
    this.model.set(this.metaModelElement?.value || '');
    this.unregisterField = this.signalForm().register('value', this.field);
  }

  ngOnDestroy(): void {
    this.unregisterField();
    super.ngOnDestroy();
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }
}
