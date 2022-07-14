/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component} from '@angular/core';
import {EditorService} from '@ame/editor';
import {ConfigurationService, Settings} from '@ame/settings-dialog';

@Component({
  selector: 'ame-editor-canvas-menu',
  templateUrl: './editor-canvas-menu.component.html',
  styleUrls: ['./editor-canvas-menu.component.scss'],
})
export class EditorCanvasMenuComponent {
  settings: Settings;

  constructor(private editorService: EditorService, public configurationService: ConfigurationService) {
    this.settings = configurationService.getSettings();
  }

  zoomIn() {
    this.editorService.zoomIn();
  }

  zoomOut() {
    this.editorService.zoomOut();
  }

  fit() {
    this.editorService.fit();
  }

  actualSize() {
    this.editorService.actualSize();
  }
}
