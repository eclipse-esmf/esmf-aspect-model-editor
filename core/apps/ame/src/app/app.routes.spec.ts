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

import {Type} from '@angular/core';
import {describe, expect, it} from 'vitest';
import {APP_ROUTES} from './app.routes';

function extractComponentName(loaded: unknown): string {
  const value =
    loaded && typeof loaded === 'object' && 'default' in (loaded as object) ? (loaded as {default: Type<unknown>}).default : loaded;
  // In test builds the identifier may be prefixed (e.g. "_LoadingComponent") due to bundling/minification.
  return (value as Type<unknown>).name.replace(/^_+/, '');
}

describe('APP_ROUTES', () => {
  it('should define the default (loading) route', () => {
    const route = APP_ROUTES.find(r => r.path === '' && !!r.loadComponent);

    expect(route).toBeDefined();
  });

  it('should lazily resolve the loading component', async () => {
    const route = APP_ROUTES.find(r => r.path === '' && !!r.loadComponent);
    const component = await route.loadComponent();

    expect(extractComponentName(component)).toBe('LoadingComponent');
  });

  it('should define the editor route with a nested select/:urn route', () => {
    const route = APP_ROUTES.find(r => r.path === 'editor');

    expect(route).toBeDefined();
    expect(route.children).toHaveLength(1);
    expect(route.children[0].path).toBe('select/:urn');
  });

  it('should lazily resolve the editor canvas component for both the editor and select/:urn routes', async () => {
    const editorRoute = APP_ROUTES.find(r => r.path === 'editor');
    const component = await editorRoute.loadComponent();
    const childComponent = await editorRoute.children[0].loadComponent();

    expect(extractComponentName(component)).toBe('EditorCanvasComponent');
    expect(extractComponentName(childComponent)).toBe('EditorCanvasComponent');
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
