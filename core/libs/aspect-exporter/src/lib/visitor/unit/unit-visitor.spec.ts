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
import {DefaultUnit, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {UnitVisitor} from './unit-visitor';

describe('Unit Visitor', () => {
  let service: UnitVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(() => {}),
  } as any;

  beforeEach(() => {
    rdfModel.store = new Store();

    TestBed.configureTestingModule({
      providers: [
        UnitVisitor,
        MockProvider(RdfNodeService, {
          update: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });

    service = TestBed.inject(UnitVisitor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update the store with the default unit properties', () => {
    const unit = new DefaultUnit({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#unit1',
      name: 'unit1',
      symbol: 'kg',
      code: 'KGM',
      conversionFactor: '1',
      quantityKinds: [],
    });

    service.visit(unit);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(unit, {
      preferredName: [],
      symbol: 'kg',
      commonCode: 'KGM',
      conversionFactor: '1',
    });
  });

  it('should skip updating predefined units', () => {
    const unit = new DefaultUnit({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#unit1',
      name: 'unit1',
      quantityKinds: [],
      isPredefined: true,
    } as any);

    service.visit(unit);

    expect(service.rdfNodeService.update).not.toHaveBeenCalled();
  });

  it('should add a reference unit quad when a reference unit is set', () => {
    const referenceUnit = new DefaultUnit({metaModelVersion: '1', aspectModelUrn: 'samm#refUnit', name: 'refUnit', quantityKinds: []});
    const unit = new DefaultUnit({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#unit1',
      name: 'unit1',
      referenceUnit,
      quantityKinds: [],
    });

    service.visit(unit);

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#unit1'), rdfModel.samm.ReferenceUnitProperty(), null, null);
    expect(quads).toHaveLength(1);
    expect(quads[0].object.value).toBe('samm#refUnit');
  });

  it('should replace the quantity kind quads with the current ones', () => {
    const quantityKindA = {aspectModelUrn: 'samm#kindA'} as any;
    const quantityKindB = {aspectModelUrn: 'samm#kindB'} as any;

    rdfModel.store.addQuad(
      DataFactory.namedNode('samm#unit1'),
      rdfModel.samm.QuantityKindProperty(),
      DataFactory.namedNode('samm#staleKind'),
    );

    const unit = new DefaultUnit({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#unit1',
      name: 'unit1',
      quantityKinds: [quantityKindA, quantityKindB],
    });

    service.visit(unit);

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#unit1'), rdfModel.samm.QuantityKindProperty(), null, null);
    expect(quads.map(quad => quad.object.value).sort()).toEqual(['samm#kindA', 'samm#kindB']);
  });

  it('should ignore quantity kinds without an aspectModelUrn', () => {
    const unit = new DefaultUnit({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#unit1',
      name: 'unit1',
      quantityKinds: [{} as any, null],
    });

    expect(() => service.visit(unit)).not.toThrow();

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#unit1'), rdfModel.samm.QuantityKindProperty(), null, null);
    expect(quads).toHaveLength(0);
  });

  it('should remove the old quads when the aspect model urn changes because of a rename', () => {
    const unit = new DefaultUnit({metaModelVersion: '1', aspectModelUrn: 'samm#unit1', name: 'unit1', quantityKinds: []});
    rdfModel.store.addQuad(DataFactory.namedNode('samm#unit1'), DataFactory.namedNode('samm#p'), DataFactory.literal('old'));

    unit.name = 'unit2';
    service.visit(unit);

    expect(rdfModel.store.getQuads(DataFactory.namedNode('samm#unit1'), null, null, null)).toHaveLength(0);
  });
});
