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
import {disabled, form, FormField, required} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultRegularExpressionConstraint} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-regular-expression-value-input-field',
  templateUrl: './regular-expression-value-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [FormField, MatFormFieldModule, MatLabel, MatError, MatInput, TranslocoDirective],
})
export class RegularExpressionValueInputFieldComponent
  extends InputFieldComponent<DefaultRegularExpressionConstraint>
  implements OnInit, OnDestroy
{
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => {
    required(path);
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)});
  });

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'value';
  }

  getCurrentValue(key: string) {
    return this.previousData()[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unregisterField();
  }

  initForm() {
    this.model.set(this.getCurrentValue(this.fieldName));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }
}
