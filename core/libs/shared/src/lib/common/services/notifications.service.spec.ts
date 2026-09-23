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
import {ToastrService} from 'ngx-toastr';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NotificationType} from '../enums';
import {NotificationsService} from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let toastrMock: {
    warning: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    toastrMock = {
      warning: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [NotificationsService, {provide: ToastrService, useValue: toastrMock}],
    });

    service = TestBed.inject(NotificationsService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created and start with empty notifications', () => {
    expect(service).toBeTruthy();
    expect(service.getNotifications()).toEqual([]);
  });

  it('warning() should push notification and call toastr.warning', () => {
    let badge: string | null = null;
    service.badgeText.subscribe(val => (badge = val));

    service.warning({title: 'Warn', message: 'Warning message'});

    expect(service.getNotifications()).toHaveLength(1);
    expect(service.getNotifications()[0].type).toBe(NotificationType.Warning);
    expect(badge).toBe('1');
    expect(toastrMock.warning).toHaveBeenCalledWith('Warning message', 'Warn', {timeOut: 2000});
  });

  it('error() should push notification and call toastr.error', () => {
    service.error({title: 'Err', message: 'Error message'});

    expect(service.getNotifications()).toHaveLength(1);
    expect(service.getNotifications()[0].type).toBe(NotificationType.Error);
    expect(toastrMock.error).toHaveBeenCalledWith('Error message', 'Err', {timeOut: 2000});
  });

  it('info() and success() should push notifications and call respective toastr methods', () => {
    service.info({title: 'Info', message: 'Info message'});
    expect(toastrMock.info).toHaveBeenCalledWith('Info message', 'Info', {timeOut: 2000});

    service.success({title: 'Success', message: 'Success message'});
    expect(toastrMock.success).toHaveBeenCalledWith('Success message', 'Success', {timeOut: 2000});

    expect(service.getNotifications()).toHaveLength(2);
  });

  it('clearNotifications() should clear all notifications when no param is passed', () => {
    let badge: string | null = null;
    service.badgeText.subscribe(val => (badge = val));

    service.info({title: 'Info'});
    service.clearNotifications();

    expect(service.getNotifications()).toEqual([]);
    expect(badge).toBeNull();
  });

  it('clearNotifications() should filter specified notifications', () => {
    service.info({title: 'Info 1'});
    service.info({title: 'Info 2'});
    const itemToDelete = service.getNotifications()[0];

    service.clearNotifications([itemToDelete]);
    expect(service.getNotifications()).toHaveLength(1);
  });

  it('validationError() should debounce and group multiple validation errors', () => {
    service.validationError({title: 'Validation 1', message: 'Error 1'});
    service.validationError({title: 'Validation 2', message: 'Error 2'});

    vi.advanceTimersByTime(150);

    expect(toastrMock.error).toHaveBeenCalledWith('Validation completed with errors', undefined, {timeOut: 2000});
    expect(service.getNotifications()).toHaveLength(2);
  });

  it('validationError() with single error should show single error message', () => {
    service.validationError({title: 'Validation 1', message: 'Single error'});

    vi.advanceTimersByTime(150);

    expect(toastrMock.error).toHaveBeenCalledWith('Single error', 'Validation 1', {timeOut: 2000});
  });
});
