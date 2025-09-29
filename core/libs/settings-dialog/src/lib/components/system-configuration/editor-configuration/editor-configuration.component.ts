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

import {Component, inject, OnInit} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {Settings} from '../../../model';
import {SettingsFormService} from '../../../services';

export const editorConfigurationControlName = 'editorConfiguration';

@Component({
  selector: 'ame-editor-configuration',
  templateUrl: './editor-configuration.component.html',
  styleUrls: ['./editor-configuration.component.scss'],
  imports: [ReactiveFormsModule, MatSlideToggle, MatTooltip, MatIconModule, TranslatePipe],
})
export class EditorConfigurationComponent implements OnInit {
  private formService = inject(SettingsFormService);

  public form: FormGroup;
  public settings: Settings;

  ngOnInit(): void {
    this.form = this.formService.getForm().get('editorConfiguration') as FormGroup;
  }
}
