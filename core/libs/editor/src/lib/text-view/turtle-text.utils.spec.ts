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
import {
  findElementLine,
  findElementOccurrences,
  findElementRange,
  lineAt,
  maskTurtleText,
  parseTurtlePrefixes,
  turtleNamesFor,
} from './turtle-text.utils';

const NS = 'urn:samm:org.eclipse.examples:1.0.0#';

const MODEL = `# Copyright header
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix : <${NS}> .

:Movement a samm:Aspect ;
   samm:properties ( :isMoving :speed ) ;
   samm:operations ( ) .

:isMoving a samm:Property ;
   samm:characteristic samm-c:Boolean .

<urn:samm:org.other:1.0.0#External> a samm:Property .

:speed a samm:Property ;
   samm:description "Speed of :isMoving"@en ;
   samm:characteristic :SpeedCharacteristic .
`;

describe('turtle-text.utils', () => {
  it('parses @prefix directives including the default prefix', () => {
    expect(parseTurtlePrefixes(MODEL)).toEqual({
      samm: 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#',
      'samm-c': 'urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#',
      '': NS,
    });
  });

  it('parses SPARQL style PREFIX directives', () => {
    expect(parseTurtlePrefixes('PREFIX ex: <http://example.org/>')).toEqual({ex: 'http://example.org/'});
  });

  it('builds the full IRI and prefixed spellings of an URN', () => {
    expect(turtleNamesFor(`${NS}speed`, parseTurtlePrefixes(MODEL))).toEqual([`<${NS}speed>`, ':speed']);
    expect(turtleNamesFor('', {})).toEqual([]);
  });

  it('finds the line on which an element is defined', () => {
    expect(findElementLine(MODEL, `${NS}Movement`)).toBe(6);
    expect(findElementLine(MODEL, `${NS}isMoving`)).toBe(10);
    expect(findElementLine(MODEL, `${NS}speed`)).toBe(15);
  });

  it('finds elements written as full IRI', () => {
    expect(findElementLine(MODEL, 'urn:samm:org.other:1.0.0#External')).toBe(13);
  });

  it('falls back to the first reference when the element is not defined in the file', () => {
    expect(findElementLine(MODEL, `${NS}SpeedCharacteristic`)).toBe(17);
  });

  it('does not match names that only share a prefix or occur inside literals', () => {
    expect(findElementLine(MODEL, `${NS}speedLimit`)).toBeNull();
    expect(findElementLine(MODEL, `${NS}spe`)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(findElementLine('', `${NS}speed`)).toBeNull();
    expect(findElementLine(MODEL, '')).toBeNull();
  });

  describe('findElementOccurrences', () => {
    const text = (...lines: string[]) => [`@prefix : <${NS}> .`, '@prefix ext: <urn:samm:org.ext:1.0.0#> .', ...lines].join('\n');
    const found = (content: string, urn: string) => findElementOccurrences(content, urn).map(({from, to}) => content.slice(from, to));

    it('finds prefixed, default prefixed and full IRI spellings', () => {
      const content = text(':A :p ext:B ;', '   :q <urn:samm:org.ext:1.0.0#B> .');
      expect(found(content, 'urn:samm:org.ext:1.0.0#B')).toEqual(['ext:B', '<urn:samm:org.ext:1.0.0#B>']);
      expect(found(content, `${NS}A`)).toEqual([':A']);
    });

    it('finds every reference in lists and before punctuation', () => {
      const content = text(':A :p ( ext:B ext:C ) ;', '   :q ext:B, ext:B ;', '   :r ext:B .', ':D :p [ :x ext:B ] .');
      const occurrences = findElementOccurrences(content, 'urn:samm:org.ext:1.0.0#B');
      expect(occurrences.length).toBe(5);
      expect(occurrences.map(({from}) => from)).toEqual([...occurrences.map(({from}) => from)].sort((a, b) => a - b));
      expect(occurrences.every(({from, to}) => content.slice(from, to) === 'ext:B')).toBe(true);
    });

    it('ignores comments, string literals and names that only share a prefix', () => {
      const content = text(
        '# ext:B is missing',
        ':A :p ext:BB ;',
        '   :q "ext:B" ;',
        "   :r 'ext:B' ;",
        '   :s """multi',
        'ext:B',
        'line""" ;',
        '   :t ext:B . # ext:B',
      );
      expect(found(content, 'urn:samm:org.ext:1.0.0#B')).toEqual(['ext:B']);
      expect(lineAt(content, findElementOccurrences(content, 'urn:samm:org.ext:1.0.0#B')[0].from)).toBe(10);
    });

    it('keeps IRIs containing # and escaped quotes intact', () => {
      const content = text(':A :p "say \\"ext:B\\"" ;', '   :q <urn:samm:org.ext:1.0.0#B> .');
      expect(found(content, 'urn:samm:org.ext:1.0.0#B')).toEqual(['<urn:samm:org.ext:1.0.0#B>']);
    });

    it('returns nothing for unknown elements or empty input', () => {
      expect(findElementOccurrences(text(':A :p :q .'), `${NS}missing`)).toEqual([]);
      expect(findElementOccurrences('', `${NS}A`)).toEqual([]);
      expect(findElementOccurrences(text(':A :p :q .'), '')).toEqual([]);
    });
  });

  describe('findElementRange', () => {
    it('prefers the definition over earlier references', () => {
      const range = findElementRange(MODEL, `${NS}speed`);
      expect(MODEL.slice(range.from, range.to)).toBe(':speed');
      expect(lineAt(MODEL, range.from)).toBe(findElementLine(MODEL, `${NS}speed`));
      expect(MODEL[range.from - 1]).toBe('\n');
    });

    it('falls back to the first reference', () => {
      const content = `@prefix : <${NS}> .\n:A :p :B .`;
      expect(findElementRange(content, `${NS}B`)).toEqual({from: content.lastIndexOf(':B'), to: content.lastIndexOf(':B') + 2});
    });
  });

  describe('maskTurtleText', () => {
    it('blanks comments and strings but keeps offsets and line breaks', () => {
      const content = '# c\n:A :p "x" , \'y\' ; # d\n:q """a\nb""" .';
      const masked = maskTurtleText(content);
      expect(masked.length).toBe(content.length);
      expect(masked.split('\n').length).toBe(content.split('\n').length);
      expect(masked).not.toMatch(/[#"'xyabcd]/);
      expect(masked).toContain(':A :p');
    });

    it('stops unterminated single line strings at the line end', () => {
      expect(maskTurtleText(':A :p "open\n:B :q :C .').split('\n')[1]).toBe(':B :q :C .');
    });
  });

  it('computes 1-based line numbers of offsets', () => {
    expect(lineAt('a\nb\nc', 0)).toBe(1);
    expect(lineAt('a\nb\nc', 2)).toBe(2);
    expect(lineAt('a\nb\nc', 4)).toBe(3);
  });
});
