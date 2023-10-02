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

import {Component} from '@angular/core';
import {EditorService} from '@ame/editor';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {LoadingScreenService} from '@ame/shared';

@Component({
  selector: 'ame-editor-canvas-menu',
  templateUrl: './editor-canvas-menu.component.html',
  styleUrls: ['./editor-canvas-menu.component.scss'],
})
export class EditorCanvasMenuComponent {
  settings: Settings;

  constructor(
    private editorService: EditorService,
    public configurationService: ConfigurationService,
    private loadingScreenService: LoadingScreenService
  ) {
    this.settings = configurationService.getSettings();
  }

  zoomIn() {
    this.loadingScreenService
      .open({
        title: 'Zooming in...',
        content: 'Please wait until zoom finishes',
      })
      .afterOpened()
      .subscribe(() => {
        this.editorService.zoomIn();
        this.loadingScreenService.close();
      });
  }

  zoomOut() {
    this.loadingScreenService
      .open({
        title: 'Zooming out...',
        content: 'Please wait until zoom finishes',
      })
      .afterOpened()
      .subscribe(() => {
        this.editorService.zoomOut();
        this.loadingScreenService.close();
      });
  }

  fit() {
    this.loadingScreenService
      .open({
        title: 'Fitting...',
        content: 'Please wait until fitting finishes',
      })
      .afterOpened()
      .subscribe(() => {
        this.editorService.fit();
        this.loadingScreenService.close();
      });
  }

  actualSize() {
    this.loadingScreenService
      .open({
        title: 'Fit to view...',
        content: 'Please wait until fitting finishes',
      })
      .afterOpened()
      .subscribe(() => {
        this.editorService.actualSize();
        this.loadingScreenService.close();
      });
  }
}
