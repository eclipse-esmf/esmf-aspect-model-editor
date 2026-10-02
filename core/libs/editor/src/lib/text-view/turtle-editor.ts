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
import {highlightSelectionMatches, openSearchPanel, search, searchKeymap} from '@codemirror/search';
import {Compartment, EditorState, RangeSet} from '@codemirror/state';
import {
  Decoration,
  drawSelection,
  EditorView,
  gutter,
  GutterMarker,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import {turtle, turtleEditorTheme} from './turtle-language';
import {ViolationLine} from './turtle-text.utils';

export interface TurtleEditor {
  /** Replaces the whole document while keeping the scroll position. */
  setContent(content: string): void;
  goToLine(lineNumber: number): void;
  setDecorations(violationLines: ViolationLine[], targetLine: number | null): void;
  openSearch(): void;
  destroy(): void;
}

class ViolationMarker extends GutterMarker {
  constructor(private readonly message: string) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof ViolationMarker && other.message === this.message;
  }

  override toDOM(): Node {
    const marker = document.createElement('span');
    marker.className = 'cm-ame-violation-marker';
    marker.textContent = '●';
    marker.title = this.message;
    return marker;
  }
}

/** Creates a read-only Turtle editor inside the given element. */
export function createTurtleEditor(parent: HTMLElement, content: string): TurtleEditor {
  const decorations = new Compartment();
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        foldGutter(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        highlightSelectionMatches(),
        search({top: true}),
        EditorState.readOnly.of(true),
        EditorView.contentAttributes.of({'aria-label': 'Aspect Model (Turtle)', 'data-testid': 'text-view-content'}),
        keymap.of([...searchKeymap, ...foldKeymap, ...defaultKeymap]),
        turtle(),
        turtleEditorTheme,
        decorations.of([]),
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

    setDecorations(violationLines: ViolationLine[], targetLine: number | null): void {
      const doc = view.state.doc;
      const visibleViolations = violationLines.filter(({line}) => line <= doc.lines);
      const lineDecorations = visibleViolations.map(({line, messages}) =>
        Decoration.line({class: 'cm-ame-violation-line', attributes: {title: messages.join('\n')}}).range(doc.line(line).from),
      );
      const markers = visibleViolations.map(({line, messages}) => new ViolationMarker(messages.join('\n')).range(doc.line(line).from));

      if (targetLine && targetLine <= doc.lines) {
        lineDecorations.push(Decoration.line({class: 'cm-ame-target-line'}).range(doc.line(targetLine).from));
      }

      view.dispatch({
        effects: decorations.reconfigure([
          EditorView.decorations.of(Decoration.set(lineDecorations, true)),
          gutter({class: 'cm-ame-violation-gutter', markers: () => RangeSet.of(markers, true)}),
        ]),
      });
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
