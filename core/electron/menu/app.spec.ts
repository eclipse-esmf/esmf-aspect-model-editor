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

import {describe, it, expect, jest} from '@jest/globals';

jest.mock('electron', () => ({}));
jest.mock('./edit', () => ({edit: jest.fn(() => [])}));
jest.mock('./file', () => ({file: jest.fn(() => [])}));
jest.mock('./generate', () => ({generate: jest.fn(() => [])}));
jest.mock('./search', () => ({search: jest.fn(() => [])}));
jest.mock('./validate', () => ({validate: jest.fn(() => [])}));
jest.mock('./view', () => ({view: jest.fn(() => [])}));

const translation = {
  MENU: {
    FILE: {LABEL: 'File'},
    VIEW: {LABEL: 'View'},
    EDIT: {LABEL: 'Edit'},
    VALIDATE: {LABEL: 'Validate'},
    GENERATE: {LABEL: 'Generate'},
    SEARCH: {LABEL: 'Search'},
  },
};

function loadAppMenu(isMac: boolean) {
  let mod: typeof import('./app');
  jest.isolateModules(() => {
    jest.mock('../platform/platform', () => ({isMac}), {virtual: false});
    mod = require('./app');
  });
  return mod!;
}

describe('appMenuTemplate', () => {
  it('should return 6 menu items on non-Mac', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);

    expect(result).toHaveLength(6);
  });

  it('should return 7 menu items on Mac (includes appMenu role)', () => {
    const {appMenuTemplate} = loadAppMenu(true);

    const result = appMenuTemplate(translation);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({role: 'appMenu'});
  });

  it('should include MENU_FILE item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const fileMenu = result.find((item: any) => item.id === 'MENU_FILE');

    expect(fileMenu).toBeDefined();
    expect((fileMenu as any).label).toBe('File');
  });

  it('should include MENU_VIEW item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const viewMenu = result.find((item: any) => item.id === 'MENU_VIEW');

    expect(viewMenu).toBeDefined();
    expect((viewMenu as any).label).toBe('View');
  });

  it('should include MENU_EDIT item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const editMenu = result.find((item: any) => item.id === 'MENU_EDIT');

    expect(editMenu).toBeDefined();
    expect((editMenu as any).label).toBe('Edit');
  });

  it('should include MENU_VALIDATE item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const validateMenu = result.find((item: any) => item.id === 'MENU_VALIDATE');

    expect(validateMenu).toBeDefined();
    expect((validateMenu as any).label).toBe('Validate');
  });

  it('should include MENU_GENERATE item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const generateMenu = result.find((item: any) => item.id === 'MENU_GENERATE');

    expect(generateMenu).toBeDefined();
    expect((generateMenu as any).label).toBe('Generate');
  });

  it('should include MENU_SEARCH item with correct label', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);
    const searchMenu = result.find((item: any) => item.id === 'MENU_SEARCH');

    expect(searchMenu).toBeDefined();
    expect((searchMenu as any).label).toBe('Search');
  });

  it('should not include appMenu role on non-Mac', () => {
    const {appMenuTemplate} = loadAppMenu(false);

    const result = appMenuTemplate(translation);

    expect(result.find((item: any) => item.role === 'appMenu')).toBeUndefined();
  });

  it('default export should expose appMenuTemplate', () => {
    const {appMenuTemplate, default: defaultExport} = loadAppMenu(false);

    expect(defaultExport.appMenuTemplate).toBe(appMenuTemplate);
  });
});
