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

import {ThemeService} from '@ame/mx-graph';
import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {Settings} from '../../../model';
import {SettingsFormService} from '../../../services';

export const editorConfigurationControlName = 'editorConfiguration';

@Component({
  selector: 'ame-editor-configuration',
  templateUrl: './editor-configuration.component.html',
  styleUrls: ['./editor-configuration.component.scss'],
})
export class EditorConfigurationComponent implements OnInit {
  form: FormGroup;
  settings: Settings;

  constructor(
    private formService: SettingsFormService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.form = this.formService.getForm().get('editorConfiguration') as FormGroup;
  }

  // TODO activate when clarified
  themeChange(toggle: MatSlideToggleChange) {
    const theme = toggle.checked ? 'dark' : 'light';
    this.themeService.applyTheme(theme);
  }
}
