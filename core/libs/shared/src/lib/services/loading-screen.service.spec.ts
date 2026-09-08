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
import {LoadingScreenComponent} from '../components';
import {LoadingScreenService} from './loading-screen.service';

describe('LoadingScreenService', () => {
  let service: LoadingScreenService;
  let matDialogMock: {open: ReturnType<typeof vi.fn>};
  let dialogRefMock: {close: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    dialogRefMock = {close: vi.fn()};
    matDialogMock = {open: vi.fn(() => dialogRefMock)};

    TestBed.configureTestingModule({
      providers: [LoadingScreenService, {provide: MatDialog, useValue: matDialogMock}],
    });

    service = TestBed.inject(LoadingScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open() should open dialog and assign dialog property', () => {
    const options = {title: 'Loading', content: 'Loading content', hasCloseButton: false};
    const ref = service.open(options);

    expect(matDialogMock.open).toHaveBeenCalledWith(LoadingScreenComponent, {
      data: options,
      disableClose: true,
    });
    expect(ref).toBe(dialogRefMock);
    expect(service.dialog).toBe(dialogRefMock);
  });

  it('close() should close dialog and set dialog property to null', () => {
    service.open({title: 'Loading'});
    service.close();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(service.dialog).toBeNull();
  });
});
