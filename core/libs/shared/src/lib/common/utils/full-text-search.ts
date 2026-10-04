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

import Fuse from 'fuse.js';

export type SearchFieldKey = 'name' | 'preferredName' | 'description' | 'urn';

export interface SearchField {
  key: SearchFieldKey;
  value: string;
  /** Language tag of multi-language values (preferredName, description). */
  lang?: string;
}

export interface SearchFieldMatch extends SearchField {
  /** The query terms which were found in this field. */
  terms: string[];
}

export interface FullTextSearchResult<T> {
  item: T;
  score: number;
  /** Fields that contributed to the match, best field first. */
  matches: SearchFieldMatch[];
  /** True if the result was only found by the typo tolerant fallback. */
  fuzzy: boolean;
  /** True if the result does not contain all search terms (only used when no element contains all of them). */
  partial: boolean;
}

const FIELD_WEIGHTS: Record<SearchFieldKey, number> = {
  name: 8,
  preferredName: 4,
  description: 2,
  urn: 1,
};

const MATCH_QUALITY = {exact: 3, prefix: 2, substring: 1};
const FUZZY_THRESHOLD = 0.3;

/** Filler words which are ignored as long as the query contains other terms, e.g. "Capacity threshold for exhaustion". */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'with',
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines', 'fur', 'mit', 'und', 'oder', 'von', 'zu', 'im', 'am',
]); // prettier-ignore

interface IndexedField extends SearchField {
  normalized: string;
  words: string[];
}

interface IndexedEntry<T> {
  item: T;
  fields: IndexedField[];
  fuzzyText: string;
}

/** Lower cases the text and removes diacritics, so that "Größe" can be found by "grosse" / "große". */
export function normalizeSearchText(text: string): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase();
}

/** Splits identifiers like "capacityThresholdExhaustion", "HTTPStatus2Code" or "max_value" into words. */
export function splitIdentifier(identifier: string): string[] {
  return (identifier ?? '')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Splits the query into terms. Whitespace separates terms, text in double quotes is kept as one phrase.
 * A leading "*" (legacy include-search syntax) is ignored because every term is matched as substring anyway.
 */
export function tokenizeSearchQuery(query: string): string[] {
  const terms: string[] = [];
  for (const [, phrase, word] of (query ?? '').matchAll(/"([^"]+)"|(\S+)/g)) {
    const term = normalizeSearchText((phrase ?? word).replace(/^\*+/, '')).trim();
    if (term) {
      terms.push(term);
    }
  }
  const unique = [...new Set(terms)];
  const significant = unique.filter(term => !STOP_WORDS.has(term));
  return significant.length ? significant : unique;
}

function wordsOf(field: SearchField): string[] {
  const parts = field.key === 'name' || field.key === 'urn' ? splitIdentifier(field.value) : field.value.split(/[^\p{L}\p{N}]+/u);
  return parts.map(normalizeSearchText).filter(Boolean);
}

function matchQuality(field: IndexedField, term: string): number {
  if (!field.normalized.includes(term)) {
    return 0;
  }
  if (field.normalized === term || field.words.includes(term)) {
    return MATCH_QUALITY.exact;
  }
  return field.words.some(word => word.startsWith(term)) || field.normalized.startsWith(term)
    ? MATCH_QUALITY.prefix
    : MATCH_QUALITY.substring;
}

/**
 * Full text index for model elements. Every search term must occur (as substring, case and accent insensitive) in at least
 * one of the indexed fields. Results are ranked by field weight (name > preferredName > description > urn) and match
 * quality (whole word > word prefix > substring). If no element contains all terms, the elements containing most of the
 * terms are returned (marked as partial). If nothing matches at all, a typo tolerant fuzzy search is used as fallback.
 */
export class FullTextSearchIndex<T> {
  private readonly entries: IndexedEntry<T>[];
  private fuse?: Fuse<IndexedEntry<T>>;

  constructor(items: T[], extractFields: (item: T) => SearchField[]) {
    this.entries = (items ?? []).filter(Boolean).map(item => {
      const fields = extractFields(item)
        .filter(field => !!field.value?.trim())
        .map(field => ({...field, normalized: normalizeSearchText(field.value), words: wordsOf(field)}));
      return {
        item,
        fields,
        fuzzyText: fields.map(field => `${field.words.join(' ')} ${field.normalized}`).join(' '),
      };
    });
  }

  get size(): number {
    return this.entries.length;
  }

  search(query: string, options: {fuzzyFallback?: boolean} = {}): FullTextSearchResult<T>[] {
    const terms = tokenizeSearchQuery(query);
    if (!terms.length) {
      return this.entries.map(entry => ({item: entry.item, score: 0, matches: [], fuzzy: false, partial: false}));
    }

    const evaluated = this.entries.map(entry => this.matchEntry(entry, terms)).filter(result => result.matchedTermCount > 0);

    const complete = evaluated.filter(result => result.matchedTermCount === terms.length);
    if (complete.length) {
      return this.sortByScore(complete).map(result => result.result);
    }

    // No element contains all terms: show the elements containing most of them, so that searches with
    // terms the model does not use (e.g. during a gap analysis) still return the closest elements.
    if (terms.length > 1 && evaluated.length) {
      return evaluated
        .sort((a, b) => b.matchedTermCount - a.matchedTermCount || b.result.score - a.result.score)
        .map(({result}) => ({...result, partial: true}));
    }

    return options.fuzzyFallback === false ? [] : this.fuzzySearch(terms);
  }

  private sortByScore(results: {result: FullTextSearchResult<T>}[]) {
    return [...results].sort((a, b) => b.result.score - a.result.score);
  }

  private matchEntry(entry: IndexedEntry<T>, terms: string[]): {result: FullTextSearchResult<T>; matchedTermCount: number} {
    const matchedTerms = new Map<IndexedField, string[]>();
    let score = 0;
    let matchedTermCount = 0;

    for (const term of terms) {
      let best = 0;
      for (const field of entry.fields) {
        const quality = matchQuality(field, term);
        if (!quality) {
          continue;
        }
        matchedTerms.set(field, [...(matchedTerms.get(field) ?? []), term]);
        best = Math.max(best, quality * FIELD_WEIGHTS[field.key]);
      }
      if (best) {
        matchedTermCount++;
        score += best;
      }
    }

    return {
      result: {item: entry.item, score, matches: this.toMatches(matchedTerms), fuzzy: false, partial: false},
      matchedTermCount,
    };
  }

  private fuzzySearch(terms: string[]): FullTextSearchResult<T>[] {
    this.fuse ??= new Fuse(this.entries, {
      keys: ['fuzzyText'],
      ignoreLocation: true,
      includeScore: true,
      threshold: FUZZY_THRESHOLD,
      useExtendedSearch: true,
    });

    // Extended search: whitespace separated terms are combined with AND, every term is matched fuzzy.
    const fuseQuery = terms
      .map(term => term.replace(/[\s|'!^=$"]/g, ''))
      .filter(Boolean)
      .join(' ');
    if (!fuseQuery) {
      return [];
    }

    return this.fuse.search(fuseQuery).map(({item, score}) => ({
      item: item.item,
      score: 1 - (score ?? 1),
      matches: [],
      fuzzy: true,
      partial: false,
    }));
  }

  private toMatches(matchedTerms: Map<IndexedField, string[]>): SearchFieldMatch[] {
    return [...matchedTerms.entries()]
      .map(([{key, value, lang}, terms]) => ({key, value, lang, terms}))
      .sort((a, b) => FIELD_WEIGHTS[b.key] - FIELD_WEIGHTS[a.key]);
  }
}
