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

import {DestroyRef, inject, signal, Signal} from '@angular/core';

export interface DebouncedLoadingOptions {
  /** Time in ms to wait before setting loading to true (prevents spinner flash for fast operations). Default is 200ms. */
  debounceMs?: number;
  /** Minimum time in ms that loading stays true once shown (prevents jitter/flicker). Default is 300ms. */
  minDurationMs?: number;
  /** Initial loading value. Default is false. */
  initialValue?: boolean;
  /** Optional callback invoked when loading transitions to true */
  onShow?: () => void;
  /** Optional callback invoked when loading transitions to false */
  onHide?: () => void;
}

export interface DebouncedLoading {
  (): boolean;
  readonly loading: Signal<boolean>;
  show(overrideOptions?: Partial<DebouncedLoadingOptions>): void;
  hide(): void;
  set(value: boolean, overrideOptions?: Partial<DebouncedLoadingOptions>): void;
  destroy(): void;
}

/**
 * Creates a debounced loading signal that prevents spinner flicker for fast operations (< debounceMs)
 * and guarantees a minimum visible duration once shown (minDurationMs) to eliminate visual jitter.
 *
 * Conforms to Angular 22 Signal standards, encapsulating all imperative timing state while exposing
 * a readonly Signal<boolean> as the source of truth.
 */
export function createDebouncedLoading(options: DebouncedLoadingOptions = {}): DebouncedLoading {
  const defaultDebounceMs = options.debounceMs ?? 200;
  const defaultMinDurationMs = options.minDurationMs ?? 300;
  let currentMinDurationMs = defaultMinDurationMs;

  const loading = signal<boolean>(options.initialValue ?? false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let minDurationTimer: ReturnType<typeof setTimeout> | null = null;
  let shownAt: number | null = options.initialValue ? Date.now() : null;

  function clearTimers(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (minDurationTimer) {
      clearTimeout(minDurationTimer);
      minDurationTimer = null;
    }
  }

  function show(overrideOptions?: Partial<DebouncedLoadingOptions>): void {
    if (overrideOptions?.minDurationMs !== undefined) {
      currentMinDurationMs = overrideOptions.minDurationMs;
    }

    // Cancel pending minimum-duration/hide timer when a new loading operation starts
    if (minDurationTimer) {
      clearTimeout(minDurationTimer);
      minDurationTimer = null;
    }

    // If loading is already visible, do nothing
    if (loading()) {
      return;
    }

    // If a debounce timer already exists, do nothing
    if (debounceTimer) {
      return;
    }

    const debounceMs = overrideOptions?.debounceMs ?? defaultDebounceMs;

    if (debounceMs <= 0) {
      shownAt = Date.now();
      loading.set(true);
      options.onShow?.();
      return;
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      shownAt = Date.now();
      loading.set(true);
      options.onShow?.();
    }, debounceMs);
  }

  function hide(): void {
    // If the debounce timer is still active, cancel it and never show the loading state
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      return;
    }

    // If loading is not visible, do nothing
    if (!loading()) {
      return;
    }

    // Repeated hide() calls must be safe: if a hide timer is already running, do nothing
    if (minDurationTimer) {
      return;
    }

    if (currentMinDurationMs <= 0 || !shownAt) {
      loading.set(false);
      shownAt = null;
      currentMinDurationMs = defaultMinDurationMs;
      options.onHide?.();
      return;
    }

    const elapsed = Date.now() - shownAt;
    const remaining = currentMinDurationMs - elapsed;

    if (remaining <= 0) {
      loading.set(false);
      shownAt = null;
      currentMinDurationMs = defaultMinDurationMs;
      options.onHide?.();
    } else {
      minDurationTimer = setTimeout(() => {
        minDurationTimer = null;
        loading.set(false);
        shownAt = null;
        currentMinDurationMs = defaultMinDurationMs;
        options.onHide?.();
      }, remaining);
    }
  }

  function set(value: boolean, overrideOptions?: Partial<DebouncedLoadingOptions>): void {
    if (value) {
      show(overrideOptions);
    } else {
      hide();
    }
  }

  function destroy(): void {
    clearTimers();
  }

  try {
    const destroyRef = inject(DestroyRef, {optional: true});
    destroyRef?.onDestroy(() => destroy());
  } catch {
    // Usable outside Angular injection context
  }

  const readonlyLoading = loading.asReadonly();
  const debounced = Object.assign(readonlyLoading as unknown as Signal<boolean>, {
    loading: readonlyLoading,
    show,
    hide,
    set,
    destroy,
  }) as DebouncedLoading;

  return debounced;
}
