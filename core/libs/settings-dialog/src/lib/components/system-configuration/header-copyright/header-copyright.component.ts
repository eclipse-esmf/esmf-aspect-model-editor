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

import {Component, inject} from '@angular/core';
import {FormField} from '@angular/forms/signals';
import {MatError} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';
import {SettingsFormService} from '../../../services';

@Component({
  selector: 'ame-copyright',
  templateUrl: './header-copyright.component.html',
  styleUrls: ['./header-copyright.component.scss'],
  imports: [FormField, MatError, TranslocoDirective],
})
export class HeaderCopyrightComponent {
  protected readonly formService = inject(SettingsFormService);

  readonly form = this.formService.settingsForm;
}
