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

import {Component, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required, validate, validateAsync} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultUnit,
  DefaultValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-name-input-field',
  templateUrl: './name-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput, MatError, TranslocoDirective],
})
export class NameInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  private readonly editorDialogValidators = inject(EditorDialogValidators);
  private readonly model = signal('');
  private readonly disabledState = signal(false);
  private unregisterField = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement && !this.metaModelElement?.isAnonymous?.()
          ? this.editorDialogValidators.duplicateNameValue(params, this.metaModelElement)
          : of(null),
    });

  readonly field = form(this.model, path => {
    required(path);
    validate(path, ({value}) => {
      const name = value();
      if (!name || this.isDisabled() || this.metaModelElement instanceof DefaultUnit || this.metaModelElement?.isAnonymous?.()) return null;
      if ([DefaultEntityInstance, DefaultValue].some(type => this.metaModelElement instanceof type)) {
        return name.includes(' ') ? {kind: 'whitespace', message: 'Name must not contain whitespace'} : null;
      }
      const valid = this.isUpperCaseName() ? this.isUpperCase(name) : this.isLowerCase(name);
      return valid
        ? null
        : {
            kind: this.isUpperCaseName() ? 'namingUpperCase' : 'namingLowerCase',
            message: 'Name has an invalid casing',
          };
    });
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result && Object.keys(result)[0];
        return kind ? {kind, message: 'Name is already defined'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Name could not be validated'}),
    });
    disabled(path, {when: this.disabledState});
  });

  public fieldName = 'name';

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setNameControl());
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }

  public isDisabled() {
    return (
      (this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.getExtends()) ||
      Boolean(this.metaModelElement?.isAnonymous?.())
    );
  }

  private setNameControl() {
    if (!this.metaModelElement) {
      return;
    }
    this.disabledState.set(
      this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
    );
    const currentValue = this.getCurrentValue('name');
    this.model.set(currentValue);
    this.field().value.set(currentValue);
    this.unregisterField = this.signalForm().register('name', this.field);
    this.field().markAsTouched();
  }

  private isUpperCaseName(): boolean {
    return (
      this.metaModelElement instanceof DefaultAspect ||
      this.metaModelElement instanceof DefaultEntity ||
      (this.metaModelElement instanceof DefaultEntity && this.metaModelElement.isAbstractEntity()) ||
      this.metaModelElement instanceof DefaultConstraint ||
      this.metaModelElement instanceof DefaultCharacteristic ||
      this.metaModelElement instanceof DefaultValue
    );
  }
}
