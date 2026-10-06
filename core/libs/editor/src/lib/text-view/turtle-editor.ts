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

// Everything that depends on CodeMirror lives here so it can be loaded lazily when the text view is opened.

import {defaultKeymap} from '@codemirror/commands';
import {foldGutter, foldKeymap} from '@codemirror/language';
import {Diagnostic, lintGutter, lintKeymap, setDiagnostics} from '@codemirror/lint';
import {highlightSelectionMatches, openSearchPanel, search, searchKeymap} from '@codemirror/search';
import {Compartment, EditorState} from '@codemirror/state';
import {Decoration, drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers} from '@codemirror/view';
import {turtle, turtleEditorTheme} from './turtle-language';
import {TextProblem} from './turtle-text.utils';

export interface TurtleEditor {
  /** Replaces the whole document while keeping the scroll position. */
  setContent(content: string): void;
  goToLine(lineNumber: number): void;
  /** Underlines the problems; they are shown in a tooltip on hover and marked in the gutter. */
  setProblems(problems: TextProblem[]): void;
  setTargetLine(targetLine: number | null): void;
  openSearch(): void;
  destroy(): void;
}

/** Creates a read-only Turtle editor inside the given element. */
export function createTurtleEditor(parent: HTMLElement, content: string): TurtleEditor {
  const targetLineDecoration = new Compartment();
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        lintGutter(),
        foldGutter(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        highlightSelectionMatches(),
        search({top: true}),
        EditorState.readOnly.of(true),
        EditorView.contentAttributes.of({'aria-label': 'Aspect Model (Turtle)', 'data-testid': 'text-view-content'}),
        keymap.of([...searchKeymap, ...foldKeymap, ...lintKeymap, ...defaultKeymap]),
        turtle(),
        turtleEditorTheme,
        targetLineDecoration.of([]),
      ],
    }),
  });

  return {
    setContent(text: string): void {
      if (view.state.doc.toString() === text) {
        return;
      }
      const scrollTop = view.scrollDOM.scrollTop;
      view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: text}});
      view.scrollDOM.scrollTop = scrollTop;
    },

    goToLine(lineNumber: number): void {
      const line = view.state.doc.line(Math.max(1, Math.min(lineNumber, view.state.doc.lines)));
      view.dispatch({
        selection: {anchor: line.from},
        effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
      });
    },

    setProblems(problems: TextProblem[]): void {
      const length = view.state.doc.length;
      const diagnostics: Diagnostic[] = problems
        .filter(({to}) => to <= length)
        .map(({from, to, message, kind}) => ({from, to, message, severity: 'error', markClass: `cm-ame-problem-${kind}`}));
      view.dispatch(setDiagnostics(view.state, diagnostics));
    },

    setTargetLine(targetLine: number | null): void {
      const doc = view.state.doc;
      const decorations =
        targetLine && targetLine <= doc.lines ? [Decoration.line({class: 'cm-ame-target-line'}).range(doc.line(targetLine).from)] : [];
      view.dispatch({effects: targetLineDecoration.reconfigure(EditorView.decorations.of(Decoration.set(decorations)))});
    },

    openSearch(): void {
      view.focus();
      openSearchPanel(view);
    },

    destroy(): void {
      view.destroy();
    },
  };
}
