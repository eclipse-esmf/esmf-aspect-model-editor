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

import {BackendStatus, BackendStatusService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BackendStatusOverlayComponent} from './backend-status-overlay.component';

describe('BackendStatusOverlayComponent', () => {
  let fixture: ComponentFixture<BackendStatusOverlayComponent>;
  let status: ReturnType<typeof signal<BackendStatus>>;
  let backendStatus: {status: typeof status; retrying: ReturnType<typeof signal<boolean>>; retry: any; quit: any};

  const query = (testId: string) => fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));

  beforeEach(() => {
    status = signal<BackendStatus>({state: 'starting', port: '30001', message: null, revision: 1});
    backendStatus = {status, retrying: signal(false), retry: vi.fn(), quit: vi.fn()};

    TestBed.configureTestingModule({
      imports: [BackendStatusOverlayComponent, TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [{provide: BackendStatusService, useValue: backendStatus}],
    });
    fixture = TestBed.createComponent(BackendStatusOverlayComponent);
    fixture.detectChanges();
  });

  it('shows a spinner without actions while starting', () => {
    expect(query('backend-status-spinner')).toBeTruthy();
    expect(query('backend-status-retry')).toBeNull();
    expect(query('backend-status-quit')).toBeNull();
    expect(fixture.nativeElement.getAttribute('data-state')).toBe('starting');
  });

  it('offers only retry and quit when failed', () => {
    status.set({state: 'failed', port: '30001', message: 'Backend executable not found.', revision: 2});
    fixture.detectChanges();

    expect(query('backend-status-spinner')).toBeNull();
    expect(query('backend-status-message').nativeElement.textContent).toContain('Backend executable not found.');
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(2);

    query('backend-status-retry').nativeElement.click();
    query('backend-status-quit').nativeElement.click();

    expect(backendStatus.retry).toHaveBeenCalled();
    expect(backendStatus.quit).toHaveBeenCalled();
  });

  it('disables retry while a retry is in progress', () => {
    status.set({state: 'failed', port: '30001', message: null, revision: 2});
    backendStatus.retrying.set(true);
    fixture.detectChanges();

    expect(query('backend-status-retry').nativeElement.disabled).toBe(true);
  });
});
