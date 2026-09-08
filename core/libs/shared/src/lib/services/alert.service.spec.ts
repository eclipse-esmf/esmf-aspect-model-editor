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
import {MatDialog} from '@angular/material/dialog';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AlertComponent} from '../components';
import {AlertService} from './alert.service';

describe('AlertService', () => {
  let service: AlertService;
  let matDialogMock: {open: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    matDialogMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AlertService, {provide: MatDialog, useValue: matDialogMock}],
    });

    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open() should call matDialog.open with default button texts and config', () => {
    service.open({data: {title: 'Test', content: 'Message'}});

    expect(matDialogMock.open).toHaveBeenCalledWith(AlertComponent, {
      minWidth: '500px',
      maxWidth: '800px',
      disableClose: true,
      data: {
        title: 'Test',
        content: 'Message',
        leftButtonText: 'Close',
        rightButtonText: 'Ok',
      },
    });
  });

  it('open() should preserve custom button texts', () => {
    service.open({
      data: {
        title: 'Custom',
        content: 'Custom Msg',
        leftButtonText: 'Dismiss',
        rightButtonText: 'Save',
      },
    });

    expect(matDialogMock.open).toHaveBeenCalledWith(
      AlertComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          leftButtonText: 'Dismiss',
          rightButtonText: 'Save',
        }),
      }),
    );
  });
});
