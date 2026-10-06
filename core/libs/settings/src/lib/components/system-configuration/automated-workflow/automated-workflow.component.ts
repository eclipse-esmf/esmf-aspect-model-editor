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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {SettingsFormService} from '../../../services';

export const automatedWorkflowControlName = 'automatedWorkflow';

@Component({
  selector: 'ame-automated-workflow-config',
  templateUrl: './automated-workflow.component.html',
  styleUrls: ['./automated-workflow.component.scss'],
  imports: [FormField, MatSlideToggle, MatIconModule, MatTooltip, MatFormFieldModule, MatLabel, MatError, MatInput, TranslocoDirective],
})
export class AutomatedWorkflowComponent {
  protected readonly formService = inject(SettingsFormService);

  readonly form = this.formService.settingsForm;
}
