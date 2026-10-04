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

import {TestBed} from '@angular/core/testing';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {ClipboardService} from './clipboard.service';

function setup(ipcRenderer?: unknown): ClipboardService {
  TestBed.configureTestingModule({providers: ipcRenderer ? [{provide: IPC_RENDERER, useValue: ipcRenderer}] : []});
  return TestBed.inject(ClipboardService);
}

describe('ClipboardService', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else delete (navigator as any).clipboard;
  });

  function mockClipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
  }

  it('ignores empty text', () => {
    const ipc = {copyToClipboard: vi.fn()};
    setup(ipc).copy('');
    expect(ipc.copyToClipboard).not.toHaveBeenCalled();
  });

  it('uses the native Tauri clipboard when available', () => {
    const ipc = {copyToClipboard: vi.fn()};
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    setup(ipc).copy('https://example.com/a%23b');

    expect(ipc.copyToClipboard).toHaveBeenCalledWith('https://example.com/a%23b');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('uses the browser clipboard API when the document has focus', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);

    setup().copy('urn:test%23x');

    expect(writeText).toHaveBeenCalledWith('urn:test%23x');
  });

  it('falls back to execCommand when the document has no focus', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    const exec = vi.fn().mockReturnValue(true);
    (document as any).execCommand = exec;

    setup().copy('text');

    expect(writeText).not.toHaveBeenCalled();
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to execCommand when the clipboard API rejects', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    const exec = vi.fn().mockReturnValue(true);
    (document as any).execCommand = exec;

    setup().copy('text');
    await Promise.resolve();
    await Promise.resolve();

    expect(exec).toHaveBeenCalledWith('copy');
  });
});
