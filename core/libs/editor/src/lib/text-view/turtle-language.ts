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

import {foldService, HighlightStyle, StreamLanguage, StreamParser, StringStream, syntaxHighlighting} from '@codemirror/language';
import {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {Tag, tags} from '@lezer/highlight';

type Position = 'subject' | 'predicate' | 'object';

export interface TurtleState {
  expect: Position;
  directive: boolean;
  datatype: boolean;
  /** Style of the local part following an already consumed prefix (e.g. `samm:` of `samm:Aspect`). */
  pendingLocal: string | null;
  /** Closing delimiter of an open multi-line string (`"""` or `'''`). */
  longQuote: string | null;
  brackets: string;
}

const LOCAL_NAME = /^[\w-](?:[\w.-]*[\w-])?/;
const PREFIX = /^(?:[A-Za-z][\w.-]*)?:/;
const NUMBER = /^[+-]?(?:\d*\.\d+(?:e[+-]?\d+)?|\d+e[+-]?\d+|\d+)(?![\w:])/i;

function nameStyle(state: TurtleState): string {
  if (state.directive) return 'namespace';
  if (state.datatype) return 'typeName';
  switch (state.expect) {
    case 'subject':
      return 'definition';
    case 'predicate':
      return 'propertyName';
    default:
      return 'variableName';
  }
}

/** Advances the subject → predicate → object position after a term was read. */
function termRead(state: TurtleState): void {
  if (state.directive) return;
  if (state.datatype) {
    state.datatype = false;
    return;
  }
  if (state.expect === 'subject') state.expect = 'predicate';
  else if (state.expect === 'predicate') state.expect = 'object';
}

function readLongString(stream: StringStream, state: TurtleState): string {
  while (!stream.eol()) {
    if (stream.match(state.longQuote)) {
      state.longQuote = null;
      termRead(state);
      return 'string';
    }
    if (stream.next() === '\\') stream.next();
  }
  return 'string';
}

function readString(stream: StringStream, state: TurtleState, quote: string): string {
  let ch: string | void;
  while ((ch = stream.next()) != null) {
    if (ch === '\\') stream.next();
    else if (ch === quote) break;
  }
  termRead(state);
  return 'string';
}

function readPunctuation(stream: StringStream, state: TurtleState): string | null {
  const ch = stream.next();
  switch (ch) {
    case '.':
      state.directive = false;
      state.expect = 'subject';
      state.brackets = '';
      return 'punctuation';
    case ';':
      state.expect = 'predicate';
      return 'punctuation';
    case ',':
      state.expect = 'object';
      return 'punctuation';
    case '[':
      state.brackets += '[';
      state.expect = 'predicate';
      return 'bracket';
    case '(':
      state.brackets += '(';
      state.expect = 'object';
      return 'bracket';
    case ']':
    case ')':
      state.brackets = state.brackets.slice(0, -1);
      state.expect = 'object';
      return 'bracket';
    default:
      return null;
  }
}

export const turtleParser: StreamParser<TurtleState> = {
  name: 'turtle',
  startState: () => ({
    expect: 'subject',
    directive: false,
    datatype: false,
    pendingLocal: null,
    longQuote: null,
    brackets: '',
  }),
  token(stream, state) {
    if (state.longQuote) {
      return readLongString(stream, state);
    }

    if (state.pendingLocal) {
      const style = state.pendingLocal;
      state.pendingLocal = null;
      if (stream.match(LOCAL_NAME)) {
        termRead(state);
        return style;
      }
      termRead(state);
    }

    if (stream.eatSpace()) return null;

    const ch = stream.peek();

    if (ch === '#') {
      stream.skipToEnd();
      return 'comment';
    }

    const longQuote = stream.match(/^"""|^'''/);
    if (longQuote) {
      state.longQuote = (longQuote as RegExpMatchArray)[0];
      return readLongString(stream, state);
    }

    if (ch === '"' || ch === "'") {
      stream.next();
      return readString(stream, state, ch);
    }

    if (stream.match(/^@(?:prefix|base)\b/) || (state.expect === 'subject' && stream.match(/^(?:PREFIX|BASE)\b/i))) {
      state.directive = true;
      return 'keyword';
    }

    if (stream.match(/^@[a-zA-Z]+(?:-[a-zA-Z0-9]+)*/)) return 'labelName';

    if (stream.match('^^')) {
      state.datatype = true;
      return 'operator';
    }

    if (stream.match(/^<[^>\s]*>/)) {
      termRead(state);
      return 'url';
    }

    if (stream.match(/^_:[\w-](?:[\w.-]*[\w-])?/)) {
      termRead(state);
      return 'blankNode';
    }

    if (stream.match(NUMBER)) {
      termRead(state);
      return 'number';
    }

    if (stream.match(/^(?:true|false)\b/)) {
      termRead(state);
      return 'bool';
    }

    if (state.expect === 'predicate' && !state.directive && stream.match(/^a(?=[\s<[("'_:]|$)/)) {
      termRead(state);
      return 'keyword';
    }

    if (stream.match(PREFIX)) {
      const style = nameStyle(state);
      if (state.directive) return 'namespace';
      if (LOCAL_NAME.test(stream.string.slice(stream.pos))) state.pendingLocal = style;
      else termRead(state);
      return 'namespace';
    }

    return readPunctuation(stream, state);
  },
  languageData: {
    commentTokens: {line: '#'},
  },
  tokenTable: {
    comment: tags.lineComment,
    string: tags.string,
    keyword: tags.keyword,
    labelName: tags.labelName,
    operator: tags.operator,
    url: tags.url,
    blankNode: tags.special(tags.variableName),
    number: tags.number,
    bool: tags.bool,
    namespace: tags.namespace,
    definition: tags.definition(tags.variableName),
    propertyName: tags.propertyName,
    variableName: tags.variableName,
    typeName: tags.typeName,
    punctuation: tags.punctuation,
    bracket: tags.bracket,
  } as Record<string, Tag>,
};

export const turtleLanguage = StreamLanguage.define(turtleParser);

export const turtleHighlightStyle = HighlightStyle.define([
  {tag: tags.lineComment, color: 'var(--ame-tv-comment)', fontStyle: 'italic'},
  {tag: tags.string, color: 'var(--ame-tv-string)'},
  {tag: tags.keyword, color: 'var(--ame-tv-keyword)', fontWeight: '600'},
  {tag: tags.labelName, color: 'var(--ame-tv-language)'},
  {tag: tags.url, color: 'var(--ame-tv-iri)'},
  {tag: [tags.number, tags.bool], color: 'var(--ame-tv-number)'},
  {tag: tags.namespace, color: 'var(--ame-tv-prefix)'},
  {tag: tags.definition(tags.variableName), color: 'var(--ame-tv-subject)', fontWeight: '600'},
  {tag: tags.propertyName, color: 'var(--ame-tv-predicate)'},
  {tag: tags.variableName, color: 'var(--ame-tv-object)'},
  {tag: tags.special(tags.variableName), color: 'var(--ame-tv-blank-node)'},
  {tag: tags.typeName, color: 'var(--ame-tv-datatype)'},
  {tag: [tags.operator, tags.punctuation, tags.bracket], color: 'var(--ame-tv-punctuation)'},
]);

/** Folds a statement starting in column 0 together with its indented continuation lines. */
export const turtleStatementFolding = foldService.of((state, lineStart) => {
  const line = state.doc.lineAt(lineStart);
  if (!line.text.trim() || /^[\s#@]/.test(line.text) || /^(?:PREFIX|BASE)\b/i.test(line.text)) {
    return null;
  }

  let last = line;
  while (last.number < state.doc.lines) {
    const next = state.doc.line(last.number + 1);
    if (!next.text.trim() || !/^\s/.test(next.text)) break;
    last = next;
  }

  return last.number > line.number ? {from: line.to, to: last.to} : null;
});

const MONOSPACE_FONT = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const turtleEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    color: 'var(--ame-font)',
    backgroundColor: 'var(--ame-surface)',
  },
  '&.cm-focused': {outline: 'none'},
  '.cm-scroller': {fontFamily: MONOSPACE_FONT, lineHeight: '1.6'},
  // The application sets a font on every element (`* {font-family: Roboto}`), so inheritance is not enough.
  '.cm-content, .cm-content *, .cm-gutters, .cm-gutters *': {fontFamily: MONOSPACE_FONT},
  '.cm-content': {caretColor: 'var(--ame-font)', padding: '8px 0'},
  '.cm-gutters': {
    backgroundColor: 'var(--ame-surface-card)',
    color: 'var(--ame-gray-600)',
    borderRight: '1px solid var(--ame-gray-10)',
  },
  '.cm-lineNumbers .cm-gutterElement': {padding: '0 12px 0 16px', minWidth: '32px'},
  '.cm-activeLine': {backgroundColor: 'var(--ame-tv-active-line)'},
  '.cm-activeLineGutter': {backgroundColor: 'var(--ame-tv-active-line)', color: 'var(--ame-font)'},
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {backgroundColor: 'var(--ame-tv-selection)'},
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--ame-surface-card)',
    border: '1px solid var(--ame-gray-10)',
    color: 'var(--ame-gray-600)',
  },
  '.cm-searchMatch': {backgroundColor: 'var(--ame-tv-search-match)', outline: '1px solid var(--ame-tv-search-outline)'},
  '.cm-searchMatch.cm-searchMatch-selected': {backgroundColor: 'var(--ame-tv-search-selected)'},
  '.cm-panels': {backgroundColor: 'var(--ame-surface-card)', color: 'var(--ame-font)'},
  '.cm-panels.cm-panels-top': {borderBottom: '1px solid var(--ame-gray-10)'},
  '.cm-panel input, .cm-panel button': {color: 'inherit'},
  '.cm-ame-target-line': {backgroundColor: 'var(--ame-tv-target-line)'},
  '.cm-lintRange-error': {backgroundColor: 'var(--ame-tv-problem)'},
  '.cm-tooltip.cm-tooltip-lint': {
    backgroundColor: 'var(--ame-surface-card)',
    color: 'var(--ame-font)',
    border: '1px solid var(--ame-gray-10)',
  },
  '.cm-diagnostic-error': {borderLeftColor: 'var(--ame-error)', whiteSpace: 'pre-wrap', maxWidth: '640px'},
});

/** Language support for Turtle documents: tokenizer, highlighting and statement folding. */
export function turtle(): Extension[] {
  return [turtleLanguage, syntaxHighlighting(turtleHighlightStyle), turtleStatementFolding];
}
