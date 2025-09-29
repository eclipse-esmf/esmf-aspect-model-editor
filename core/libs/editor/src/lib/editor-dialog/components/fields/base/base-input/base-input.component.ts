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

import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {PreviousFormDataSnapshot} from '../../../../interfaces';
import {DescriptionInputFieldComponent} from '../description-input-field/description-input-field.component';
import {NameInputFieldComponent} from '../name-input-field/name-input-field.component';
import {PreferredNameInputFieldComponent} from '../preferred-name-input-field/preferred-name-input-field.component';
import {SeeInputFieldComponent} from '../see-input-field/see-input-field.component';

@Component({
  selector: 'ame-base-input',
  templateUrl: './base-input.component.html',
  imports: [NameInputFieldComponent, PreferredNameInputFieldComponent, DescriptionInputFieldComponent, SeeInputFieldComponent],
})
export class BaseInputComponent {
  @Input() hideDescription = false;
  @Input() hideSee = false;
  @Input() parentForm: FormGroup;
  @Input() previousData: PreviousFormDataSnapshot;
}
