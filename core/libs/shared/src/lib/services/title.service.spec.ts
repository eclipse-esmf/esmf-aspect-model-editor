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
import {Title} from '@angular/platform-browser';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TitleService} from './title.service';

describe('TitleService', () => {
  let service: TitleService;
  let titleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TitleService, Title],
    });

    service = TestBed.inject(TitleService);
    titleSpy = vi.spyOn(service, 'setTitle');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('updateTitle should format and set document title', () => {
    service.updateTitle('org.eclipse.esmf:1.0.0:AspectTest');
    expect(titleSpy).toHaveBeenCalledWith('AspectTest - org.eclipse.esmf:1.0.0 | Aspect Model Editor');
  });

  it('updateTitle should do nothing if absoluteName is empty', () => {
    service.updateTitle('');
    expect(titleSpy).not.toHaveBeenCalled();
  });
});
