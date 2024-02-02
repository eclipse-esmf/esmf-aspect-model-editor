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

import {DefaultEntity, DefaultEnumeration, DefaultProperty, DefaultTrait, Property} from '@ame/meta-model';
import {isDataTypeLangString} from '@ame/shared';
import {FormGroup} from '@angular/forms';

export enum DataType {
  COMPLEX = 'COMPLEX',
  LANG_STRING = 'LANG_STRING',
  DEFAULT = 'DEFAULT',
}

export class FormFieldHelper {
  public static isComplexProperty(property: Property): boolean {
    if (property?.characteristic instanceof DefaultTrait) {
      return property?.characteristic?.baseCharacteristic?.dataType instanceof DefaultEntity;
    }
    return property?.characteristic?.dataType instanceof DefaultEntity;
  }

  public static isEnumerationProperty(property: DefaultProperty): boolean {
    if (property?.characteristic instanceof DefaultTrait) {
      return property?.characteristic?.baseCharacteristic instanceof DefaultEnumeration;
    }
    return property?.characteristic instanceof DefaultEnumeration;
  }

  public static hasPropertyValidator(property: DefaultProperty, form: FormGroup, key?: string): boolean {
    const languageCode = key ? '-' + key : '';
    return Boolean(form.controls[property.name + languageCode]?.validator);
  }

  public static getDataType(property: DefaultProperty): DataType {
    if (FormFieldHelper.isComplexProperty(property)) {
      return DataType.COMPLEX;
    } else if (isDataTypeLangString(property)) {
      return DataType.LANG_STRING;
    }

    return DataType.DEFAULT;
  }
}
