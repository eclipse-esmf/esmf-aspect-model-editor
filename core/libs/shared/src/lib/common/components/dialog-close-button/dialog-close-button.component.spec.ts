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
import {MatDialogRef} from '@angular/material/dialog';
import {TranslocoService} from '@jsverse/transloco';
import {describe, expect, it, vi} from 'vitest';
import {DialogCloseButtonComponent} from './dialog-close-button.component';

function setup(options: {dialogRef?: unknown; translate?: (key: string) => string; disabled?: boolean} = {}) {
  const providers = [];
  if (options.dialogRef) providers.push({provide: MatDialogRef, useValue: options.dialogRef});
  providers.push({provide: TranslocoService, useValue: {translate: options.translate ?? ((key: string) => key)}});
  TestBed.configureTestingModule({imports: [DialogCloseButtonComponent], providers});

  const fixture = TestBed.createComponent(DialogCloseButtonComponent);
  if (options.disabled !== undefined) fixture.componentRef.setInput('disabled', options.disabled);
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('[data-testid="dialog-close-button"]') as HTMLButtonElement;
  return {fixture, button};
}

describe('DialogCloseButtonComponent', () => {
  it('renders a close icon button that is not part of the tab order', () => {
    const {button} = setup();
    expect(button.classList).toContain('close-button');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('tabindex')).toBe('-1');
    expect(button.textContent?.trim()).toBe('close');
  });

  it('uses the translated label and falls back to "Close"', () => {
    expect(setup({translate: () => 'Schließen'}).button.getAttribute('aria-label')).toBe('Schließen');
    TestBed.resetTestingModule();
    expect(setup({translate: key => key}).button.getAttribute('title')).toBe('Close');
  });

  it('requests closing through the dialog component', () => {
    const requestClose = vi.fn();
    const dialogRef = {componentInstance: {requestClose}, close: vi.fn()};
    setup({dialogRef}).button.click();
    expect(requestClose).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes the dialog directly when the component has no handler', () => {
    const dialogRef = {componentInstance: {}, close: vi.fn()};
    setup({dialogRef}).button.click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('falls back to "Close" when Transloco is not configured', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [DialogCloseButtonComponent]});
    const fixture = TestBed.createComponent(DialogCloseButtonComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe('Close');
  });

  it('keeps the default test id and accepts a dialog specific one', () => {
    expect(setup().button).not.toBeNull();
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      imports: [DialogCloseButtonComponent],
      providers: [{provide: TranslocoService, useValue: {translate: (key: string) => key}}],
    });
    const fixture = TestBed.createComponent(DialogCloseButtonComponent);
    fixture.componentRef.setInput('testId', 'settingsModalCloseButton');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('data-testid')).toBe('settingsModalCloseButton');
    expect(button.classList).toContain('close-button');
  });

  it('can be disabled', () => {
    const dialogRef = {componentInstance: {}, close: vi.fn()};
    const {button} = setup({dialogRef, disabled: true});
    expect(button.disabled).toBe(true);
    button.click();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('does nothing outside of a dialog', () => {
    const {button} = setup();
    expect(() => button.click()).not.toThrow();
  });
});
