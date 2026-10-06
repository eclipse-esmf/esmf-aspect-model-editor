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
import {historyActionOf, isEditableTarget} from './history-shortcuts';

const key = (key: string, modifiers: Partial<Record<'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey', boolean>> = {}) => ({
  key,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...modifiers,
});

describe('historyActionOf', () => {
  describe('macOS', () => {
    it('undoes with Cmd+Z and redoes with Cmd+Shift+Z', () => {
      expect(historyActionOf(key('z', {metaKey: true}), true)).toBe('undo');
      expect(historyActionOf(key('Z', {metaKey: true, shiftKey: true}), true)).toBe('redo');
    });

    it('ignores Ctrl+Z, Cmd+Y and shortcuts with Alt', () => {
      expect(historyActionOf(key('z', {ctrlKey: true}), true)).toBeNull();
      expect(historyActionOf(key('y', {metaKey: true}), true)).toBeNull();
      expect(historyActionOf(key('z', {metaKey: true, altKey: true}), true)).toBeNull();
    });
  });

  describe('Windows and Linux', () => {
    it('undoes with Ctrl+Z and redoes with Ctrl+Shift+Z and Ctrl+Y', () => {
      expect(historyActionOf(key('z', {ctrlKey: true}), false)).toBe('undo');
      expect(historyActionOf(key('Z', {ctrlKey: true, shiftKey: true}), false)).toBe('redo');
      expect(historyActionOf(key('y', {ctrlKey: true}), false)).toBe('redo');
    });

    it('ignores the Meta key, Ctrl+Shift+Y and other keys', () => {
      expect(historyActionOf(key('z', {metaKey: true}), false)).toBeNull();
      expect(historyActionOf(key('y', {ctrlKey: true, shiftKey: true}), false)).toBeNull();
      expect(historyActionOf(key('s', {ctrlKey: true}), false)).toBeNull();
      expect(historyActionOf(key('z'), false)).toBeNull();
    });
  });
});

describe('isEditableTarget', () => {
  it('detects text fields', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    expect(isEditableTarget(document.createElement('select'))).toBe(true);
  });

  it('detects editable content and the code editor of the text view', () => {
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(editable)).toBe(true);

    const codeEditor = document.createElement('div');
    codeEditor.className = 'cm-editor';
    const line = document.createElement('div');
    codeEditor.appendChild(line);
    expect(isEditableTarget(line)).toBe(true);
  });

  it('does not treat the graph or the document as text field', () => {
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
    expect(isEditableTarget(document.body)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
