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

import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {SearchStore} from './search.store';

describe('SearchStore', () => {
  let store: InstanceType<typeof SearchStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchStore],
    });
    store = TestBed.inject(SearchStore);
  });

  it('should initialize with both searches closed', () => {
    expect(store.elementsSearchOpened()).toBe(false);
    expect(store.filesSearchOpened()).toBe(false);
    expect(store.isAnySearchOpened()).toBe(false);
  });

  it('should open and close elements search', () => {
    store.openElementsSearch();
    expect(store.elementsSearchOpened()).toBe(true);
    expect(store.filesSearchOpened()).toBe(false);
    expect(store.isAnySearchOpened()).toBe(true);

    store.closeElementsSearch();
    expect(store.elementsSearchOpened()).toBe(false);
  });

  it('should toggle elements search', () => {
    store.toggleElementsSearch();
    expect(store.elementsSearchOpened()).toBe(true);

    store.toggleElementsSearch();
    expect(store.elementsSearchOpened()).toBe(false);
  });

  it('should close files search when opening elements search', () => {
    store.openFilesSearch();
    expect(store.filesSearchOpened()).toBe(true);

    store.openElementsSearch();
    expect(store.elementsSearchOpened()).toBe(true);
    expect(store.filesSearchOpened()).toBe(false);
  });

  it('should close elements search when opening files search', () => {
    store.openElementsSearch();
    expect(store.elementsSearchOpened()).toBe(true);

    store.openFilesSearch();
    expect(store.filesSearchOpened()).toBe(true);
    expect(store.elementsSearchOpened()).toBe(false);
  });

  it('should close all searches', () => {
    store.openElementsSearch();
    store.closeAll();
    expect(store.elementsSearchOpened()).toBe(false);
    expect(store.filesSearchOpened()).toBe(false);
  });
});
