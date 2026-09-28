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
import {RenameModelComponent} from './rename-model.component';
import {RenameModelDialogService} from './rename-model.service';

describe('RenameModelDialogService', () => {
  let service: RenameModelDialogService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RenameModelDialogService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(RenameModelDialogService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should open dialog with 550px width and return afterClosed result', async () => {
    const dialogRefMock = {
      afterClosed: vi.fn(() => of({name: 'newModel.ttl'})),
    } as unknown as MatDialogRef<RenameModelComponent>;

    vi.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    const result = await new Promise(resolve => service.open().subscribe(resolve));

    expect(dialog.open).toHaveBeenCalledWith(RenameModelComponent, {width: '550px'});
    expect(result).toEqual({name: 'newModel.ttl'});
  });
});
