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

import {LoadedFilesService} from '@ame/cache';
import {ModelElementNamingService} from '@ame/meta-model';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultConstraint,
  DefaultEntity,
  DefaultEvent,
  DefaultList,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ElementCreatorService} from './element-creator';

describe('ElementCreatorService', () => {
  let service: ElementCreatorService;
  let loadedFilesServiceMock: any;
  let namingServiceMock: any;
  let cachedFileMock: any;

  beforeEach(() => {
    cachedFileMock = {
      resolveInstance: vi.fn(el => el),
    };

    loadedFilesServiceMock = {
      currentLoadedFile: {
        namespace: 'org.example:1.0.0',
        cachedFile: cachedFileMock,
      },
    };

    namingServiceMock = {
      resolveMetaModelElement: vi.fn(el => el),
    };

    TestBed.configureTestingModule({
      providers: [
        ElementCreatorService,
        {provide: LoadedFilesService, useValue: loadedFilesServiceMock},
        {provide: ModelElementNamingService, useValue: namingServiceMock},
      ],
    });

    service = TestBed.inject(ElementCreatorService);
  });

  it('should be created and return currentFile', () => {
    expect(service).toBeTruthy();
    expect(service.currentFile).toBe(loadedFilesServiceMock.currentLoadedFile);
  });

  it('should create DefaultAspect', () => {
    const aspect = service.createEmptyElement(DefaultAspect);
    expect(aspect).toBeInstanceOf(DefaultAspect);
    expect(aspect.name).toBe('Aspect');
    expect(aspect.aspectModelUrn).toBe('urn:samm:org.example:1.0.0#Aspect');
  });

  it('should create DefaultProperty (non-abstract)', () => {
    const prop = service.createEmptyElement(DefaultProperty, {isAbstract: false});
    expect(prop).toBeInstanceOf(DefaultProperty);
    expect(prop.name).toBe('property');
    expect(prop.isAbstract).toBe(false);
    expect(prop.characteristic).toBeTruthy();
  });

  it('should create DefaultProperty (abstract)', () => {
    const prop = service.createEmptyElement(DefaultProperty, {isAbstract: true});
    expect(prop).toBeInstanceOf(DefaultProperty);
    expect(prop.name).toBe('abstractProperty');
    expect(prop.isAbstract).toBe(true);
    expect(prop.characteristic).toBeNull();
  });

  it('should create characteristic types (e.g. DefaultList)', () => {
    const listChar = service.createEmptyElement(DefaultList);
    expect(listChar).toBeInstanceOf(DefaultList);
    expect(listChar.name).toBe('Characteristic');
  });

  it('should create DefaultEntity', () => {
    const entity = service.createEmptyElement(DefaultEntity);
    expect(entity).toBeInstanceOf(DefaultEntity);
    expect(entity.name).toBe('Entity');
  });

  it('should create DefaultUnit', () => {
    const unit = service.createEmptyElement(DefaultUnit);
    expect(unit).toBeInstanceOf(DefaultUnit);
    expect(unit.name).toBe('unit');
  });

  it('should create DefaultConstraint', () => {
    const constraint = service.createEmptyElement(DefaultConstraint);
    expect(constraint).toBeTruthy();
    expect(constraint.name).toBe('EncodingConstraint');
  });

  it('should create DefaultTrait', () => {
    const trait = service.createEmptyElement(DefaultTrait);
    expect(trait).toBeInstanceOf(DefaultTrait);
    expect(trait.name).toBe('Trait');
  });

  it('should create DefaultOperation', () => {
    const op = service.createEmptyElement(DefaultOperation);
    expect(op).toBeInstanceOf(DefaultOperation);
    expect(op.name).toBe('operation');
  });

  it('should create DefaultEvent', () => {
    const event = service.createEmptyElement(DefaultEvent);
    expect(event).toBeInstanceOf(DefaultEvent);
    expect(event.name).toBe('event');
  });

  it('should create DefaultValue', () => {
    const value = service.createEmptyElement(DefaultValue);
    expect(value).toBeInstanceOf(DefaultValue);
    expect(value.name).toBe('Value');
  });

  it('should handle cached=true and resolveNaming=false', () => {
    const aspect = service.createEmptyElement(DefaultAspect, {resolveNaming: false, cached: true});
    expect(cachedFileMock.resolveInstance).toHaveBeenCalled();
    expect(aspect).toBeTruthy();
  });

  it('should handle cached=false and resolveNaming=false', () => {
    const aspect = service.createEmptyElement(DefaultAspect, {resolveNaming: false, cached: false});
    expect(namingServiceMock.resolveMetaModelElement).not.toHaveBeenCalled();
    expect(aspect).toBeTruthy();
  });
});
