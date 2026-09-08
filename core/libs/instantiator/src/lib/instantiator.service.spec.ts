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
import {
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
  DefaultValue,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InstantiatorService} from './instantiator.service';

const {namedNode, quad, blankNode} = DataFactory;

describe('InstantiatorService', () => {
  let service: InstantiatorService;
  let rdfModel: RdfModel;
  let cache: ModelElementCache;

  const namespace = 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#';

  beforeEach(() => {
    const store = new Store();
    rdfModel = new RdfModel(store, '2.0.0', namespace);
    cache = new ModelElementCache();

    TestBed.configureTestingModule({
      providers: [
        InstantiatorService,
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cache, null),
          filesAsList: [],
        }),
      ],
    });

    service = TestBed.inject(InstantiatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('instantiateElement', () => {
    it('should return null when element type is unknown or missing', () => {
      const subject = `${namespace}UnknownElement`;
      const result = service.instantiateElement(rdfModel, cache, subject);
      expect(result).toBeNull();
    });

    it('should instantiate a Property', () => {
      const subject = `${namespace}testProp`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Property()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultProperty);
      expect((result as DefaultProperty).aspectModelUrn).toBe(subject);
      expect((result as DefaultProperty).isAbstract).toBeFalsy();
    });

    it('should instantiate an Abstract Property', () => {
      const subject = `${namespace}testAbstractProp`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.AbstractProperty()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultProperty);
      expect((result as DefaultProperty).isAbstract).toBe(true);
    });

    it('should instantiate a Constraint', () => {
      const subject = `${namespace}TestConstraint`;
      const constraintType = namedNode(`${rdfModel.sammC.getNamespace()}EncodingConstraint`);
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), constraintType));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultConstraint);
    });

    it('should instantiate a standard Characteristic', () => {
      const subject = `${namespace}TestCharacteristic`;
      const charType = namedNode(`${rdfModel.sammC.getNamespace()}SingleEntity`);
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), charType));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultCharacteristic);
    });

    it('should instantiate a generic Characteristic', () => {
      const subject = `${namespace}GenericCharacteristic`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Characteristic()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultCharacteristic);
    });

    it('should instantiate an Operation', () => {
      const subject = `${namespace}testOp`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Operation()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultOperation);
    });

    it('should instantiate an Event', () => {
      const subject = `${namespace}testEvent`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Event()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultEvent);
    });

    it('should instantiate a Unit', () => {
      const subject = `${rdfModel.sammU.getDefaultUnitUri()}#metre`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Unit()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultUnit);
    });

    it('should instantiate an Entity', () => {
      const subject = `${namespace}TestEntity`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Entity()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultEntity);
    });

    it('should instantiate a Value', () => {
      const subject = `${namespace}testValue`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.Value()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultValue);
    });

    it('should instantiate an Abstract Entity', () => {
      const subject = `${namespace}TestAbstractEntity`;
      rdfModel.store.addQuad(quad(namedNode(subject), rdfModel.samm.RdfType(), rdfModel.samm.AbstractEntity()));

      const result = service.instantiateElement(rdfModel, cache, subject);

      expect(result).toBeInstanceOf(DefaultEntity);
    });

    it('should instantiate an EntityInstance when RdfModelUtil detects an entity instance', () => {
      const entitySubject = `${namespace}MyEntity`;
      const instanceSubject = `${namespace}MyInstance`;

      rdfModel.store.addQuad(quad(namedNode(entitySubject), rdfModel.samm.RdfType(), rdfModel.samm.Entity()));
      rdfModel.store.addQuad(quad(namedNode(instanceSubject), rdfModel.samm.RdfType(), namedNode(entitySubject)));

      const result = service.instantiateElement(rdfModel, cache, instanceSubject);

      expect(result).toBeInstanceOf(DefaultEntityInstance);
    });
  });

  describe('instantiateRemainingElements', () => {
    it('should instantiate and cache all un-cached non-blank subjects from currentRdfModel', () => {
      const propSubject = `${namespace}propOne`;
      const opSubject = `${namespace}opOne`;

      rdfModel.store.addQuad(quad(namedNode(propSubject), rdfModel.samm.RdfType(), rdfModel.samm.Property()));
      rdfModel.store.addQuad(quad(namedNode(opSubject), rdfModel.samm.RdfType(), rdfModel.samm.Operation()));

      // Blank node should be ignored
      const bNode = blankNode('b1');
      rdfModel.store.addQuad(quad(bNode, rdfModel.samm.RdfType(), rdfModel.samm.Property()));

      expect(cache.get(propSubject)).toBeUndefined();
      expect(cache.get(opSubject)).toBeUndefined();

      service.instantiateRemainingElements(rdfModel, rdfModel, cache);

      expect(cache.get(propSubject)).toBeInstanceOf(DefaultProperty);
      expect(cache.get(opSubject)).toBeInstanceOf(DefaultOperation);
    });

    it('should skip subjects that are already cached', () => {
      const propSubject = `${namespace}alreadyCached`;
      const existingProp = new DefaultProperty({
        aspectModelUrn: propSubject,
        name: 'alreadyCached',
        metaModelVersion: '2.0.0',
      });
      cache.addElement(propSubject, existingProp);

      rdfModel.store.addQuad(quad(namedNode(propSubject), rdfModel.samm.RdfType(), rdfModel.samm.Property()));

      const instantiateSpy = vi.spyOn(service, 'instantiateElement');

      service.instantiateRemainingElements(rdfModel, rdfModel, cache);

      expect(instantiateSpy).not.toHaveBeenCalledWith(rdfModel, cache, propSubject);
      expect(cache.get(propSubject)).toBe(existingProp);
    });
  });
});
