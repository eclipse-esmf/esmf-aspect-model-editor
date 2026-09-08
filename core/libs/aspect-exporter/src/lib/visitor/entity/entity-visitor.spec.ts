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
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {EntityVisitor} from './entity-visitor';

describe('Entity Visitor', () => {
  let service: EntityVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    sammC: {ConstraintProperty: () => 'constraintProperty'} as any,
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(() => {}),
  } as any;

  const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#property1', name: 'property1', characteristic: null});
  const entity = new DefaultEntity({metaModelVersion: '1', aspectModelUrn: 'samm#entity1', name: 'entity1', properties: [property]});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityVisitor,
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

    service = TestBed.inject(EntityVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(entity);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfListService.push).toHaveBeenCalledWith(entity, property);
  });

  it('should update parent named characteristic with entity dataType', () => {
    const namedChar = new DefaultCharacteristic({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#char1',
      name: 'char1',
    });
    const entityWithParent = new DefaultEntity({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#entity1',
      name: 'entity1',
      properties: [],
    });
    entityWithParent.addParent(namedChar);

    service.visit(entityWithParent);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(namedChar, {dataType: 'samm#entity1'});
  });

  it('should not update parent anonymous characteristic as named node', () => {
    const anonChar = new DefaultCharacteristic({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Characteristic]_1234',
      name: '[Characteristic]',
      isAnonymous: true,
    });
    const entityWithAnonParent = new DefaultEntity({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#entity1',
      name: 'entity1',
      properties: [],
    });
    entityWithAnonParent.addParent(anonChar);

    service.visit(entityWithAnonParent);

    expect(service.rdfNodeService.update).not.toHaveBeenCalledWith(anonChar, expect.anything());
  });
});
