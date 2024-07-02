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

import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  template: '<router-outlet name="import-namespaces"></router-outlet>',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 1000px;
        min-height: 50vh;
      }
    `,
  ],
  standalone: true,
  imports: [RouterOutlet],
})
export class RootNamespacesImporterComponent {}
