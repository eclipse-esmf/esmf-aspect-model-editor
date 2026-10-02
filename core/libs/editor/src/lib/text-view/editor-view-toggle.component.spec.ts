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

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorViewMode, EditorViewModeService} from './editor-view-mode.service';
import {EditorViewToggleComponent} from './editor-view-toggle.component';

describe('EditorViewToggleComponent', () => {
  let fixture: ComponentFixture<EditorViewToggleComponent>;
  let mode: ReturnType<typeof signal<EditorViewMode>>;
  let setMode: ReturnType<typeof vi.fn>;

  const toggle = (testId: string): HTMLElement => fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  const isChecked = (testId: string) => toggle(testId).classList.contains('mat-button-toggle-checked');

  beforeEach(() => {
    mode = signal<EditorViewMode>('graph');
    setMode = vi.fn((value: EditorViewMode) => mode.set(value));

    TestBed.configureTestingModule({
      imports: [EditorViewToggleComponent, TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [{provide: EditorViewModeService, useValue: {mode, setMode}}],
    });
    fixture = TestBed.createComponent(EditorViewToggleComponent);
    fixture.detectChanges();
  });

  it('marks the active view', () => {
    expect(isChecked('editor-view-graph')).toBe(true);
    expect(isChecked('editor-view-text')).toBe(false);
  });

  it('switches the view', () => {
    (toggle('editor-view-text').querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(setMode).toHaveBeenCalledWith('text');
    expect(isChecked('editor-view-text')).toBe(true);
    expect(isChecked('editor-view-graph')).toBe(false);
  });
});
