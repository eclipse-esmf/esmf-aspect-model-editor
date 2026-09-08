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

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultEvent, DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {ListProperties, RdfListService} from '../../rdf-list';
import {EventVisitor} from './event-visitor';

describe('Event Visitor', () => {
  let service: EventVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(() => {}),
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventVisitor,
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

    service = TestBed.inject(EventVisitor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update the store with the default event properties', () => {
    const event = new DefaultEvent({metaModelVersion: '1', aspectModelUrn: 'samm#event1', name: 'event1'});

    service.visit(event);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(event, {
      preferredName: [],
      description: [],
      see: [],
    });
  });

  it('should push the parameters and set their prefixes when the event has properties', () => {
    const parameter = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#param1', name: 'param1', characteristic: null});
    const event = new DefaultEvent({metaModelVersion: '1', aspectModelUrn: 'samm#event1', name: 'event1', properties: [parameter]});

    service.visit(event);

    expect(service.rdfListService.push).toHaveBeenCalledWith(event, parameter);
    expect(service.rdfListService.createEmpty).not.toHaveBeenCalled();
  });

  it('should create an empty parameters list when the event has no properties', () => {
    const event = new DefaultEvent({metaModelVersion: '1', aspectModelUrn: 'samm#event1', name: 'event1', properties: []});

    service.visit(event);

    expect(service.rdfListService.createEmpty).toHaveBeenCalledWith(event, ListProperties.parameters);
    expect(service.rdfListService.push).not.toHaveBeenCalled();
  });

  it('should remove the old quads when the aspect model urn changes because of a rename', () => {
    const event = new DefaultEvent({metaModelVersion: '1', aspectModelUrn: 'samm#event1', name: 'event1'});
    rdfModel.store.addQuad(DataFactory.namedNode('samm#event1'), DataFactory.namedNode('samm#p'), DataFactory.literal('old'));

    event.name = 'event2';
    service.visit(event);

    expect(rdfModel.store.getQuads(DataFactory.namedNode('samm#event1'), null, null, null)).toHaveLength(0);
  });
});
