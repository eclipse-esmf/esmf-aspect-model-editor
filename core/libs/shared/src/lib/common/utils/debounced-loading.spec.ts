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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createDebouncedLoading} from './debounced-loading';

describe('createDebouncedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Debounce: should not become true if hide() is called before debounce expires', () => {
    const onShow = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, minDurationMs: 300, onShow});
    expect(loading()).toBe(false);

    loading.show();
    expect(loading()).toBe(false);

    // Operation finishes in 100ms (< 200ms debounce)
    vi.advanceTimersByTime(100);
    loading.hide();

    // Advance past original 200ms
    vi.advanceTimersByTime(200);
    expect(loading()).toBe(false);
    expect(onShow).not.toHaveBeenCalled();
  });

  it('Loading activation: should show loading when operation exceeds debounce period', () => {
    const onShow = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, minDurationMs: 300, onShow});
    loading.set(true);

    vi.advanceTimersByTime(199);
    expect(loading()).toBe(false);
    expect(onShow).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(loading()).toBe(true);
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('Minimum duration: should remain true until minDurationMs has elapsed', () => {
    const onHide = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, minDurationMs: 300, onHide});
    loading.set(true);

    // Loading becomes active at 200ms
    vi.advanceTimersByTime(200);
    expect(loading()).toBe(true);

    // Hide requested at 250ms (only 50ms after appearing)
    vi.advanceTimersByTime(50);
    loading.set(false);

    // Must remain true until 300ms minDuration has elapsed (at 500ms total)
    expect(loading()).toBe(true);
    expect(onHide).not.toHaveBeenCalled();

    vi.advanceTimersByTime(249);
    expect(loading()).toBe(true);
    expect(onHide).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(loading()).toBe(false);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('Consecutive operations: show() during pending minimum duration cancels pending hide', () => {
    const onHide = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, minDurationMs: 300, onHide});

    // Operation A starts
    loading.show();
    vi.advanceTimersByTime(200);
    expect(loading()).toBe(true);

    // Operation A finishes, pending hide scheduled for 300ms
    loading.hide();
    vi.advanceTimersByTime(50);
    expect(loading()).toBe(true);

    // Operation B starts while minDuration timer is pending
    loading.show();

    // Advance past original minDuration timer
    vi.advanceTimersByTime(300);
    expect(loading()).toBe(true);
    expect(onHide).not.toHaveBeenCalled();

    // Operation B finishes
    loading.hide();
    vi.advanceTimersByTime(300);
    expect(loading()).toBe(false);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('Immediate: should immediately show when debounceMs is 0', () => {
    const onShow = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 0, onShow});
    loading.show();
    expect(loading()).toBe(true);
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('Repeated calls: multiple show() calls do not create duplicate timers or calls', () => {
    const onShow = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, onShow});

    loading.show();
    loading.show();
    loading.show();

    vi.advanceTimersByTime(200);
    expect(loading()).toBe(true);
    expect(onShow).toHaveBeenCalledTimes(1);

    // Calling show while already visible is a no-op
    loading.show();
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('Repeated hide() calls are safe and idempotent', () => {
    const onHide = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 0, minDurationMs: 300, onHide});
    loading.show();

    loading.hide();
    loading.hide();
    loading.hide();

    vi.advanceTimersByTime(300);
    expect(loading()).toBe(false);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('Cleanup: destroy cancels any active timers', () => {
    const onShow = vi.fn();
    const loading = createDebouncedLoading({debounceMs: 200, onShow});
    loading.show();

    loading.destroy();
    vi.advanceTimersByTime(300);
    expect(loading()).toBe(false);
    expect(onShow).not.toHaveBeenCalled();
  });
});
