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

import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {beforeEach, describe, expect, it} from 'vitest';
import {ConfigurationService} from '../state/settings/configuration.service';
import {ModelHeaderService} from './model-header.service';

describe('ModelHeaderService', () => {
  let service: ModelHeaderService;
  let copyrightHeader: string[];

  const createModel = (header: string[] | null) => {
    const rdfModel = new RdfModel(new Store(), '2.2.0');
    rdfModel.serializationMetadata.headerComments = header;
    return rdfModel;
  };

  beforeEach(() => {
    copyrightHeader = ['# Default copyright'];
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), {provide: ConfigurationService, useValue: {getSettings: () => ({copyrightHeader})}}],
    });
    service = TestBed.inject(ModelHeaderService);
  });

  it('should use the header of the file', () => {
    const rdfModel = createModel(['# File header', '']);
    expect(service.withHeader('@prefix x.\n', rdfModel)).toBe('# File header\n\n@prefix x.\n');
  });

  it('should keep a file without header without header', () => {
    expect(service.withHeader('@prefix x.\n', createModel([]))).toBe('@prefix x.\n');
  });

  it('should use the configured default for models without source file', () => {
    expect(service.withHeader('@prefix x.\n', createModel(null))).toBe('# Default copyright\n\n@prefix x.\n');
    expect(service.withHeader('@prefix x.\n', null)).toBe('# Default copyright\n\n@prefix x.\n');
  });

  it('should keep the header of different files apart', () => {
    const a = createModel(['# A', '']);
    const b = createModel(['# B']);
    expect(service.getHeaderText(a)).toBe('# A');
    expect(service.getHeaderText(b)).toBe('# B');
  });

  it('should only change the file header when the text differs', () => {
    const rdfModel = createModel(['# A']);
    service.setHeaderText(rdfModel, '# A\n');
    expect(rdfModel.serializationMetadata.headerComments).toEqual(['# A']);

    service.setHeaderText(rdfModel, '# B\n# C');
    expect(rdfModel.serializationMetadata.headerComments).toEqual(['# B', '# C', '']);

    service.setHeaderText(rdfModel, '');
    expect(rdfModel.serializationMetadata.headerComments).toEqual([]);
  });
});
