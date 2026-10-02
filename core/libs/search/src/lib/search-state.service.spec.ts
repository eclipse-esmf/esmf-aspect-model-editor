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

import {SearchStore} from '@ame/domain';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {SearchesStateService} from './search-state.service';

describe('SearchesStateService', () => {
  let service: SearchesStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchStore, SearchesStateService],
    });
    service = TestBed.inject(SearchesStateService);
  });

  it('should initialize with both searches closed', () => {
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));
    TestBed.flushEffects();

    expect(elementsOpened).toBe(false);
    expect(filesOpened).toBe(false);
  });

  it('should open, close, and toggle elements search', () => {
    let opened: boolean;
    service.elementsSearch.opened$.subscribe(val => (opened = val));
    TestBed.flushEffects();

    service.elementsSearch.open();
    TestBed.flushEffects();
    expect(opened).toBe(true);

    service.elementsSearch.close();
    TestBed.flushEffects();
    expect(opened).toBe(false);

    service.elementsSearch.toggle();
    TestBed.flushEffects();
    expect(opened).toBe(true);

    service.elementsSearch.toggle();
    TestBed.flushEffects();
    expect(opened).toBe(false);
  });

  it('should close files search when elements search opens', () => {
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));
    TestBed.flushEffects();

    service.filesSearch.open();
    TestBed.flushEffects();
    expect(filesOpened).toBe(true);

    service.elementsSearch.open();
    TestBed.flushEffects();
    expect(elementsOpened).toBe(true);
    expect(filesOpened).toBe(false);
  });

  it('should close elements search when files search opens', () => {
    let elementsOpened: boolean;
    let filesOpened: boolean;

    service.elementsSearch.opened$.subscribe(val => (elementsOpened = val));
    service.filesSearch.opened$.subscribe(val => (filesOpened = val));
    TestBed.flushEffects();

    service.elementsSearch.open();
    TestBed.flushEffects();
    expect(elementsOpened).toBe(true);

    service.filesSearch.open();
    TestBed.flushEffects();
    expect(filesOpened).toBe(true);
    expect(elementsOpened).toBe(false);
  });
});
