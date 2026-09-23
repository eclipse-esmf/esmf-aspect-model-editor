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
import {SaveModelDialogComponent} from './save-model-dialog.component';
import {SaveModelDialogService} from './save-model-dialog.service';

describe('SaveModelDialogService', () => {
  let service: SaveModelDialogService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SaveModelDialogService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(SaveModelDialogService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should open SaveModelDialogComponent and return afterClosed', async () => {
    const dialogRefMock = {
      afterClosed: vi.fn(() => of(true)),
    } as unknown as MatDialogRef<SaveModelDialogComponent>;

    vi.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    const result = await new Promise(resolve => service.openDialog().subscribe(resolve));

    expect(dialog.open).toHaveBeenCalledWith(SaveModelDialogComponent);
    expect(result).toBe(true);
  });
});
