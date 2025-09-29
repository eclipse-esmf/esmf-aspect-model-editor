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
import {RdfModelUtil} from '@ame/rdf/utils';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {DefaultLocaleConstraint} from '@esmf/aspect-model-loader';
import * as locale from 'locale-codes';
import {Observable, of} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';

import {AsyncPipe} from '@angular/common';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';

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
  imports: [MatFormField, MatLabel, ReactiveFormsModule, MatAutocompleteTrigger, MatInput, MatAutocomplete, MatOption, AsyncPipe, MatError],
})
export class LocaleCodeInputFieldComponent extends InputFieldComponent<DefaultLocaleConstraint> implements OnInit, OnDestroy {
  public filteredLanguages: Observable<Array<locale.ILocale>>;

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'localeCode';
  }

  doFilterLanguages(enteredLang: string) {
    this.filteredLanguages = enteredLang
      ? of(
          locale.all.filter(
            lang =>
              lang.location != null &&
              (lang.tag.toLowerCase().includes(enteredLang.toLowerCase()) || lang.name.toLowerCase().includes(enteredLang.toLowerCase())),
          ),
        )
      : null;
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

    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: RdfModelUtil.getValueWithoutUrnDefinition(this.getCurrentValue(this.fieldName)),
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        Validators.required,
      ),
    );

    const localeCodeControl = this.parentForm.get(this.fieldName);
    this.formSubscription.add(
      localeCodeControl.valueChanges.subscribe(value => {
        this.doFilterLanguages(value);
      }),
    );
  }
}
