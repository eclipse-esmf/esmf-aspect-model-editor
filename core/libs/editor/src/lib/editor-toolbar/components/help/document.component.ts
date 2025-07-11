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

import {APP_CONFIG, AppConfig, BrowserService} from '@ame/shared';
import {LanguageTranslateModule} from '@ame/translation';
import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'ame-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatDialogModule, LanguageTranslateModule],
})
export class DocumentComponent {
  AMEDocumentationLink = 'https://eclipse-esmf.github.io/ame-guide/introduction.html';

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private browserService: BrowserService,
  ) {}

  openLink(event: MouseEvent) {
    if (!this.browserService.isStartedAsElectronApp() || !window.require) {
      return;
    }

    const {shell} = window.require('electron');
    event.preventDefault();
    shell.openExternal((event.target as HTMLAnchorElement).href);
  }
}
