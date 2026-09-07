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
import {RdfModelUtil} from '@ame/rdf/utils';
import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required} from '@angular/forms/signals';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultLocaleConstraint} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import * as locale from 'locale-codes';
import {InputFieldComponent} from '../../input-field.component';

import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'ame-locale-code-input-field',
  templateUrl: './locale-code-input-field.component.html',
  styles: [
    `
      ::ng-deep {
        .language-code .mat-option-text {
          line-height: 1 !important;
        }
      }
    `,
  ],
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    FormField,
    MatAutocompleteTrigger,
    MatInput,
    MatAutocomplete,
    MatOption,
    MatError,
    TranslocoDirective,
  ],
})
export class LocaleCodeInputFieldComponent extends InputFieldComponent<DefaultLocaleConstraint> implements OnInit, OnDestroy {
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => {
    required(path);
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)});
  });
  readonly filteredLanguages = computed<Array<locale.ILocale>>(() => {
    const enteredLang = this.model().toLowerCase();
    return enteredLang
      ? locale.all.filter(
          lang => lang.location != null && (lang.tag.toLowerCase().includes(enteredLang) || lang.name.toLowerCase().includes(enteredLang)),
        )
      : [];
  });

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'localeCode';
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
    this.model.set(RdfModelUtil.getValueWithoutUrnDefinition(this.getCurrentValue(this.fieldName)));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }

  hasError(kind: string): boolean {
    return this.field()
      .errors()
      .some(error => error.kind === kind);
  }
}
