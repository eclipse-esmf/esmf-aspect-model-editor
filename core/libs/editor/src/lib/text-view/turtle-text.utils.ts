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

const PREFIX_DIRECTIVE = /^\s*(?:@prefix|PREFIX)\s+([A-Za-z][\w.-]*)?:\s*<([^>]*)>/gim;
const LOCAL_NAME = /^[\w-][\w.-]*$/;
const TOKEN_END = /[\s;,)\]]/;

/** Maps prefix aliases (empty string for the default prefix) to their namespace IRI. */
/** Validation messages that belong to one line of the Turtle text. */
export interface ViolationLine {
  line: number;
  messages: string[];
}

export function parseTurtlePrefixes(text: string): Record<string, string> {
  const prefixes: Record<string, string> = {};
  for (const [, alias, namespace] of (text ?? '').matchAll(PREFIX_DIRECTIVE)) {
    prefixes[alias ?? ''] = namespace;
  }
  return prefixes;
}

/** All spellings under which `urn` may appear in the Turtle text (`<urn>` or `prefix:local`). */
export function turtleNamesFor(urn: string, prefixes: Record<string, string>): string[] {
  if (!urn) {
    return [];
  }

  const names = [`<${urn}>`];
  for (const [alias, namespace] of Object.entries(prefixes)) {
    const localName = urn.startsWith(namespace) ? urn.slice(namespace.length) : null;
    if (localName && LOCAL_NAME.test(localName)) {
      names.push(`${alias}:${localName}`);
    }
  }
  return names;
}

function endsToken(line: string, index: number): boolean {
  if (index >= line.length) {
    return true;
  }
  const next = line[index];
  return TOKEN_END.test(next) || (next === '.' && (index + 1 >= line.length || /\s/.test(line[index + 1])));
}

/**
 * Finds the 1-based line on which the element `urn` is defined, i.e. where it starts a statement as subject.
 * Falls back to the first line that references it. Returns null if the element does not occur in the text.
 */
export function findElementLine(text: string, urn: string): number | null {
  const names = turtleNamesFor(urn, parseTurtlePrefixes(text));
  if (!text || !names.length) {
    return null;
  }

  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (names.some(name => line.startsWith(name) && endsToken(line, name.length))) {
      return i + 1;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('#')) {
      continue;
    }
    for (const name of names) {
      let index = line.indexOf(name);
      while (index !== -1) {
        const startsToken = index === 0 || /[\s(,;[]/.test(line[index - 1]);
        if (startsToken && endsToken(line, index + name.length)) {
          return i + 1;
        }
        index = line.indexOf(name, index + 1);
      }
    }
  }

  return null;
}
