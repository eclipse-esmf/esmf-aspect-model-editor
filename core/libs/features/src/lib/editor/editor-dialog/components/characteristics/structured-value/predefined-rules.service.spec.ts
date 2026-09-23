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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it} from 'vitest';
import {PredefinedRulesService} from './predefined-rules.service';

describe('PredefinedRulesService', () => {
  let service: PredefinedRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PredefinedRulesService,
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
        }),
      ],
    });

    service = TestBed.inject(PredefinedRulesService);
  });

  it('should return null for unknown rule', () => {
    expect(service.getRule('unknown-rule')).toBeNull();
  });

  it('should return Email Address rule with parsed properties', () => {
    const rule = service.getRule('([\\w\\.-]+)@([\\w\\.-]+\\.\\w{2,4})');
    expect(rule).toBeDefined();
    expect(rule.name).toBe('Email Address');
    expect(rule.elements.length).toBe(3);
    expect(rule.elements[1]).toBe('@');
  });

  it('should return ISO 8601 Date rule', () => {
    const rule = service.getRule('(\\d{4})-(\\d{2})-(\\d{2})');
    expect(rule).toBeDefined();
    expect(rule.name).toBe('ISO 8601 Date');
  });

  it('should return Hex-encoded color rule', () => {
    const rule = service.getRule('0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})');
    expect(rule).toBeDefined();
    expect(rule.name).toBe('Hex-encoded color');
  });
});
