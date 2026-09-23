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

import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {LoadedFilesService} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DataFactory, Store} from 'n3';
import {CleanupVisitor} from './cleanup-visitor.service';

describe('CleanupVisitor', () => {
  let service: CleanupVisitor;
  let store: Store;

  const configureTestBed = (currentLoadedFile: any) => {
    TestBed.configureTestingModule({
      providers: [CleanupVisitor, {provide: LoadedFilesService, useValue: {currentLoadedFile}}],
    });

    service = TestBed.inject(CleanupVisitor);
  };

  beforeEach(() => {
    store = new Store();
    store.addQuad(DataFactory.namedNode('urn:samm:test#a'), DataFactory.namedNode('urn:samm:test#p'), DataFactory.literal('1'));
    store.addQuad(DataFactory.namedNode('urn:samm:test#b'), DataFactory.namedNode('urn:samm:test#p'), DataFactory.literal('2'));

    configureTestBed({rdfModel: {store}});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove every quad from the current store', () => {
    expect(store.size).toBe(2);

    service.removeStoreElements();

    expect(store.size).toBe(0);
  });

  it('should do nothing when the store is already empty', () => {
    service.removeStoreElements();
    expect(store.size).toBe(0);

    expect(() => service.removeStoreElements()).not.toThrow();
    expect(store.size).toBe(0);
  });
});
