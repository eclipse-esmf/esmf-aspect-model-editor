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
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-description-input-field',
  templateUrl: './description-input-field.component.html',
  styles: [
    `
      textarea {
        line-height: 1.35;
      }
    `,
  ],
})
export class DescriptionInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super();
    this.fieldName = 'description';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.setDescriptionControls();
    });
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return this.metaModelElement?.[key] || '';
    }

    if (this.metaModelElement['extends_']) {
      return (
        this.previousData?.[key] ||
        this.metaModelElement?.getDescription(locale) ||
        this.metaModelElement['extends_']?.getDescription(locale) ||
        ''
      );
    }

    return this.previousData?.[key] || this.metaModelElement?.getDescription(locale) || '';
  }

  isInherited(locale: string): boolean {
    const control = this.parentForm.get('description' + locale);
    const extending = this.metaModelElement as HasExtends;
    return (
      extending.extends_ &&
      extending.getExtends()?.getDescription(locale) &&
      control.value === extending.getExtends()?.getDescription(locale)
    );
  }

  getPreferredNamesLocales(): string[] {
    return Array.from(this.metaModelElement?.preferredNames?.keys());
  }

  getDescriptionsLocales(): string[] {
    return Array.from(this.metaModelElement?.descriptions?.keys());
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setDescriptionControls() {
    const allLocalesDescriptions = [...this.metaModelElement.descriptions.keys()];

    if (!allLocalesDescriptions.length) {
      this.metaModelElement.descriptions.set('en', '');
    }

    [...this.metaModelElement.descriptions.keys()].forEach(locale => {
      const key = `description${locale}`;

      const control = this.parentForm.get(key);
      const previousDisabled = control?.disabled;
      const isNowPredefined = (this.metaModelElement as DefaultCharacteristic)?.isPredefined;

      if (previousDisabled && !isNowPredefined) {
        control?.patchValue(this.getCurrentValue(key, locale));
      }

      this.removeDescriptionControl(locale);
      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale) || this.metaModelElement?.getDescription(locale),
          disabled:
            this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
        }),
      );
    });
  }

  private removeDescriptionControl(locale: string): void {
    this.parentForm.removeControl(`description${locale}`);
  }
}
