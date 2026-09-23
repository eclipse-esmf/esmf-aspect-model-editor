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

import {EDITOR_VALIDATION_SERVICE, IEditorValidationService, IModelSaverTokenService, MODEL_SAVER_TOKEN_SERVICE} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class AutomatedWorkflowUpdateStrategy implements SettingsUpdateStrategy {
  private readonly modelSaverService: IModelSaverTokenService = inject(MODEL_SAVER_TOKEN_SERVICE, {optional: true})!;
  private readonly editorService: IEditorValidationService = inject(EDITOR_VALIDATION_SERVICE, {optional: true})!;

  updateSettings(model: SettingsFormData, settings: Settings): void {
    const automatedWorkflow = model?.automatedWorkflow;
    if (!automatedWorkflow) return;

    settings.autoSaveEnabled = automatedWorkflow.autoSaveEnabled;
    settings.saveTimerSeconds = automatedWorkflow.saveTimerSeconds;
    settings.autoValidationEnabled = automatedWorkflow.autoValidationEnabled;
    settings.validationTimerSeconds = automatedWorkflow.validationTimerSeconds;
    settings.autoFormatEnabled = automatedWorkflow.autoFormatEnabled;

    if (settings.autoValidationEnabled) this.editorService?.enableAutoValidation();
    if (settings.autoSaveEnabled) this.modelSaverService?.enableAutoSave();
  }
}
