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

import {APP_CONFIG, AppConfig, DialogCloseButtonComponent, ExternalLinkDirective} from '@ame/shared';
import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';

@Component({
  selector: 'ame-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  imports: [DialogCloseButtonComponent, MatButtonModule, MatIconModule, MatDialogModule, TranslocoDirective, ExternalLinkDirective],
})
export class DocumentComponent {
  public config = inject(APP_CONFIG) as AppConfig;

  AMEDocumentationLink = signal('https://eclipse-esmf.github.io/ame-guide/introduction.html');
}
