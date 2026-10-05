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

export type HistoryAction = 'undo' | 'redo';

type ShortcutEvent = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>;

export function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

/**
 * Cmd+Z / Cmd+Shift+Z on macOS, Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y on Windows and Linux.
 * The key (not the key code) is used, so the shortcut follows the keyboard layout (e.g. QWERTZ).
 */
export function historyActionOf(event: ShortcutEvent, isMac: boolean): HistoryAction | null {
  const modifier = isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!modifier || event.altKey) return null;

  const key = event.key?.toLowerCase();
  if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
  if (key === 'y' && !isMac && !event.shiftKey) return 'redo';
  return null;
}

/** Text fields (also the code editor of the text view) keep their own undo. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable ||
    target.getAttribute('contenteditable') === 'true' ||
    !!target.closest('.cm-editor')
  );
}
