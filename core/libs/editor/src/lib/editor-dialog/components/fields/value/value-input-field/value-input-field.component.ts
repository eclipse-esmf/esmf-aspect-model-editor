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

import {ValueTypeResolution, ValueTypeResolverService} from '@ame/domain';
import {Component, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {form, FormField, required, validate} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultScalar, DefaultValue} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-value-input-field',
  templateUrl: './value-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, MatError, FormField, MatInput, TranslocoDirective],
})
export class ValueInputFieldComponent extends InputFieldComponent<DefaultValue> implements OnInit, OnDestroy {
  private valueTypeResolver = inject(ValueTypeResolverService);
  private readonly model = signal('');
  private readonly resolution = signal<ValueTypeResolution | null>(null);
  private unregisterField = () => undefined;
  private initialized = false;
  private currentElementUrn: string | null = null;

  readonly field = form(this.model, path => {
    required(path);
    validate(path, ({value}) => {
      const currentRes = this.resolution();
      if (!currentRes) {
        return null;
      }
      return this.valueTypeResolver.validateValue(value(), currentRes);
    });
  });

  constructor() {
    super();
    effect(() => {
      const type = this.signalForm()?.get<DefaultScalar>('type');
      if (this.metaModelElement) {
        if (type !== undefined) {
          this.metaModelElement.type = type;
        }
        const res = this.valueTypeResolver.resolveValueType(this.metaModelElement);
        this.resolution.set(res);
        if (this.initialized) {
          this.field().markAsTouched();
        }
      }
    });
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  initForm() {
    if (this.metaModelElement) {
      const formType = this.signalForm()?.get<DefaultScalar>('type');
      if (formType !== undefined) {
        this.metaModelElement.type = formType;
      }
      const res = this.valueTypeResolver.resolveValueType(this.metaModelElement);
      this.resolution.set(res);
    }

    const isNewElement = this.metaModelElement?.aspectModelUrn !== this.currentElementUrn;
    if (!this.initialized || isNewElement) {
      this.currentElementUrn = this.metaModelElement?.aspectModelUrn || null;
      this.model.set(this.metaModelElement?.value || '');
      if (!this.initialized) {
        this.unregisterField = this.signalForm().register('value', this.field);
        this.initialized = true;
      }
    }
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

  getValidationError(): string | null {
    const error = this.field()
      .errors()
      .find(e => e.kind !== 'required');
    return error ? (error.message as string) : null;
  }
}
