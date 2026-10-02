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

import {foldService, StringStream} from '@codemirror/language';
import {EditorState} from '@codemirror/state';
import {describe, expect, it} from 'vitest';
import {turtleParser, TurtleState, turtleStatementFolding} from './turtle-language';

type Token = [string, string];

function tokenize(text: string): Token[][] {
  const state: TurtleState = turtleParser.startState(2);
  return text.split('\n').map(line => {
    const stream = new StringStream(line, 2, 2);
    const tokens: Token[] = [];
    while (!stream.eol()) {
      const style = turtleParser.token(stream, state);
      const value = stream.current();
      if (style && value.trim()) {
        tokens.push([value, style]);
      }
      stream.start = stream.pos;
    }
    return tokens;
  });
}

describe('turtleParser', () => {
  it('highlights prefix directives', () => {
    const [line] = tokenize('@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .');
    expect(line).toEqual([
      ['@prefix', 'keyword'],
      ['samm-c:', 'namespace'],
      ['<urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#>', 'url'],
      ['.', 'punctuation'],
    ]);
  });

  it('distinguishes subject, predicate and object of a statement', () => {
    const lines = tokenize([':Movement a samm:Aspect ;', '   samm:properties ( :isMoving ) .'].join('\n'));

    expect(lines[0]).toEqual([
      [':', 'namespace'],
      ['Movement', 'definition'],
      ['a', 'keyword'],
      ['samm:', 'namespace'],
      ['Aspect', 'variableName'],
      [';', 'punctuation'],
    ]);
    expect(lines[1]).toEqual([
      ['samm:', 'namespace'],
      ['properties', 'propertyName'],
      ['(', 'bracket'],
      [':', 'namespace'],
      ['isMoving', 'variableName'],
      [')', 'bracket'],
      ['.', 'punctuation'],
    ]);
  });

  it('highlights literals with language tags and datatypes', () => {
    const lines = tokenize(':speed samm:description "Speed in km/h"@en ;\n   samm:exampleValue "12.5"^^xsd:float ; samm:value 42 , true .');

    expect(lines[0]).toContainEqual(['"Speed in km/h"', 'string']);
    expect(lines[0]).toContainEqual(['@en', 'labelName']);
    expect(lines[1]).toEqual(
      expect.arrayContaining([
        ['"12.5"', 'string'],
        ['^^', 'operator'],
        ['xsd:', 'namespace'],
        ['float', 'typeName'],
        ['42', 'number'],
        ['true', 'bool'],
      ]),
    );
  });

  it('keeps long strings across lines', () => {
    const lines = tokenize(':a samm:description """first\nsecond""" .\n:b a samm:Property .');

    expect(lines[0]).toContainEqual(['"""first', 'string']);
    expect(lines[1]).toEqual([
      ['second"""', 'string'],
      ['.', 'punctuation'],
    ]);
    expect(lines[2][1]).toEqual(['b', 'definition']);
  });

  it('treats properties of blank nodes as predicates', () => {
    const [line] = tokenize(':a samm:properties ( [ samm:property :b ; samm:optional true ] ) .');

    expect(line).toEqual(
      expect.arrayContaining([
        ['property', 'propertyName'],
        ['b', 'variableName'],
        ['optional', 'propertyName'],
      ]),
    );
  });

  it('highlights comments, uppercase names and blank node labels correctly', () => {
    const lines = tokenize('# A comment\n:Entity a samm:Entity ; samm:see _:b0 .');

    expect(lines[0]).toEqual([['# A comment', 'comment']]);
    expect(lines[1]).toContainEqual(['Entity', 'definition']);
    expect(lines[1]).toContainEqual(['_:b0', 'blankNode']);
  });
});

describe('turtleStatementFolding', () => {
  const doc = [
    '@prefix : <urn:samm:org.example:1.0.0#> .',
    '',
    ':A a samm:Aspect ;',
    '   samm:properties ( ) ;',
    '   samm:operations ( ) .',
    '',
    ':B a samm:Property .',
  ].join('\n');
  const state = EditorState.create({doc, extensions: [turtleStatementFolding]});
  const foldAt = (lineNumber: number) => {
    const line = state.doc.line(lineNumber);
    for (const service of state.facet(foldService)) {
      const range = service(state, line.from, line.to);
      if (range) return range;
    }
    return null;
  };

  it('folds a statement with its indented continuation lines', () => {
    expect(foldAt(3)).toEqual({from: state.doc.line(3).to, to: state.doc.line(5).to});
  });

  it('does not fold prefixes, continuation lines or single line statements', () => {
    expect(foldAt(1)).toBeNull();
    expect(foldAt(4)).toBeNull();
    expect(foldAt(7)).toBeNull();
  });
});
