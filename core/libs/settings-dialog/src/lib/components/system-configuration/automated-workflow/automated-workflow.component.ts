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

import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {finalize} from 'rxjs';
import {SettingsFormService} from '../../../services';

export const automatedWorkflowControlName = 'automatedWorkflow';

@Component({
  selector: 'ame-automated-workflow-config',
  templateUrl: './automated-workflow.component.html',
  styleUrls: ['./automated-workflow.component.scss'],
})
export class AutomatedWorkflowComponent implements OnInit {
  form: FormGroup;

  constructor(private formService: SettingsFormService) {}

  ngOnInit(): void {
    this.form = this.formService.getForm().get('automatedWorkflow') as FormGroup;
    this.setupAutoSaveFeature();
    this.setupAutoValidationFeature();
  }

  // Sets up the auto-save feature
  private setupAutoSaveFeature(): void {
    const autoSaveEnabledControl = this.form.get('autoSaveEnabled');
    this.subscribeToControlChanges(autoSaveEnabledControl, 'saveTimerSeconds');
  }

  // Sets up the auto-validation feature
  private setupAutoValidationFeature(): void {
    const autoValidationEnabledControl = this.form.get('autoValidationEnabled');
    this.subscribeToControlChanges(autoValidationEnabledControl, 'validationTimerSeconds');
  }

  // Subscribes to a control's value changes and enables/disables a related control
  private subscribeToControlChanges(control: AbstractControl, relatedControlName: string): void {
    if (!control) return;

    const valueChange$ = control.valueChanges.pipe(finalize(() => valueChange$.unsubscribe())).subscribe(enabled => {
      const relatedControl = this.form.get(relatedControlName);
      if (relatedControl) {
        enabled ? relatedControl.enable() : relatedControl.disable();
      }
    });
  }
}
