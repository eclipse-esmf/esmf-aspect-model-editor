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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';
import {ConfirmDialogComponent} from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRef: MatDialogRef<ConfirmDialogComponent>;

  const mockData = {
    title: 'Test Title',
    phrases: ['Phrase 1', 'Phrase 2'],
    okButtonText: 'Confirm',
    closeButtonText: 'Cancel',
    actionButtonText: 'Action',
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: mockData},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have correct data', () => {
    expect(component).toBeTruthy();
    expect(component.data).toEqual(mockData);
  });

  it('closeAndGiveResult should call dialogRef.close with result', () => {
    component.closeAndGiveResult(ConfirmDialogEnum.ok);
    expect(dialogRef.close).toHaveBeenCalledWith(ConfirmDialogEnum.ok);

    component.closeAndGiveResult(ConfirmDialogEnum.cancel);
    expect(dialogRef.close).toHaveBeenCalledWith(ConfirmDialogEnum.cancel);
  });
});
