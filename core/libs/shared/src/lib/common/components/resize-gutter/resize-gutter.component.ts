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

import {DOCUMENT} from '@angular/common';
import {Component, effect, ElementRef, inject, input, model, OnInit, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

/** Which edge of the resized panel the gutter sits on. */
export type ResizeGutterEdge = 'start' | 'end';

const KEYBOARD_STEP = 16;
/** Part of the viewport a resizable panel may occupy at most. */
const MAX_VIEWPORT_RATIO = 0.9;

/**
 * Drag handle (vertical line + "more_vert" icon) to change the width of a panel.
 * Place it as a child of the panel (a positioned element); the gutter applies `width` to the panel itself,
 * so the panel must not bind its width elsewhere.
 * - edge "end": the gutter sits on the right edge, dragging to the right enlarges the panel (left sidebars)
 * - edge "start": the gutter sits on the left edge, dragging to the left enlarges the panel (right sidebars)
 * A `null` width means "auto"; the current rendered width of the parent is then used as starting point.
 */
@Component({
  selector: 'ame-resize-gutter',
  imports: [MatIcon],
  templateUrl: './resize-gutter.component.html',
  styleUrls: ['./resize-gutter.component.scss'],
  host: {
    role: 'separator',
    tabindex: '0',
    'aria-orientation': 'vertical',
    '[class.resize-gutter--start]': "edge() === 'start'",
    '[class.resize-gutter--end]': "edge() === 'end'",
    '[class.resize-gutter--active]': 'resizing',
    '[attr.aria-valuenow]': 'width()',
    '[attr.aria-valuemin]': 'minWidth()',
    '[attr.aria-valuemax]': 'maxWidth()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(keydown)': 'onKeyDown($event)',
    '(dblclick)': 'reset()',
  },
})
export class ResizeGutterComponent implements OnInit {
  readonly width = model<number | null>(null);
  readonly edge = input<ResizeGutterEdge>('end');
  readonly minWidth = input(200);
  readonly maxWidth = input(Number.MAX_SAFE_INTEGER);
  /** If set, the width is restored from and persisted to localStorage under this key. */
  readonly storageKey = input<string | null>(null);

  readonly resizeEnd = output<number>();

  public resizing = false;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private initialWidth: number | null = null;
  private startX = 0;
  private startWidth = 0;

  constructor() {
    // Applies the width directly to the resized panel so it follows the gutter immediately.
    effect(() => {
      const width = this.width();
      const panel = this.elementRef.nativeElement.parentElement;
      if (panel) panel.style.width = width === null ? '' : `${width}px`;
    });
  }

  ngOnInit(): void {
    this.initialWidth = this.width();
    const stored = this.readStoredWidth();
    if (stored !== null) {
      this.width.set(this.clamp(stored));
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.resizing = true;
    this.startX = event.clientX;
    this.startWidth = this.currentWidth();
    this.elementRef.nativeElement.setPointerCapture?.(event.pointerId);
    this.document.body.classList.add('ame-resizing');
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.resizing) return;
    const delta = event.clientX - this.startX;
    this.width.set(this.clamp(this.startWidth + (this.edge() === 'end' ? delta : -delta)));
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.resizing) return;
    this.resizing = false;
    this.elementRef.nativeElement.releasePointerCapture?.(event.pointerId);
    this.document.body.classList.remove('ame-resizing');
    this.commit();
  }

  onKeyDown(event: KeyboardEvent): void {
    const grow = this.edge() === 'end' ? 'ArrowRight' : 'ArrowLeft';
    const shrink = this.edge() === 'end' ? 'ArrowLeft' : 'ArrowRight';
    if (event.key !== grow && event.key !== shrink) return;
    event.preventDefault();
    const step = event.key === grow ? KEYBOARD_STEP : -KEYBOARD_STEP;
    this.width.set(this.clamp(this.currentWidth() + step));
    this.commit();
  }

  /** Restores the width the panel had initially and forgets the persisted width. */
  reset(): void {
    this.width.set(this.initialWidth);
    const key = this.storageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // storage not available
      }
    }
    this.resizeEnd.emit(this.currentWidth());
  }

  clamp(width: number): number {
    const viewportMax = Math.floor((this.document.defaultView?.innerWidth ?? Number.MAX_SAFE_INTEGER) * MAX_VIEWPORT_RATIO);
    const max = Math.max(this.minWidth(), Math.min(this.maxWidth(), viewportMax));
    return Math.round(Math.min(Math.max(width, this.minWidth()), max));
  }

  private currentWidth(): number {
    return this.width() ?? this.elementRef.nativeElement.parentElement?.getBoundingClientRect().width ?? this.minWidth();
  }

  private commit(): void {
    const width = this.currentWidth();
    const key = this.storageKey();
    if (key) {
      try {
        localStorage.setItem(key, String(width));
      } catch {
        // storage not available
      }
    }
    this.resizeEnd.emit(width);
  }

  private readStoredWidth(): number | null {
    const key = this.storageKey();
    if (!key) return null;
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }
}
