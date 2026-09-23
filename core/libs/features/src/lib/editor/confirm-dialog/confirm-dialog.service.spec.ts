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
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';
import {ConfirmDialogComponent} from './confirm-dialog.component';
import {ConfirmDialogService} from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(ConfirmDialogService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should open dialog with proper options and return result', async () => {
    const dialogRefMock = {
      afterClosed: vi.fn(() => of(ConfirmDialogEnum.ok)),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;

    vi.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    const result = await new Promise(resolve =>
      service
        .open({
          title: 'Confirm Action',
          phrases: ['Are you sure?'],
          okButtonText: 'Yes',
          closeButtonText: 'No',
        })
        .subscribe(resolve),
    );

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Action',
        phrases: ['Are you sure?'],
        okButtonText: 'Yes',
        closeButtonText: 'No',
        actionButtonText: undefined,
      },
      maxWidth: 650,
      minWidth: 550,
    });
    expect(result).toBe(ConfirmDialogEnum.ok);
  });
});
