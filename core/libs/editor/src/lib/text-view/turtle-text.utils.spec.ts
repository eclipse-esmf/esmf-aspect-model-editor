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
import {findElementLine, parseTurtlePrefixes, turtleNamesFor} from './turtle-text.utils';

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
});
