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
import {BaseMetaModelElement, CanExtend, DefaultCharacteristic} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-description-input-field',
  templateUrl: './description-input-field.component.html',
})
export class DescriptionInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'description';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setDescriptionControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined()) {
      return this.metaModelElement?.[key] || '';
    }

    if (this.metaModelElement instanceof CanExtend) {
      return (
        this.previousData?.[key] ||
        this.metaModelElement?.getDescription(locale) ||
        this.metaModelElement.extendedDescription?.get(locale) ||
        ''
      );
    }

    return this.previousData?.[key] || this.metaModelElement?.getDescription(locale) || '';
  }

  isInherited(locale: string): boolean {
    const control = this.parentForm.get('description' + locale);
    return (
      this.metaModelElement instanceof CanExtend &&
      this.metaModelElement.extendedDescription?.get(locale) &&
      control.value === this.metaModelElement.extendedDescription?.get(locale)
    );
  }

  private setDescriptionControls() {
    const allLocalesDescriptions = this.metaModelElement?.getAllLocalesDescriptions();

    if (!allLocalesDescriptions.length) {
      this.metaModelElement.addDescription('en', '');
    }

    this.metaModelElement?.getAllLocalesDescriptions().forEach(locale => {
      const key = `description${locale}`;

      const control = this.parentForm.get(key);
      const previousDisabled = control?.disabled;
      const isNowPredefined = (this.metaModelElement as DefaultCharacteristic)?.isPredefined?.();

      if (previousDisabled && !isNowPredefined) {
        control?.patchValue(this.getCurrentValue(key, locale));
      } else if (!previousDisabled && !isNowPredefined) {
        if (this.parentForm.get(key)?.value) {
          return;
        }
      }

      this.removeDescriptionControl(locale);
      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale) || this.metaModelElement?.getDescription(locale),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
        })
      );
    });
  }

  private removeDescriptionControl(locale: string): void {
    this.parentForm.removeControl(`description${locale}`);
  }
}
