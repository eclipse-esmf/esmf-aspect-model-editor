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

/** Anything which knows its current IRI, e.g. a model element which can be renamed. */
export interface SubjectReference {
  aspectModelUrn?: string;
}

interface SubjectOrderEntry {
  iri: string;
  element?: SubjectReference;
}

/**
 * Information about the textual form of an Aspect Model file which is not part of the RDF semantics
 * but is needed to write the file back as close as possible to its original form.
 */
export class SerializationMetadata {
  /**
   * The comment block at the top of the source file, including a trailing empty line when the file had one.
   * `null` means that the model was not loaded from a file, so the configured default header is used.
   */
  headerComments: string[] | null = null;

  /** Prefixes which are written even when no statement uses them (declared in the source file or added by the user). */
  private readonly explicitPrefixes = new Set<string>();

  /** Named subjects in the order in which they are written to the file. */
  private subjectOrder: SubjectOrderEntry[] = [];
  private readonly recordedSubjects = new Set<string>();

  /**
   * Extracts the leading comment block of a Turtle document.
   * Blank lines inside the block are kept, a single trailing blank line marks the separation from the content.
   */
  static extractHeaderComments(content: string): string[] {
    const header: string[] = [];
    for (const rawLine of (content ?? '').split('\n')) {
      const line = rawLine.replace(/\r$/, '');
      if (line.trim() === '') {
        if (header.length) {
          header.push('');
        }
        continue;
      }
      if (!line.trimStart().startsWith('#')) {
        break;
      }
      header.push(line);
    }

    while (header.length > 1 && header[header.length - 1] === '' && header[header.length - 2] === '') {
      header.pop();
    }
    return header;
  }

  /** Prepends the header to the content unless the content already starts with it. */
  static applyHeader(content: string, header: string[]): string {
    const comments = header.filter(line => line !== '');
    if (!comments.length) {
      return content;
    }

    const headerText = header.join('\n').replace(/\n+$/, '');
    if (content.trimStart().startsWith(headerText)) {
      return content;
    }
    const separator = header[header.length - 1] === '' ? '\n\n' : '\n';
    return `${headerText}${separator}${content.replace(/^\n+/, '')}`;
  }

  isExplicitPrefix(alias: string): boolean {
    return this.explicitPrefixes.has(alias);
  }

  markPrefixExplicit(alias: string): void {
    this.explicitPrefixes.add(alias);
  }

  unmarkPrefixExplicit(alias: string): void {
    this.explicitPrefixes.delete(alias);
  }

  renameExplicitPrefix(oldAlias: string, newAlias: string): void {
    if (this.explicitPrefixes.delete(oldAlias)) {
      this.explicitPrefixes.add(newAlias);
    }
  }

  /** Records a subject in the order of its first definition in the source file. */
  recordSubject(iri: string): void {
    if (!iri || this.recordedSubjects.has(iri)) {
      return;
    }
    this.recordedSubjects.add(iri);
    this.subjectOrder.push({iri});
  }

  hasSubjectOrder(): boolean {
    return this.subjectOrder.length > 0;
  }

  /** The current IRIs of the ordered subjects; renamed elements are followed through their element reference. */
  getSubjectOrder(): string[] {
    return this.subjectOrder.map(entry => entry.element?.aspectModelUrn || entry.iri);
  }

  /**
   * Replaces the subject order. Element references of subjects which are kept are preserved,
   * new subjects are bound using the resolver.
   */
  setSubjectOrder(iris: string[], resolve?: (iri: string) => SubjectReference | undefined): void {
    const existing = new Map(this.subjectOrder.map(entry => [entry.element?.aspectModelUrn || entry.iri, entry]));
    this.subjectOrder = [...new Set(iris)].map(iri => {
      const entry = existing.get(iri);
      const element = entry?.element ?? resolve?.(iri);
      return {iri, ...(element ? {element} : {})};
    });
    this.recordedSubjects.clear();
    this.subjectOrder.forEach(entry => this.recordedSubjects.add(entry.iri));
  }

  /** Links the ordered subjects to their model elements so that renames keep the position of an element. */
  bindElements(resolve: (iri: string) => SubjectReference | undefined): void {
    for (const entry of this.subjectOrder) {
      if (!entry.element) {
        const element = resolve(entry.iri);
        if (element) {
          entry.element = element;
        }
      }
    }
  }
}
