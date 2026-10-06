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
import {FullTextSearchIndex, normalizeSearchText, SearchField, splitIdentifier, tokenizeSearchQuery} from './full-text-search';

interface TestElement {
  name: string;
  preferredName?: Record<string, string>;
  description?: Record<string, string>;
}

const fields = (element: TestElement): SearchField[] => [
  {key: 'name', value: element.name},
  ...Object.entries(element.preferredName ?? {}).map(([lang, value]) => ({key: 'preferredName' as const, value, lang})),
  ...Object.entries(element.description ?? {}).map(([lang, value]) => ({key: 'description' as const, value, lang})),
  {key: 'urn', value: `urn:samm:org.example:1.0.0#${element.name}`},
];

const capacity: TestElement = {
  name: 'capacityThresholdExhaustion',
  preferredName: {en: 'Capacity threshold', de: 'Kapazitätsschwelle'},
  description: {en: 'Threshold after which the capacity is considered as exhausted.'},
};
const battery: TestElement = {
  name: 'BatteryPass',
  preferredName: {en: 'Battery passport'},
  description: {en: 'Digital product passport for batteries.', de: 'Digitaler Produktpass für Batterien.'},
};
const exhaustionDate: TestElement = {name: 'exhaustionDate', description: {en: 'Date of the exhaustion.'}};

function names(results: {item: TestElement}[]): string[] {
  return results.map(result => result.item.name);
}

describe('full-text-search', () => {
  describe('splitIdentifier', () => {
    it('should split camel case, pascal case, acronyms, digits and separators', () => {
      expect(splitIdentifier('capacityThresholdExhaustion')).toEqual(['capacity', 'Threshold', 'Exhaustion']);
      expect(splitIdentifier('HTTPStatusCode')).toEqual(['HTTP', 'Status', 'Code']);
      expect(splitIdentifier('value2Max')).toEqual(['value', '2', 'Max']);
      expect(splitIdentifier('max_value-x')).toEqual(['max', 'value', 'x']);
      expect(splitIdentifier('')).toEqual([]);
    });
  });

  describe('normalizeSearchText', () => {
    it('should lower case and remove diacritics', () => {
      expect(normalizeSearchText('Größe Äpfel')).toBe('grosse apfel');
    });
  });

  describe('tokenizeSearchQuery', () => {
    it('should split terms, keep quoted phrases and strip the legacy * prefix', () => {
      expect(tokenizeSearchQuery('  Capacity  "for exhaustion" *thresh ')).toEqual(['capacity', 'for exhaustion', 'thresh']);
      expect(tokenizeSearchQuery('')).toEqual([]);
      expect(tokenizeSearchQuery('x x')).toEqual(['x']);
    });

    it('should ignore stop words unless the query only consists of them', () => {
      expect(tokenizeSearchQuery('Capacity threshold for exhaustion')).toEqual(['capacity', 'threshold', 'exhaustion']);
      expect(tokenizeSearchQuery('Kapazität für die Batterie')).toEqual(['kapazitat', 'batterie']);
      expect(tokenizeSearchQuery('for')).toEqual(['for']);
    });
  });

  describe('FullTextSearchIndex', () => {
    const index = new FullTextSearchIndex([capacity, battery, exhaustionDate], fields);

    it('should find a term at the end of the element name', () => {
      expect(names(index.search('exhaustion'))).toContain('capacityThresholdExhaustion');
      expect(names(index.search('threshold'))).toContain('capacityThresholdExhaustion');
    });

    it('should be case insensitive', () => {
      expect(names(index.search('EXHAUSTION'))).toContain('capacityThresholdExhaustion');
    });

    it('should combine multiple terms with AND across name, preferredName and description', () => {
      expect(names(index.search('Capacity threshold for exhaustion'))).toEqual(['capacityThresholdExhaustion']);
      expect(names(index.search('threshold exhausted'))).toEqual(['capacityThresholdExhaustion']);
    });

    it('should return elements containing most terms if no element contains all of them', () => {
      const results = index.search('capacity exhaustion battery');
      expect(names(results)[0]).toBe('capacityThresholdExhaustion');
      expect(names(results).slice(1).sort()).toEqual(['BatteryPass', 'exhaustionDate']);
      expect(results.every(result => result.partial)).toBe(true);
    });

    it('should search preferred names and descriptions in all languages', () => {
      expect(names(index.search('kapazitätsschwelle'))).toEqual(['capacityThresholdExhaustion']);
      expect(names(index.search('produktpass'))).toEqual(['BatteryPass']);
      expect(names(index.search('digital product'))).toEqual(['BatteryPass']);
    });

    it('should rank name matches before preferred name and description matches', () => {
      const ranked = new FullTextSearchIndex<TestElement>(
        [{name: 'other', description: {en: 'passport'}}, {name: 'another', preferredName: {en: 'passport'}}, {name: 'passport'}],
        fields,
      );
      expect(names(ranked.search('passport'))).toEqual(['passport', 'another', 'other']);
    });

    it('should rank whole word matches before substring matches', () => {
      const ranked = new FullTextSearchIndex<TestElement>([{name: 'reexhaustionValue'}, {name: 'exhaustionValue'}], fields);
      expect(names(ranked.search('exhaustion'))).toEqual(['exhaustionValue', 'reexhaustionValue']);
    });

    it('should report which fields matched', () => {
      const [result] = index.search('produktpass');
      expect(result.matches).toEqual([
        {key: 'description', value: 'Digitaler Produktpass für Batterien.', lang: 'de', terms: ['produktpass']},
      ]);
      expect(result.fuzzy).toBe(false);
    });

    it('should return all elements for an empty query', () => {
      expect(index.search('   ').length).toBe(3);
    });

    it('should fall back to a fuzzy search for typos', () => {
      const results = index.search('exhaustoin');
      expect(names(results)).toContain('capacityThresholdExhaustion');
      expect(results.every(result => result.fuzzy)).toBe(true);
      expect(index.search('exhaustoin', {fuzzyFallback: false})).toEqual([]);
    });

    it('should not match unrelated text', () => {
      expect(index.search('zzzqqq')).toEqual([]);
    });

    it('should stay fast for large models', () => {
      const many = Array.from({length: 2000}, (_, i) => ({
        name: `element${i}CapacityThreshold`,
        description: {en: `Description number ${i} of a large aspect model`},
      }));
      const largeIndex = new FullTextSearchIndex(many, fields);
      const start = performance.now();
      const results = largeIndex.search('threshold large 1999');
      expect(performance.now() - start).toBeLessThan(500);
      expect(names(results)).toEqual(['element1999CapacityThreshold']);
    });
  });
});
