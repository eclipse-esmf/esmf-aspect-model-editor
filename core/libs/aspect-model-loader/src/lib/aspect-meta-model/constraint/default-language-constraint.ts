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

import {LanguageConstraintProps} from '../../shared/props';
import {LangString} from '../named-element';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface LanguageConstraint extends Constraint {
  languageCode: LangString;
  getLanguageCode(): LangString;
}

export class DefaultLanguageConstraint extends DefaultConstraint implements LanguageConstraint {
  override className = 'DefaultLanguageConstraint';
  languageCode: string;

  constructor(props: LanguageConstraintProps) {
    super(props);
    this.languageCode = props.languageCode;
  }

  getLanguageCode(): LangString {
    return this.languageCode;
  }
}
