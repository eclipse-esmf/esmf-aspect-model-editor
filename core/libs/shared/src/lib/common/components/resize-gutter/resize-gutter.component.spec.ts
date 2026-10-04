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

import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {ResizeGutterComponent, ResizeGutterEdge} from './resize-gutter.component';

const STORAGE_KEY = 'ame.test.panel.width';

@Component({
  imports: [ResizeGutterComponent],
  template: `
    <div class="panel" style="position: relative">
      <ame-resize-gutter
        [(width)]="width"
        [edge]="edge()"
        [minWidth]="200"
        [maxWidth]="600"
        [storageKey]="storageKey()"
        (resizeEnd)="ended.push($event)"
      ></ame-resize-gutter>
    </div>
  `,
})
class HostComponent {
  width = signal<number | null>(300);
  edge = signal<ResizeGutterEdge>('end');
  storageKey = signal<string | null>(STORAGE_KEY);
  ended: number[] = [];
}

function pointer(type: string, clientX: number, button = 0): PointerEvent {
  const event = new MouseEvent(type, {clientX, button, bubbles: true, cancelable: true}) as PointerEvent;
  Object.defineProperty(event, 'pointerId', {value: 1});
  return event;
}

describe('ResizeGutterComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let gutterEl: HTMLElement;
  let gutter: ResizeGutterComponent;

  function create(configure?: (host: HostComponent) => void): void {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    configure?.(host);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(ResizeGutterComponent));
    gutterEl = debugEl.nativeElement;
    gutter = debugEl.componentInstance;
  }

  function drag(from: number, to: number): void {
    gutterEl.dispatchEvent(pointer('pointerdown', from));
    gutterEl.dispatchEvent(pointer('pointermove', to));
    gutterEl.dispatchEvent(pointer('pointerup', to));
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    Object.defineProperty(window, 'innerWidth', {value: 2000, configurable: true});
    TestBed.configureTestingModule({imports: [HostComponent]});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('ame-resizing');
  });

  it('renders an accessible separator with the line and icon', () => {
    create();
    expect(gutterEl.getAttribute('role')).toBe('separator');
    expect(gutterEl.getAttribute('aria-orientation')).toBe('vertical');
    expect(gutterEl.getAttribute('aria-valuenow')).toBe('300');
    expect(gutterEl.querySelector('.resize-gutter__indication-line')).not.toBeNull();
    expect(gutterEl.querySelector('.resize-gutter__handle mat-icon')?.textContent).toContain('more_vert');
    expect(gutterEl.classList).toContain('resize-gutter--end');
  });

  it('applies the width to the parent panel and removes it for auto width', () => {
    create();
    const panel = fixture.nativeElement.querySelector('.panel') as HTMLElement;
    expect(panel.style.width).toBe('300px');
    drag(100, 150);
    expect(panel.style.width).toBe('350px');

    host.width.set(null);
    fixture.detectChanges();
    expect(panel.style.width).toBe('');
  });

  it('grows a left panel when dragging to the right (edge end)', () => {
    create();
    drag(100, 180);
    expect(host.width()).toBe(380);
    expect(host.ended).toEqual([380]);
  });

  it('grows a right panel when dragging to the left (edge start)', () => {
    create(h => h.edge.set('start'));
    drag(500, 420);
    expect(host.width()).toBe(380);
  });

  it('updates the width live while dragging and marks the body as resizing', () => {
    create();
    gutterEl.dispatchEvent(pointer('pointerdown', 100));
    expect(document.body.classList).toContain('ame-resizing');
    gutterEl.dispatchEvent(pointer('pointermove', 150));
    expect(host.width()).toBe(350);
    expect(host.ended).toEqual([]);
    gutterEl.dispatchEvent(pointer('pointerup', 150));
    expect(document.body.classList).not.toContain('ame-resizing');
    expect(host.ended).toEqual([350]);
  });

  it('ignores pointer moves without a preceding pointerdown and non-primary buttons', () => {
    create();
    gutterEl.dispatchEvent(pointer('pointermove', 400));
    gutterEl.dispatchEvent(pointer('pointerdown', 100, 2));
    gutterEl.dispatchEvent(pointer('pointermove', 400));
    expect(host.width()).toBe(300);
  });

  it('clamps to the minimum and maximum width', () => {
    create();
    drag(100, -500);
    expect(host.width()).toBe(200);
    drag(100, 2000);
    expect(host.width()).toBe(600);
  });

  it('never exceeds 90% of the viewport width', () => {
    Object.defineProperty(window, 'innerWidth', {value: 500, configurable: true});
    create();
    drag(100, 1000);
    expect(host.width()).toBe(450);
  });

  it('persists the width and restores it on the next start', () => {
    create();
    drag(100, 150);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('350');

    fixture.destroy();
    create();
    expect(host.width()).toBe(350);
  });

  it('clamps an invalid or too large persisted width', () => {
    localStorage.setItem(STORAGE_KEY, '5000');
    create();
    expect(host.width()).toBe(600);

    fixture.destroy();
    localStorage.setItem(STORAGE_KEY, 'abc');
    create();
    expect(host.width()).toBe(300);
  });

  it('does not touch localStorage without a storage key', () => {
    create(h => h.storageKey.set(null));
    drag(100, 150);
    expect(host.width()).toBe(350);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('resizes with the arrow keys depending on the edge', () => {
    create();
    gutterEl.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
    expect(host.width()).toBe(316);
    gutterEl.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    gutterEl.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    expect(host.width()).toBe(284);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('284');

    fixture.destroy();
    localStorage.removeItem(STORAGE_KEY);
    create(h => h.edge.set('start'));
    gutterEl.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    expect(host.width()).toBe(316);
  });

  it('resets to the initial width on double click and forgets the persisted value', () => {
    create();
    drag(100, 200);
    expect(host.width()).toBe(400);
    gutterEl.dispatchEvent(new MouseEvent('dblclick'));
    expect(host.width()).toBe(300);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('starts from the rendered width when the width is auto (null)', () => {
    create(h => h.width.set(null));
    const panel = fixture.nativeElement.querySelector('.panel') as HTMLElement;
    panel.getBoundingClientRect = () => ({width: 260}) as DOMRect;
    drag(100, 140);
    expect(host.width()).toBe(300);

    gutter.reset();
    expect(host.width()).toBeNull();
  });
});
