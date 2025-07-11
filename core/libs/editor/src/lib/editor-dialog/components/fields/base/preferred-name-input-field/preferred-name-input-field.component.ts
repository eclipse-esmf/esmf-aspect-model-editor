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

import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultCharacteristic, DefaultProperty, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-preferred-name-input-field',
  templateUrl: './preferred-name-input-field.component.html',
})
export class PreferredNameInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit {
  public fieldName = 'preferredName';

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setPreferredNameNameControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return this.metaModelElement?.getPreferredName(locale) || '';
    }

    if (this.metaModelElement instanceof HasExtends) {
      return (
        this.previousData?.[key] ||
        this.metaModelElement?.getPreferredName(locale) ||
        this.metaModelElement.extends_.preferredNames?.get(locale) ||
        ''
      );
    }

    return this.previousData?.[key] || this.metaModelElement?.getPreferredName(locale) || '';
  }

  isInherited(locale: string): boolean {
    const control = this.parentForm.get(this.fieldName + locale);
    return (
      this.metaModelElement instanceof HasExtends &&
      this.metaModelElement.extends_?.preferredNames?.get(locale) &&
      control.value === this.metaModelElement.extends_?.preferredNames?.get(locale)
    );
  }

  getPreferredNamesLocales(): string[] {
    return Array.from(this.metaModelElement?.preferredNames?.keys());
  }

  getDescriptionsLocales(): string[] {
    return Array.from(this.metaModelElement?.preferredNames?.keys());
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setPreferredNameNameControls() {
    const allLocalesPreferredNames = Array.from(this.metaModelElement?.preferredNames?.keys());

    if (!allLocalesPreferredNames.length) {
      this.metaModelElement.preferredNames.set('en', '');
    }

    Array.from(this.metaModelElement?.preferredNames?.keys())?.forEach(locale => {
      const key = `preferredName${locale}`;
      const control = this.parentForm.get(key);
      const previousDisabled = control?.disabled;
      const isNowPredefined = this.metaModelElement?.isPredefined;

      if (previousDisabled && !isNowPredefined) {
        control?.patchValue(this.getCurrentValue(key, locale));
      }

      this.removePreferredNameControl(locale);

      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale),
          disabled:
            this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
        }),
      );
    });
  }

  private removePreferredNameControl(locale: string): void {
    this.parentForm.removeControl(`preferredName${locale}`);
  }
}
