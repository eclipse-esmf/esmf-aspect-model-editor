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

import {describe, expect, it, vi} from 'vitest';

vi.mock('electron', () => ({}));
vi.mock('./edit', () => ({edit: vi.fn(() => [])}));
vi.mock('./file', () => ({file: vi.fn(() => [])}));
vi.mock('./generate', () => ({generate: vi.fn(() => [])}));
vi.mock('./search', () => ({search: vi.fn(() => [])}));
vi.mock('./validate', () => ({validate: vi.fn(() => [])}));
vi.mock('./view', () => ({view: vi.fn(() => [])}));

const translation = {
  menu: {
    file: {label: 'File'},
    view: {label: 'View'},
    edit: {label: 'Edit'},
    validate: {label: 'Validate'},
    generate: {label: 'Generate'},
    search: {label: 'Search'},
  },
};

function loadAppMenu(isMac: boolean) {
  vi.resetModules();
  vi.doMock('../platform/platform', () => ({isMac}));
  return import('./app') as Promise<typeof import('./app')>;
}

describe('appMenuTemplate', () => {
  it('should return 6 menu items on non-Mac', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);

    expect(result).toHaveLength(6);
  });

  it('should return 7 menu items on Mac (includes appMenu role)', async () => {
    const {appMenuTemplate} = await loadAppMenu(true);

    const result = appMenuTemplate(translation);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({role: 'appMenu'});
  });

  it('should include MENU_FILE item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const fileMenu = result.find((item: any) => item.id === 'MENU_FILE');

    expect(fileMenu).toBeDefined();
    expect((fileMenu as any).label).toBe('File');
  });

  it('should include MENU_VIEW item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const viewMenu = result.find((item: any) => item.id === 'MENU_VIEW');

    expect(viewMenu).toBeDefined();
    expect((viewMenu as any).label).toBe('View');
  });

  it('should include MENU_EDIT item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const editMenu = result.find((item: any) => item.id === 'MENU_EDIT');

    expect(editMenu).toBeDefined();
    expect((editMenu as any).label).toBe('Edit');
  });

  it('should include MENU_VALIDATE item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const validateMenu = result.find((item: any) => item.id === 'MENU_VALIDATE');

    expect(validateMenu).toBeDefined();
    expect((validateMenu as any).label).toBe('Validate');
  });

  it('should include MENU_GENERATE item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const generateMenu = result.find((item: any) => item.id === 'MENU_GENERATE');

    expect(generateMenu).toBeDefined();
    expect((generateMenu as any).label).toBe('Generate');
  });

  it('should include MENU_SEARCH item with correct label', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const searchMenu = result.find((item: any) => item.id === 'MENU_SEARCH');

    expect(searchMenu).toBeDefined();
    expect((searchMenu as any).label).toBe('Search');
  });

  it('should not include appMenu role on non-Mac', async () => {
    const {appMenuTemplate} = await loadAppMenu(false);

    const result = appMenuTemplate(translation);

    expect(result.find((item: any) => item.role === 'appMenu')).toBeUndefined();
  });

  it('default export should expose appMenuTemplate', async () => {
    const {appMenuTemplate, default: defaultExport} = await loadAppMenu(false);

    expect(defaultExport.appMenuTemplate).toBe(appMenuTemplate);
  });
});
