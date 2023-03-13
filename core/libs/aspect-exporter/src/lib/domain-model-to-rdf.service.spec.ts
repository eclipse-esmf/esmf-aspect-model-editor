/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {describe, expect, it} from '@jest/globals';

import {DomainModelToRdfService} from '@ame/aspect-exporter';
import {provideMockObject} from '../../../../jest-helpers';

describe('DomainModelToRdfService', () => {
  let service: DomainModelToRdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomainModelToRdfService,
          useValue: provideMockObject(DomainModelToRdfService),
        },
      ],
    });
    service = TestBed.inject(DomainModelToRdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
