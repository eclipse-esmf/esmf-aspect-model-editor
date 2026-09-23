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

import {describe, expect, it} from 'vitest';
import {SearchesStateService} from './search-state.service';

describe('SearchesStateService', () => {
  it('should initialize with both searches closed', () => {
    const service = new SearchesStateService();
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));

    expect(elementsOpened).toBe(false);
    expect(filesOpened).toBe(false);
  });

  it('should open, close, and toggle elements search', () => {
    const service = new SearchesStateService();
    let opened: boolean;
    service.elementsSearch.opened$.subscribe(val => (opened = val));

    service.elementsSearch.open();
    expect(opened).toBe(true);

    service.elementsSearch.close();
    expect(opened).toBe(false);

    service.elementsSearch.toggle();
    expect(opened).toBe(true);

    service.elementsSearch.toggle();
    expect(opened).toBe(false);
  });

  it('should close files search when elements search opens', () => {
    const service = new SearchesStateService();
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));

    service.filesSearch.open();
    expect(filesOpened).toBe(true);

    service.elementsSearch.open();
    expect(elementsOpened).toBe(true);
    expect(filesOpened).toBe(false);
  });

  it('should close elements search when files search opens', () => {
    const service = new SearchesStateService();
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));

    service.elementsSearch.open();
    expect(elementsOpened).toBe(true);

    service.filesSearch.open();
    expect(filesOpened).toBe(true);
    expect(elementsOpened).toBe(false);
  });
});
