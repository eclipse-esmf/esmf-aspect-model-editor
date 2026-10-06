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

import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CLEAR_WORKSPACE_CONFIRM_WORD, ClearWorkspaceDialogComponent} from './clear-workspace-dialog.component';

describe('ClearWorkspaceDialogComponent', () => {
  let fixture: ComponentFixture<ClearWorkspaceDialogComponent>;
  let component: ClearWorkspaceDialogComponent;
  let close: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    close = vi.fn();
    TestBed.configureTestingModule({
      imports: [
        ClearWorkspaceDialogComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MAT_DIALOG_DATA, useValue: {fileCount: 5}},
        {provide: MatDialogRef, useValue: {close}},
      ],
    });
    fixture = TestBed.createComponent(ClearWorkspaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const okButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('[data-testid="clear-workspace-ok"]');
  const type = (value: string) => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="clear-workspace-confirm-input"]');
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('creates a backup by default', () => {
    expect(component.backup()).toBe(true);
  });

  it('keeps the clear button disabled until the confirmation word is typed', () => {
    expect(okButton().disabled).toBe(true);

    type('clear');
    expect(okButton().disabled).toBe(true);

    type(CLEAR_WORKSPACE_CONFIRM_WORD);
    expect(okButton().disabled).toBe(false);
  });

  it('closes with the backup choice', () => {
    component.backup.set(false);
    type(CLEAR_WORKSPACE_CONFIRM_WORD);

    okButton().click();

    expect(close).toHaveBeenCalledWith({backup: false});
  });

  it('does not clear on Enter without the confirmation word', () => {
    type('nope');
    component.clear();

    expect(close).not.toHaveBeenCalled();
  });

  it('cancels without result', () => {
    (fixture.nativeElement.querySelector('[data-testid="clear-workspace-cancel"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith();
  });

  it('shows the warning and the shared (x)', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="clear-workspace-warning"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ame-dialog-close-button')).toBeTruthy();
  });
});
