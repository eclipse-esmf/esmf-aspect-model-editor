/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MxGraphService} from '@ame/mx-graph';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProvider, MockProviders} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {PropertyVisitor} from './property-visitor';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Property Visitor', () => {
  let service: PropertyVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    sammC: {ConstraintProperty: () => 'constraintProperty'} as any,
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;
  const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#property1', name: 'property1', characteristic: null});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropertyVisitor,
        MockProviders(MxGraphService),
        MockProviders(MxGraphService),
        MockProvider(MxGraphService),
        MockProvider(RdfListService, {
          push: jest.fn(),
          createEmpty: jest.fn(),
        }),
        MockProvider(RdfNodeService, {
          update: jest.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });

    service = TestBed.inject(PropertyVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(property);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(property, {
      exampleValue: null,
      preferredName: [],
      description: [],
      see: [],
    });
  });
});
