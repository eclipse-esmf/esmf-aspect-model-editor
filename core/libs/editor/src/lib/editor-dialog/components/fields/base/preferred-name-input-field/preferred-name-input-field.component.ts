/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement, CanExtend, DefaultCharacteristic, DefaultProperty} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-preferred-name-input-field',
  templateUrl: './preferred-name-input-field.component.html',
})
export class PreferredNameInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'preferredName';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setPreferredNameNameControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined()) {
      return this.metaModelElement?.getPreferredName(locale) || '';
    }

    if (this.metaModelElement instanceof CanExtend) {
      return (
        this.previousData?.[key] ||
        this.metaModelElement?.getPreferredName(locale) ||
        this.metaModelElement.extendedPreferredName?.get(locale) ||
        ''
      );
    }

    return this.previousData?.[key] || this.metaModelElement?.getPreferredName(locale) || '';
  }

  isInherited(locale: string): boolean {
    const control = this.parentForm.get(this.fieldName + locale);
    return (
      this.metaModelElement instanceof CanExtend &&
      this.metaModelElement.extendedPreferredName?.get(locale) &&
      control.value === this.metaModelElement.extendedPreferredName?.get(locale)
    );
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extendedElement;
  }

  private setPreferredNameNameControls() {
    const allLocalesPreferredNames = this.metaModelElement?.getAllLocalesPreferredNames();

    if (!allLocalesPreferredNames.length) {
      this.metaModelElement.addPreferredName('en', '');
    }

    this.metaModelElement?.getAllLocalesPreferredNames()?.forEach(locale => {
      const key = `preferredName${locale}`;
      const control = this.parentForm.get(key);
      const previousDisabled = control?.disabled;
      const isNowPredefined = (this.metaModelElement as DefaultCharacteristic)?.isPredefined?.();

      if (previousDisabled && !isNowPredefined) {
        control?.patchValue(this.getCurrentValue(key, locale));
      }

      this.removePreferredNameControl(locale);

      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference() || this.isDisabled(),
        })
      );
    });
  }

  private removePreferredNameControl(locale: string): void {
    this.parentForm.removeControl(`preferredName${locale}`);
  }
}
