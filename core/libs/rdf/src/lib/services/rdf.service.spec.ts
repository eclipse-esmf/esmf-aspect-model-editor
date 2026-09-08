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

import {ModelApiService} from '@ame/api';
import {NamespaceFile} from '@ame/cache';
import {APP_CONFIG} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {RdfSerializerService} from './rdf-serializer.service';
import {RdfService} from './rdf.service';

describe('RdfService', () => {
  let service: RdfService;
  let modelApiService: {fetchFormatedAspectModel: ReturnType<typeof vi.fn>};
  let rdfSerializerService: {serializeModel: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    modelApiService = {
      fetchFormatedAspectModel: vi.fn(),
    };
    rdfSerializerService = {
      serializeModel: vi.fn(() => '@prefix : <urn:samm:...> .'),
    };

    TestBed.configureTestingModule({
      providers: [
        RdfService,
        {provide: ModelApiService, useValue: modelApiService},
        {provide: RdfSerializerService, useValue: rdfSerializerService},
        {provide: APP_CONFIG, useValue: {currentSammVersion: '2.2.0'}},
      ],
    });

    service = TestBed.inject(RdfService);
  });

  it('should be created and register on window in non-production mode', () => {
    expect(service).toBeTruthy();
    expect((window as unknown as Record<string, unknown>)['angular.rdfService']).toBe(service);
  });

  describe('serializeModel', () => {
    it('should delegate serialization to RdfSerializerService', () => {
      const rdfModel = new RdfModel(new Store(), '2.2.0', null);
      const result = service.serializeModel(rdfModel);

      expect(rdfSerializerService.serializeModel).toHaveBeenCalledWith(rdfModel);
      expect(result).toBe('@prefix : <urn:samm:...> .');
    });
  });

  describe('isSameModelContent', () => {
    it('should return false if absoluteFileName does not match fileToCompare.absoluteName', async () => {
      const fileToCompare: NamespaceFile = {
        absoluteName: 'pkg:1.0.0:Aspect.ttl',
        rdfModel: new RdfModel(new Store(), '2.2.0', 'pkg:1.0.0:Aspect.ttl'),
      } as NamespaceFile;

      const result = await new Promise<boolean>(resolve => {
        service.isSameModelContent('different:1.0.0:Aspect.ttl', 'content', fileToCompare).subscribe(resolve);
      });

      expect(result).toBe(false);
      expect(modelApiService.fetchFormatedAspectModel).not.toHaveBeenCalled();
    });

    it('should return false if fileToCompare has no rdfModel', async () => {
      const fileToCompare: NamespaceFile = {
        absoluteName: 'pkg:1.0.0:Aspect.ttl',
        rdfModel: null as unknown as RdfModel,
      } as NamespaceFile;

      const result = await new Promise<boolean>(resolve => {
        service.isSameModelContent('pkg:1.0.0:Aspect.ttl', 'content', fileToCompare).subscribe(resolve);
      });

      expect(result).toBe(false);
      expect(modelApiService.fetchFormatedAspectModel).not.toHaveBeenCalled();
    });

    it('should fetch formatted model and return true if content matches formatted model', async () => {
      const rdfModel = new RdfModel(new Store(), '2.2.0', 'pkg:1.0.0:Aspect.ttl');
      rdfModel.setSourceLocation('pkg:1.0.0:Aspect.ttl');
      const fileToCompare: NamespaceFile = {
        absoluteName: 'pkg:1.0.0:Aspect.ttl',
        rdfModel,
      } as NamespaceFile;

      const serializedContent = 'serialized-content';
      const formattedContent = 'formatted-content';
      rdfSerializerService.serializeModel.mockReturnValue(serializedContent);
      modelApiService.fetchFormatedAspectModel.mockReturnValue(of(formattedContent));

      const result = await new Promise<boolean>(resolve => {
        service.isSameModelContent('pkg:1.0.0:Aspect.ttl', formattedContent, fileToCompare).subscribe(resolve);
      });

      expect(rdfSerializerService.serializeModel).toHaveBeenCalledWith(rdfModel);
      expect(modelApiService.fetchFormatedAspectModel).toHaveBeenCalledWith(serializedContent, 'pkg:1.0.0:Aspect.ttl');
      expect(result).toBe(true);
    });

    it('should return false if content differs from formatted model', async () => {
      const rdfModel = new RdfModel(new Store(), '2.2.0', 'pkg:1.0.0:Aspect.ttl');
      const fileToCompare: NamespaceFile = {
        absoluteName: 'pkg:1.0.0:Aspect.ttl',
        rdfModel,
      } as NamespaceFile;

      rdfSerializerService.serializeModel.mockReturnValue('serialized');
      modelApiService.fetchFormatedAspectModel.mockReturnValue(of('formatted'));

      const result = await new Promise<boolean>(resolve => {
        service.isSameModelContent('pkg:1.0.0:Aspect.ttl', 'different-content', fileToCompare).subscribe(resolve);
      });

      expect(result).toBe(false);
    });
  });
});
