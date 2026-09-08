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
import {LargeFileWarningComponent} from './large-file-warning-dialog';
import {LargeFileWarningService} from './large-file-warning-dialog.service';

describe('LargeFileWarningService', () => {
  let service: LargeFileWarningService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LargeFileWarningService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(LargeFileWarningService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should return ignore for elements count <= 99', async () => {
    const result = await new Promise(resolve => service.openDialog(50).subscribe(resolve));
    expect(result).toBe('ignore');
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should open dialog for elements count > 99', async () => {
    const dialogRefMock = {
      afterClosed: vi.fn(() => of('open')),
    } as unknown as MatDialogRef<LargeFileWarningComponent>;

    vi.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    const result = await new Promise(resolve => service.openDialog(120).subscribe(resolve));
    expect(result).toBe('open');
    expect(dialog.open).toHaveBeenCalledWith(LargeFileWarningComponent, {
      data: {elementsCount: 120},
    });
  });
});
