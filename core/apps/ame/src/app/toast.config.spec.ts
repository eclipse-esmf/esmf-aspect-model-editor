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

import {importProvidersFrom} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ToastrModule, ToastrService} from 'ngx-toastr';
import {afterEach, describe, expect, it} from 'vitest';
import {TOAST_CONFIG} from './toast.config';

describe('TOAST_CONFIG', () => {
  afterEach(() => document.querySelectorAll('.toast-container').forEach(container => container.remove()));

  it('shows toasts at the bottom center', () => {
    TestBed.configureTestingModule({providers: [provideNoopAnimations(), importProvidersFrom(ToastrModule.forRoot(TOAST_CONFIG))]});
    const toastr = TestBed.inject(ToastrService);

    toastr.info('The model is valid', 'Validation completed successfully');

    const container = document.querySelector('.toast-container');
    expect(container?.classList).toContain('toast-top-center');
    expect(toastr.toasts.map(toast => toast.title)).toEqual(['Validation completed successfully']);
  });
});
