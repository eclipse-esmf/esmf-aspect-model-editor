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
import {findTurtleStatements, parseTurtleStatements, reorderTurtleStatements} from './turtle-statement-order';

const NS = 'urn:samm:org.example:1.0.0#';

const FORMATTED = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix : <${NS}> .

:MyAspect a samm:Aspect ;
   samm:properties ( :zeta :alpha ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:AlphaChar a samm:Characteristic ;
   samm:description """A text with an empty line

and a dot. at the end."""@en ;
   samm:dataType xsd:string .

:alpha a samm:Property ;
   samm:characteristic :AlphaChar .

:zeta a samm:Property ;
   samm:see <http://example.com/#anchor> ;
   samm:characteristic [ a samm:Characteristic ; samm:dataType xsd:string ] .
`;

describe('turtle statement order', () => {
  it('should split the document into top level statements', () => {
    const parsed = parseTurtleStatements(FORMATTED);

    expect(parsed?.statements.map(statement => statement.subject)).toEqual([
      null,
      null,
      `${NS}MyAspect`,
      `${NS}AlphaChar`,
      `${NS}alpha`,
      `${NS}zeta`,
    ]);
    expect(parsed?.statements[3].text).toContain('and a dot. at the end."""@en');
  });

  it('should reorder the statements and keep their formatting', () => {
    const result = reorderTurtleStatements(FORMATTED, [`${NS}MyAspect`, `${NS}zeta`, `${NS}alpha`, `${NS}AlphaChar`]);

    const subjects = parseTurtleStatements(result)?.statements.map(statement => statement.subject);
    expect(subjects).toEqual([null, null, `${NS}MyAspect`, `${NS}zeta`, `${NS}alpha`, `${NS}AlphaChar`]);
    expect(result.startsWith('@prefix samm:')).toBe(true);
    expect(result.endsWith('samm:dataType xsd:string .\n')).toBe(true);
    expect(result).toContain(':zeta a samm:Property ;\n   samm:see <http://example.com/#anchor> ;');
    expect(result.length).toBe(FORMATTED.length);
  });

  it('should return the text unchanged when it is already ordered', () => {
    const order = [`${NS}MyAspect`, `${NS}AlphaChar`, `${NS}alpha`, `${NS}zeta`];
    expect(reorderTurtleStatements(FORMATTED, order)).toBe(FORMATTED);
  });

  it('should keep unknown statements behind their predecessor', () => {
    const text = `@prefix : <${NS}> .\n\n:b a :X .\n\n[] a :Anonymous .\n\n:a a :X .\n`;
    expect(reorderTurtleStatements(text, [`${NS}a`, `${NS}b`])).toBe(
      `@prefix : <${NS}> .\n\n:a a :X .\n\n:b a :X .\n\n[] a :Anonymous .\n`,
    );
  });

  it('should resolve full IRIs and other prefixes', () => {
    const text = `@prefix ex: <http://example.com#> .\n\n<http://example.com#b> a ex:X .\nex:a a ex:X .\n`;
    expect(reorderTurtleStatements(text, ['http://example.com#a', 'http://example.com#b'])).toBe(
      `@prefix ex: <http://example.com#> .\n\nex:a a ex:X .\n<http://example.com#b> a ex:X .\n`,
    );
  });

  it('should not touch documents which can not be split reliably', () => {
    expect(findTurtleStatements(':a :b "unterminated .')).toBeNull();
    expect(reorderTurtleStatements(':b a :X .\n:a a :X', ['a', 'b'])).toBe(':b a :X .\n:a a :X');
    const withLateDirective = `@prefix : <${NS}> .\n:b a :X .\n@prefix ex: <http://example.com#> .\n:a a :X .\n`;
    expect(reorderTurtleStatements(withLateDirective, [`${NS}a`, `${NS}b`])).toBe(withLateDirective);
  });

  it('should ignore dots in comments, decimals and prefixed names', () => {
    const text = `@prefix : <${NS}> .\n# comment. with dot\n:b :value 1.5 ; :ref :x.y .\n:a :value "x" .\n`;
    expect(findTurtleStatements(text)?.length).toBe(3);
    expect(reorderTurtleStatements(text, [`${NS}a`, `${NS}b`])).toBe(
      `@prefix : <${NS}> .\n# comment. with dot\n:a :value "x" .\n:b :value 1.5 ; :ref :x.y .\n`,
    );
  });
});
