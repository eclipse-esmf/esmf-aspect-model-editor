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
import {provideRouter} from '@angular/router';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it} from 'vitest';
import {BackendGateComponent} from './backend-gate.component';

describe('BackendGateComponent', () => {
  let fixture: ComponentFixture<BackendGateComponent>;
  let isReady: ReturnType<typeof signal<boolean>>;
  let hasBeenReady: ReturnType<typeof signal<boolean>>;

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    isReady = signal(false);
    hasBeenReady = signal(false);
    const status = signal<BackendStatus>({state: 'starting', port: '30001', message: null, revision: 1});

    TestBed.configureTestingModule({
      imports: [BackendGateComponent, TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [provideRouter([]), {provide: BackendStatusService, useValue: {isReady, hasBeenReady, status, retrying: signal(false)}}],
    });
    fixture = TestBed.createComponent(BackendGateComponent);
    fixture.detectChanges();
  });

  it('does not render the application before the backend was ready', () => {
    expect(el().querySelector('router-outlet')).toBeNull();
    expect(el().querySelector('ame-backend-status-overlay')).not.toBeNull();
  });

  it('renders the application without overlay when ready', () => {
    isReady.set(true);
    hasBeenReady.set(true);
    fixture.detectChanges();

    expect(el().querySelector('router-outlet')).not.toBeNull();
    expect(el().querySelector('.app-content').hasAttribute('inert')).toBe(false);
    expect(el().querySelector('ame-backend-status-overlay')).toBeNull();
  });

  it('keeps the application but makes it inert after a crash', () => {
    hasBeenReady.set(true);
    fixture.detectChanges();

    expect(el().querySelector('router-outlet')).not.toBeNull();
    expect(el().querySelector('.app-content').hasAttribute('inert')).toBe(true);
    expect(el().querySelector('ame-backend-status-overlay')).not.toBeNull();
  });
});
