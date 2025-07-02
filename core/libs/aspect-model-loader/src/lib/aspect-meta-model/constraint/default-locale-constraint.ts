/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {LocaleConstraintProps} from '../../shared/props';
import {LangString} from '../named-element';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface LocaleConstraint extends Constraint {
  localeCode: LangString;
  getLocaleCode(): LangString;
}

export class DefaultLocaleConstraint extends DefaultConstraint implements LocaleConstraint {
  override className = 'DefaultLocaleConstraint';
  localeCode: string;

  constructor(props: LocaleConstraintProps) {
    super(props);
    this.localeCode = props.localeCode;
  }

  getLocaleCode(): LangString {
    return this.localeCode;
  }
}
