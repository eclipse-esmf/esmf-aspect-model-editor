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

import {Component, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {EditorService} from '@ame/editor';
import {MxGraphService, ThemeService} from '@ame/mx-graph';
import {Settings} from '../../model';
import {ConfigurationService} from '../../services';

@Component({
  selector: 'ame-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  settings: Settings;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private configurationService: ConfigurationService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.settings = this.configurationService.getSettings();
  }

  onChange() {
    this.configurationService.setSettings(this.settings);
  }

  onLayoutChange() {
    this.mxGraphService.formatShapes(true);
  }

  changeSaveTimeout() {
    this.onChange();
    this.editorService.refreshSaveModel();
  }

  toggleSaveTimeout(toggle: MatSlideToggleChange) {
    toggle.checked ? this.editorService.startSaveLatestModel() : this.editorService.stopSaveLatestModel();
  }

  changeValidateTimeout() {
    this.onChange();
    this.editorService.refreshValidateModel();
  }

  toggleValidateTimeout(toggle: MatSlideToggleChange) {
    toggle.checked ? this.editorService.startValidateModel() : this.editorService.stopValidateModel();
  }

  themeChange(toggle: MatSlideToggleChange) {
    const theme = toggle.checked ? 'dark' : 'light';
    this.themeService.applyTheme(theme);
  }
}
