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

interface StatementRange {
  start: number;
  end: number;
}

export interface TurtleStatement {
  text: string;
  /** The expanded IRI of the subject, `null` for directives, blank nodes or unknown prefixes. */
  subject: string | null;
  directive: boolean;
}

const DIRECTIVE = /^(@prefix|@base|PREFIX\b|BASE\b)/i;
const PREFIX_DIRECTIVE = /^(?:@prefix|PREFIX)\s+([^\s:]*):\s*<([^>]*)>/i;
const PREFIXED_NAME = /^([A-Za-z][\w.-]*)?:((?:[^\s;,()[\]"'<>\\]|\\.)*)/;

/**
 * Finds the top level statements of a Turtle document. Strings, IRIs, comments and nested blank nodes/lists are respected.
 * Returns `null` when the document can not be split reliably.
 */
export function findTurtleStatements(text: string): StatementRange[] | null {
  const ranges: StatementRange[] = [];
  const length = text.length;
  let depth = 0;
  let start = -1;
  let i = 0;

  while (i < length) {
    const char = text[i];

    if (char === '#') {
      const lineEnd = text.indexOf('\n', i);
      i = lineEnd < 0 ? length : lineEnd + 1;
      continue;
    }
    if (start < 0) {
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      start = i;
    }

    if (char === '<') {
      const close = text.indexOf('>', i + 1);
      if (close < 0) return null;
      i = close + 1;
      continue;
    }
    if (char === '"' || char === "'") {
      const end = findStringEnd(text, i);
      if (end < 0) return null;
      i = end;
      continue;
    }
    if (char === '[' || char === '(') depth++;
    if (char === ']' || char === ')') depth--;
    if (depth < 0) return null;

    if (char === '.' && depth === 0 && (i + 1 === length || /[\s#]/.test(text[i + 1]))) {
      ranges.push({start, end: i + 1});
      start = -1;
    }
    i++;
  }

  return start < 0 && depth === 0 ? ranges : null;
}

function findStringEnd(text: string, start: number): number {
  const quote = text[start];
  const triple = quote.repeat(3);
  if (text.startsWith(triple, start)) {
    let i = start + 3;
    while (i < text.length) {
      if (text[i] === '\\') {
        i += 2;
      } else if (text.startsWith(triple, i)) {
        let end = i + 3;
        // quotes directly before the closing triple quote belong to the content
        while (text[end] === quote) end++;
        return end;
      } else {
        i++;
      }
    }
    return -1;
  }

  let i = start + 1;
  while (i < text.length) {
    const char = text[i];
    if (char === '\\') {
      i += 2;
    } else if (char === quote) {
      return i + 1;
    } else if (char === '\n') {
      return -1;
    } else {
      i++;
    }
  }
  return -1;
}

/** Splits a Turtle document into its top level statements and resolves their subjects. */
export function parseTurtleStatements(text: string): {ranges: StatementRange[]; statements: TurtleStatement[]} | null {
  const ranges = findTurtleStatements(text);
  if (!ranges) return null;

  const prefixes = new Map<string, string>();
  const statements = ranges.map(range => {
    const statementText = text.slice(range.start, range.end);
    if (DIRECTIVE.test(statementText)) {
      const prefix = statementText.match(PREFIX_DIRECTIVE);
      if (prefix) prefixes.set(prefix[1], prefix[2]);
      return {text: statementText, subject: null, directive: true};
    }
    return {text: statementText, subject: resolveSubject(statementText, prefixes), directive: false};
  });

  return {ranges, statements};
}

function resolveSubject(statement: string, prefixes: Map<string, string>): string | null {
  if (statement.startsWith('<')) {
    const close = statement.indexOf('>');
    return close > 0 ? statement.slice(1, close) : null;
  }
  const prefixedName = statement.match(PREFIXED_NAME);
  if (!prefixedName) return null;

  const namespace = prefixes.get(prefixedName[1] ?? '');
  return namespace === undefined ? null : namespace + prefixedName[2].replace(/\\(.)/g, '$1');
}

/**
 * Reorders the top level statements of a formatted Turtle document so that their subjects follow the given order.
 * Formatting inside the statements and the whitespace between them are kept. Statements with unknown subjects
 * stay behind their predecessor. The text is returned unchanged if it can not be parsed or contains directives
 * between statements.
 */
export function reorderTurtleStatements(text: string, order: string[]): string {
  const parsed = parseTurtleStatements(text);
  if (!parsed || !order.length) return text;

  const {ranges, statements} = parsed;
  const firstBody = statements.findIndex(statement => !statement.directive);
  if (firstBody < 0 || statements.slice(firstBody).some(statement => statement.directive)) {
    return text;
  }

  const positions = new Map(order.map((iri, index) => [iri, index]));
  let previousKey = -1;
  const body = statements.slice(firstBody).map((statement, index) => {
    const position = statement.subject !== null ? positions.get(statement.subject) : undefined;
    const key = position ?? previousKey;
    previousKey = key;
    return {statement, key, index};
  });

  const sorted = [...body].sort((a, b) => a.key - b.key || a.index - b.index);
  if (sorted.every((entry, index) => entry.index === index)) {
    return text;
  }

  const bodyRanges = ranges.slice(firstBody);
  const gaps = bodyRanges.slice(1).map((range, index) => text.slice(bodyRanges[index].end, range.start));
  let result = text.slice(0, bodyRanges[0].start);
  sorted.forEach((entry, index) => {
    result += entry.statement.text + (index < gaps.length ? gaps[index] : '');
  });
  return result + text.slice(bodyRanges[bodyRanges.length - 1].end);
}
