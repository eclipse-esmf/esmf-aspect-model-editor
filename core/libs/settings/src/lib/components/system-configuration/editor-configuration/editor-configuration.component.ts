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
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {SettingsFormService} from '../../../services';

export const editorConfigurationControlName = 'editorConfiguration';

@Component({
  selector: 'ame-editor-configuration',
  templateUrl: './editor-configuration.component.html',
  styleUrls: ['./editor-configuration.component.scss'],
  imports: [FormField, MatSlideToggle, MatTooltip, MatIconModule, TranslocoDirective],
})
export class EditorConfigurationComponent {
  protected readonly formService = inject(SettingsFormService);

  readonly form = this.formService.settingsForm;
}
