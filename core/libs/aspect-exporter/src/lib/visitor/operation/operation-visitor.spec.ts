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

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultOperation, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {OperationVisitor} from './operation-visitor';

describe('Operation Visitor', () => {
  let service: OperationVisitor;
  let rdfNodeService: RdfNodeService;
  let operation: DefaultOperation;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    sammC: {ConstraintProperty: () => 'constraintProperty'} as any,
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(() => {}),
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationVisitor,
        MockProvider(RdfListService, {
          push: vi.fn(),
          createEmpty: vi.fn(),
        }),
        MockProvider(RdfNodeService, {
          update: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });

    rdfNodeService = TestBed.inject(RdfNodeService);
    operation = new DefaultOperation({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#operation1',
      name: 'operation1',
      input: [],
      output: null,
    });
    service = TestBed.inject(OperationVisitor);
  });

  it('should update store width default operations', () => {
    service.visit(operation);

    expect(rdfNodeService.update).toHaveBeenCalledWith(operation, {
      preferredName: [],
      description: [],
      see: [],
    });
  });
});
