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
import {of, Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadingScreenComponent} from '../components';
import {LoadingScreenService} from './loading-screen.service';

describe('LoadingScreenService', () => {
  let service: LoadingScreenService;
  let matDialogMock: {open: ReturnType<typeof vi.fn>};
  let dialogRefMock: {
    close: ReturnType<typeof vi.fn>;
    afterOpened: ReturnType<typeof vi.fn>;
    afterClosed: ReturnType<typeof vi.fn>;
  };
  let afterClosedSubject: Subject<any>;

  beforeEach(() => {
    vi.useFakeTimers();
    afterClosedSubject = new Subject<any>();
    dialogRefMock = {
      close: vi.fn(() => afterClosedSubject.next(undefined)),
      afterOpened: vi.fn(() => of(undefined)),
      afterClosed: vi.fn(() => afterClosedSubject.asObservable()),
    };
    matDialogMock = {open: vi.fn(() => dialogRefMock)};

    TestBed.configureTestingModule({
      providers: [LoadingScreenService, {provide: MatDialog, useValue: matDialogMock}],
    });

    service = TestBed.inject(LoadingScreenService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open({immediate: true}) should open dialog immediately and assign dialog property', () => {
    const options = {title: 'Loading', content: 'Loading content', hasCloseButton: false, immediate: true};
    const handle = service.open(options);

    expect(matDialogMock.open).toHaveBeenCalledWith(LoadingScreenComponent, {
      data: options,
      disableClose: true,
    });
    expect(handle).toBeDefined();
    expect(typeof handle.close).toBe('function');
    expect(service.dialog).toBe(dialogRefMock);
  });

  it('Fast operation: open() and close() before debounce expires never opens MatDialog', () => {
    const handle = service.open({title: 'Fast', debounceMs: 200});
    expect(matDialogMock.open).not.toHaveBeenCalled();

    // Operation finishes in 100ms (< 200ms)
    vi.advanceTimersByTime(100);
    handle.close();

    vi.advanceTimersByTime(200);
    expect(matDialogMock.open).not.toHaveBeenCalled();
    expect(service.dialog).toBeNull();
  });

  it('Loading activation: opens dialog after debounce period if operation is ongoing', () => {
    service.open({title: 'Slow operation', debounceMs: 200});
    expect(matDialogMock.open).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(matDialogMock.open).toHaveBeenCalledTimes(1);
    expect(service.dialog).toBe(dialogRefMock);
  });

  it('Minimum duration: respects minDurationMs before closing visible dialog', () => {
    const handle = service.open({title: 'Loading', immediate: true, minDurationMs: 300});
    expect(matDialogMock.open).toHaveBeenCalledTimes(1);

    handle.close();
    // Not closed immediately because minDurationMs is 300ms
    expect(dialogRefMock.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(service.dialog).toBeNull();
  });

  it('Consecutive operations: opening a new operation during pending hide keeps dialog visible', () => {
    const handleA = service.open({title: 'Op A', immediate: true, minDurationMs: 300});
    handleA.close();

    vi.advanceTimersByTime(50);
    expect(dialogRefMock.close).not.toHaveBeenCalled();

    // Operation B starts before minDuration timer expires
    const handleB = service.open({title: 'Op B'});

    // Past original minDuration of Op A
    vi.advanceTimersByTime(300);
    expect(dialogRefMock.close).not.toHaveBeenCalled();

    handleB.close();
    vi.advanceTimersByTime(300);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });

  it('Multiple concurrent open() calls: closing one handle does not close dialog for another active handle', () => {
    const handle1 = service.open({title: 'Op 1', immediate: true, minDurationMs: 300});
    const handle2 = service.open({title: 'Op 2', immediate: true, minDurationMs: 300});

    handle2.close();
    vi.advanceTimersByTime(500);
    // Dialog should still be open because handle1 is still active
    expect(dialogRefMock.close).not.toHaveBeenCalled();

    handle1.close();
    vi.advanceTimersByTime(300);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });

  it('Real dialog lifecycle: handle.afterOpened() and handle.afterClosed() delegate to MatDialogRef', () => {
    const openedSpy = vi.fn();
    const closedSpy = vi.fn();

    const handle = service.open({title: 'Lifecycle', immediate: true});
    handle.afterOpened().subscribe(openedSpy);
    handle.afterClosed().subscribe(closedSpy);

    expect(dialogRefMock.afterOpened).toHaveBeenCalled();
    expect(openedSpy).toHaveBeenCalled();

    handle.close();
    vi.advanceTimersByTime(300);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('Global close() closes active dialog respecting minDuration', () => {
    service.open({title: 'Global', immediate: true, minDurationMs: 300});
    service.close();

    expect(dialogRefMock.close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });
});
