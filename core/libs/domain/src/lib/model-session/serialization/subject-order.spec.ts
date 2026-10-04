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
import {computeSubjectOrder, sortSubjectsAlphabetically} from './subject-order';

const NS = 'urn:samm:org.example:1.0.0#';
const SAMM = 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const {namedNode, blankNode, quad, literal} = DataFactory;
const iri = (name: string) => `${NS}${name}`;

function add(store: Store, subject: string, predicate: string, object: string) {
  store.addQuad(quad(namedNode(iri(subject)), namedNode(predicate), namedNode(object)));
}

/** Aspect -> (p1, p2) as RDF list, p1 -> C1, p2 -> C2 */
function createStore(): Store {
  const store = new Store();
  const list1 = blankNode('l1');
  const list2 = blankNode('l2');
  add(store, 'Aspect', `${RDF}type`, `${SAMM}Aspect`);
  store.addQuad(quad(namedNode(iri('Aspect')), namedNode(`${SAMM}properties`), list1));
  store.addQuad(quad(list1, namedNode(`${RDF}first`), namedNode(iri('p1'))));
  store.addQuad(quad(list1, namedNode(`${RDF}rest`), list2));
  store.addQuad(quad(list2, namedNode(`${RDF}first`), namedNode(iri('p2'))));
  store.addQuad(quad(list2, namedNode(`${RDF}rest`), namedNode(`${RDF}nil`)));
  add(store, 'p1', `${RDF}type`, `${SAMM}Property`);
  add(store, 'p1', `${SAMM}characteristic`, iri('C1'));
  add(store, 'p2', `${RDF}type`, `${SAMM}Property`);
  add(store, 'p2', `${SAMM}characteristic`, iri('C2'));
  add(store, 'C1', `${RDF}type`, `${SAMM}Characteristic`);
  add(store, 'C2', `${RDF}type`, `${SAMM}Characteristic`);
  return store;
}

describe('computeSubjectOrder', () => {
  const sourceOrder = ['C2', 'p2', 'Aspect', 'C1', 'p1'].map(iri);

  it('should keep the order of the source', () => {
    expect(computeSubjectOrder(createStore(), sourceOrder, 'keepOrderAfterParent')).toEqual(sourceOrder);
  });

  it('should drop deleted subjects', () => {
    const store = createStore();
    store.removeQuads(store.getQuads(iri('C2'), null, null, null));
    expect(computeSubjectOrder(store, sourceOrder, 'keepOrderAfterParent')).toEqual(['p2', 'Aspect', 'C1', 'p1'].map(iri));
  });

  it('should insert new elements directly after their parent', () => {
    const store = createStore();
    // the new characteristic C3 is used by the existing p1 and the new property p3 is referenced by C2
    add(store, 'C3', `${RDF}type`, `${SAMM}Characteristic`);
    add(store, 'p1', `${SAMM}see`, iri('C3'));
    add(store, 'p3', `${RDF}type`, `${SAMM}Property`);
    add(store, 'p3', `${SAMM}characteristic`, iri('C4'));
    add(store, 'C4', `${RDF}type`, `${SAMM}Characteristic`);
    add(store, 'C2', `${SAMM}see`, iri('p3'));

    expect(computeSubjectOrder(store, sourceOrder, 'keepOrderAfterParent')).toEqual(
      ['C2', 'p3', 'C4', 'p2', 'Aspect', 'C1', 'p1', 'C3'].map(iri),
    );
  });

  it('should resolve parents through RDF lists', () => {
    const store = createStore();
    const order = ['Aspect', 'p1', 'C1'].map(iri);
    store.removeQuads(store.getQuads(iri('p2'), null, null, null));
    store.removeQuads(store.getQuads(iri('C2'), null, null, null));
    add(store, 'p2', `${RDF}type`, `${SAMM}Property`);

    expect(computeSubjectOrder(store, order, 'keepOrderAfterParent')).toEqual(['Aspect', 'p2', 'p1', 'C1'].map(iri));
  });

  it('should append new elements at the end', () => {
    expect(computeSubjectOrder(createStore(), ['Aspect', 'p1'].map(iri), 'keepOrderAppend').slice(0, 2)).toEqual(['Aspect', 'p1'].map(iri));
    expect(computeSubjectOrder(createStore(), ['Aspect', 'p1'].map(iri), 'keepOrderAppend')).toHaveLength(5);
  });

  it('should place new elements without parent at the end', () => {
    const store = createStore();
    store.addQuad(quad(namedNode(iri('Orphan')), namedNode(`${SAMM}description`), literal('x')));
    const order = computeSubjectOrder(store, sourceOrder, 'keepOrderAfterParent');
    expect(order[order.length - 1]).toBe(iri('Orphan'));
  });

  it('should sort alphabetically and keep the aspect first', () => {
    const store = createStore();
    expect(sortSubjectsAlphabetically(store, ['p2', 'C1', 'Aspect', 'p1', 'C2'].map(iri))).toEqual(
      ['Aspect', 'C1', 'C2', 'p1', 'p2'].map(iri),
    );
  });
});
