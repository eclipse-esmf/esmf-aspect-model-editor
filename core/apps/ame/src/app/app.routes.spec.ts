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

import {EditorCanvasComponent, LoadingComponent} from '@ame/features/workbench';
import {describe, expect, it} from 'vitest';
import {APP_ROUTES} from './app.routes';

describe('APP_ROUTES', () => {
  it('should define the default (loading) route', () => {
    const route = APP_ROUTES.find(r => r.path === '' && !!r.component);

    expect(route).toBeDefined();
    expect(route.component).toBe(LoadingComponent);
  });

  it('should define the editor route with a nested select/:urn route', () => {
    const route = APP_ROUTES.find(r => r.path === 'editor');

    expect(route).toBeDefined();
    expect(route.component).toBe(EditorCanvasComponent);
    expect(route.children).toHaveLength(1);
    expect(route.children[0].path).toBe('select/:urn');
    expect(route.children[0].component).toBe(EditorCanvasComponent);
  });

  it('should redirect unmatched paths to /loading', () => {
    const fallback = APP_ROUTES.find(r => r.redirectTo);

    expect(fallback).toEqual({
      path: '',
      redirectTo: '/loading',
      pathMatch: 'full',
    });
  });
});
