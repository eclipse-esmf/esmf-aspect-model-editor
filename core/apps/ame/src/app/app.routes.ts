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

import {Routes} from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/loading/loading.component').then(mod => mod.LoadingComponent),
  },
  {
    path: 'editor',
    loadComponent: () => import('./components/editor-canvas/editor-canvas.component').then(mod => mod.EditorCanvasComponent),
    children: [
      {
        path: 'select/:urn',
        loadComponent: () => import('./components/editor-canvas/editor-canvas.component').then(mod => mod.EditorCanvasComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/loading',
    pathMatch: 'full',
  },
];
