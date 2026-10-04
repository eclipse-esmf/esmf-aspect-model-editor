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

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DialogEscapeHandler, requestDialogClose} from './dialog-close';
import {provideAmeDialogDefaults} from './dialog-defaults';

@Component({template: '<p>plain dialog</p>'})
class PlainDialogComponent {}

@Component({template: '<p>guarded dialog</p>'})
class GuardedDialogComponent {
  requestClose = vi.fn();
}

function pressKey(init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, ...init});
  (document.querySelector('.cdk-overlay-pane') as HTMLElement).dispatchEvent(event);
  return event;
}

describe('requestDialogClose', () => {
  it('delegates to requestClose() of the dialog component', () => {
    const instance = {requestClose: vi.fn()};
    const ref = {componentInstance: instance, close: vi.fn()} as unknown as MatDialogRef<unknown>;

    requestDialogClose(ref);

    expect(instance.requestClose).toHaveBeenCalledTimes(1);
    expect(ref.close).not.toHaveBeenCalled();
  });

  it('closes the dialog without a handler', () => {
    const ref = {componentInstance: {}, close: vi.fn()} as unknown as MatDialogRef<unknown>;
    requestDialogClose(ref);
    expect(ref.close).toHaveBeenCalledWith();
  });

  it('closes the dialog when the component is not created yet', () => {
    const ref = {componentInstance: null, close: vi.fn()} as unknown as MatDialogRef<unknown>;
    requestDialogClose(ref);
    expect(ref.close).toHaveBeenCalled();
  });
});

describe('DialogEscapeHandler', () => {
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideAmeDialogDefaults()]});
    dialog = TestBed.inject(MatDialog);
  });

  afterEach(() => dialog.closeAll());

  it('is initialised by provideAmeDialogDefaults only once', () => {
    const handler = TestBed.inject(DialogEscapeHandler);
    const spy = vi.spyOn(dialog.afterOpened, 'pipe');
    handler.init();
    expect(spy).not.toHaveBeenCalled();
  });

  it('closes a dialog without handler on Escape', () => {
    const ref = dialog.open(PlainDialogComponent);
    const close = vi.spyOn(ref, 'close');

    const event = pressKey({key: 'Escape'});

    expect(close).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('asks the dialog component via requestClose() on Escape', () => {
    const ref = dialog.open(GuardedDialogComponent);
    const close = vi.spyOn(ref, 'close');

    pressKey({key: 'Escape'});

    expect(ref.componentInstance.requestClose).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
  });

  it.each([{altKey: true}, {ctrlKey: true}, {metaKey: true}, {shiftKey: true}])('ignores Escape with modifier %o', modifier => {
    const ref = dialog.open(GuardedDialogComponent);
    pressKey({key: 'Escape', ...modifier});
    expect(ref.componentInstance.requestClose).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const ref = dialog.open(GuardedDialogComponent);
    pressKey({key: 'Enter'});
    pressKey({key: 'Esc '});
    expect(ref.componentInstance.requestClose).not.toHaveBeenCalled();
  });

  it('ignores Escape that was already handled inside the dialog', () => {
    const ref = dialog.open(GuardedDialogComponent);
    const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement;
    pane.addEventListener('keydown', event => event.preventDefault(), {capture: true});

    pressKey({key: 'Escape'});

    expect(ref.componentInstance.requestClose).not.toHaveBeenCalled();
  });

  it('leaves dialogs with disableClose: false to Angular Material', () => {
    const ref = dialog.open(GuardedDialogComponent, {disableClose: false});
    pressKey({key: 'Escape'});
    expect(ref.componentInstance.requestClose).not.toHaveBeenCalled();
  });

  it('stops listening after the dialog was closed', () => {
    const ref = dialog.open(GuardedDialogComponent);
    const instance = ref.componentInstance;
    const keydown$ = ref.keydownEvents();
    ref.close();

    let received = 0;
    keydown$.subscribe(() => received++);
    expect(instance.requestClose).not.toHaveBeenCalled();
    expect(received).toBe(0);
  });
});
