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

import {DataFactory, Store} from 'n3';
import {describe, expect, it} from 'vitest';
import {RdfModel} from './rdf-model';

describe('RdfModel', () => {
  it('should initialize with default vocabularies and prefixes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    expect(rdfModel.getMetaModelVersion()).toBe('2.0.0');
    expect(rdfModel.samm).toBeDefined();
    expect(rdfModel.sammC).toBeDefined();
    expect(rdfModel.sammE).toBeDefined();
    expect(rdfModel.sammU).toBeDefined();
    expect(rdfModel.hasDependency(rdfModel.samm.getNamespace())).toBe(true);
  });

  it('should set and retrieve prefixes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    rdfModel.addPrefix('custom', 'urn:custom:namespace#');
    expect(rdfModel.hasDependency('urn:custom:namespace#')).toBe(true);
    expect(rdfModel.getAliasByDependency('urn:custom:namespace#')).toBe('custom');
  });

  it('should resolve blank nodes recursively', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    const blankNode1 = DataFactory.blankNode('b1');
    const blankNode2 = DataFactory.blankNode('b2');
    const firstPredicate = rdfModel.samm.RdfFirst();
    const restPredicate = rdfModel.samm.RdfRest();

    store.addQuad(blankNode1, firstPredicate, DataFactory.namedNode('urn:test#val1'));
    store.addQuad(blankNode1, restPredicate, blankNode2);
    store.addQuad(blankNode2, firstPredicate, DataFactory.namedNode('urn:test#val2'));
    store.addQuad(blankNode2, restPredicate, rdfModel.samm.RdfNil());

    const resolved = rdfModel.resolveBlankNodes('b1');
    expect(resolved.length).toBe(2);
    expect(resolved[0].object.value).toBe('urn:test#val1');
    expect(resolved[1].object.value).toBe('urn:test#val2');
  });

  it('should resolve locale from quad language or literal tag', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0');

    const quadWithLang = DataFactory.quad(
      DataFactory.namedNode('urn:test#el'),
      rdfModel.samm.PreferredNameProperty(),
      DataFactory.literal('Test Element', 'de'),
    );

    expect(rdfModel.getLocale(quadWithLang)).toBe('de');
  });
});
