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

import {ElementOrderStrategy} from '@ame/shared';
import {Store, Term} from 'n3';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const SAMM_META_MODEL = 'urn:samm:org.eclipse.esmf.samm:meta-model:';

/** Named subjects of the store in a stable order. */
export function getNamedSubjects(store: Store): string[] {
  return [
    ...new Set(
      store
        .getSubjects(null, null, null)
        .filter(subject => subject.termType === 'NamedNode')
        .map(subject => subject.value),
    ),
  ];
}

/**
 * Calculates the order in which the subjects of a model are written.
 * Existing subjects keep their position; new subjects are placed depending on the strategy.
 */
export function computeSubjectOrder(store: Store, knownOrder: string[], strategy: ElementOrderStrategy): string[] {
  const subjects = getNamedSubjects(store);
  const present = new Set(subjects);
  const known = [...new Set(knownOrder)].filter(iri => present.has(iri));
  const knownSet = new Set(known);
  const added = subjects.filter(iri => !knownSet.has(iri));

  if (!added.length) {
    return known;
  }
  if (strategy !== 'keepOrderAfterParent') {
    return [...known, ...added];
  }

  const knownPosition = new Map(known.map((iri, index) => [iri, index]));
  const addedSet = new Set(added);
  const children = new Map<string, string[]>();
  const orphans: string[] = [];

  for (const iri of added) {
    const parent = findParent(store, iri, knownPosition, addedSet);
    if (parent) {
      children.set(parent, [...(children.get(parent) ?? []), iri]);
    } else {
      orphans.push(iri);
    }
  }

  const result: string[] = [];
  const placed = new Set<string>();
  const place = (iri: string) => {
    if (placed.has(iri)) return;
    placed.add(iri);
    result.push(iri);
    children.get(iri)?.forEach(place);
  };

  known.forEach(place);
  orphans.forEach(place);
  // subjects whose parents only reference each other (cycles of new elements)
  added.forEach(place);
  return result;
}

/**
 * The parent of a new subject is the element referencing it: preferably an existing element (the first one in the file),
 * otherwise another new element.
 */
function findParent(store: Store, iri: string, knownPosition: Map<string, number>, added: Set<string>): string | null {
  const referrers = new Set<string>();
  for (const quad of store.getQuads(null, null, iri, null)) {
    if (quad.predicate.value === RDF_TYPE) continue;
    const root = resolveNamedRoot(store, quad.subject);
    if (root && root !== iri) referrers.add(root);
  }

  let bestKnown: string | null = null;
  for (const referrer of referrers) {
    const position = knownPosition.get(referrer);
    if (position !== undefined && (bestKnown === null || position < (knownPosition.get(bestKnown) as number))) {
      bestKnown = referrer;
    }
  }
  if (bestKnown) return bestKnown;

  for (const candidate of added) {
    if (referrers.has(candidate)) return candidate;
  }
  return null;
}

/** Follows blank nodes (lists, anonymous elements) up to the named subject which contains them. */
function resolveNamedRoot(store: Store, term: Term, visited = new Set<string>()): string | null {
  if (term.termType === 'NamedNode') return term.value;
  if (term.termType !== 'BlankNode' || visited.has(term.value)) return null;
  visited.add(term.value);

  for (const quad of store.getQuads(null, null, term, null)) {
    const root = resolveNamedRoot(store, quad.subject, visited);
    if (root) return root;
  }
  return null;
}

/** Alphabetical order by local name, keeping Aspects at the top. */
export function sortSubjectsAlphabetically(store: Store, subjects: string[]): string[] {
  const isAspect = (iri: string) =>
    store
      .getQuads(iri, RDF_TYPE, null, null)
      .some(quad => quad.object.value.startsWith(SAMM_META_MODEL) && quad.object.value.endsWith('#Aspect'));
  const localName = (iri: string) => iri.slice(Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/')) + 1);

  return [...subjects].sort((a, b) => {
    const aspectOrder = Number(isAspect(b)) - Number(isAspect(a));
    return aspectOrder || localName(a).localeCompare(localName(b), 'en', {sensitivity: 'base'}) || a.localeCompare(b);
  });
}
