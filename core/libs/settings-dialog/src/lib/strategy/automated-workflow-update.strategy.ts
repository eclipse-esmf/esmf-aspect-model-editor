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

import {FormGroup} from '@angular/forms';
import {Settings} from '@ame/settings-dialog';
import {SettingsUpdateStrategy} from './settings-update.strategy';
import {EditorService} from '@ame/editor';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AutomatedWorkflowUpdateStrategy implements SettingsUpdateStrategy {
  constructor(private editorService: EditorService) {}

  updateSettings(form: FormGroup, settings: Settings): void {
    const automatedWorkflow = form.get('automatedWorkflow');
    if (!automatedWorkflow) return;

    settings.autoSaveEnabled = automatedWorkflow.get('autoSaveEnabled')?.value;
    settings.saveTimerSeconds = automatedWorkflow.get('saveTimerSeconds')?.value;
    settings.autoValidationEnabled = automatedWorkflow.get('autoValidationEnabled')?.value;
    settings.validationTimerSeconds = automatedWorkflow.get('validationTimerSeconds')?.value;
    settings.autoFormatEnabled = automatedWorkflow.get('autoFormatEnabled')?.value;

    if (settings.autoValidationEnabled) this.editorService.refreshValidateModel();
  }
}
