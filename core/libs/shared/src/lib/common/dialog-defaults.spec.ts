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
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {AME_DIALOG_MAX_HEIGHT, AME_DIALOG_MAX_WIDTH, provideAmeDialogDefaults, viewportSafeWidth} from './dialog-defaults';

@Component({template: '<p>dialog</p>'})
class DummyDialogComponent {}

describe('provideAmeDialogDefaults', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideAmeDialogDefaults()]});
  });

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('limits dialogs to the viewport and keeps the material defaults', () => {
    const options = TestBed.inject(MAT_DIALOG_DEFAULT_OPTIONS) as MatDialogConfig;
    const materialDefaults = new MatDialogConfig();

    expect(options.maxWidth).toBe(AME_DIALOG_MAX_WIDTH);
    expect(options.maxHeight).toBe(AME_DIALOG_MAX_HEIGHT);
    expect(options.hasBackdrop).toBe(materialDefaults.hasBackdrop);
    expect(options.role).toBe(materialDefaults.role);
    expect(options.autoFocus).toBe(materialDefaults.autoFocus);
  });

  it('applies the limits to opened dialogs', () => {
    const ref = TestBed.inject(MatDialog).open(DummyDialogComponent);
    const config = (ref as any)._containerInstance._config as MatDialogConfig;

    expect(config.maxWidth).toBe(AME_DIALOG_MAX_WIDTH);
    expect(config.maxHeight).toBe(AME_DIALOG_MAX_HEIGHT);
  });

  it('lets a dialog override the limits explicitly', () => {
    const ref = TestBed.inject(MatDialog).open(DummyDialogComponent, {maxWidth: '650px'});
    const config = (ref as any)._containerInstance._config as MatDialogConfig;

    expect(config.maxWidth).toBe('650px');
    expect(config.maxHeight).toBe(AME_DIALOG_MAX_HEIGHT);
  });
});

describe('viewportSafeWidth', () => {
  it('caps a fixed size at the dialog viewport limit', () => {
    expect(viewportSafeWidth(550)).toBe('min(550px, 95vw)');
    expect(viewportSafeWidth(0)).toBe('min(0px, 95vw)');
  });
});
