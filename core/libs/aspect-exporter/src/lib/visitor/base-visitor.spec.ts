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

import {vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {LoadedFilesService} from '@ame/cache';
import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NamedElement} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {beforeEach, describe, expect, it} from 'vitest';
import {BaseVisitor} from './base-visitor';

@Injectable()
class TestVisitor extends BaseVisitor<void> {
  visit(_element: NamedElement): void {
    // not under test, only setPrefix() is exercised through this concrete subclass
  }

  public callSetPrefix(aspectModelUrn: string) {
    this.setPrefix(aspectModelUrn);
  }
}

describe('BaseVisitor', () => {
  let service: TestVisitor;
  let hasDependency: ReturnType<typeof vi.fn>;
  let addPrefix: ReturnType<typeof vi.fn>;
  let externalFiles: any[];

  const configureTestBed = () => {
    TestBed.configureTestingModule({
      providers: [
        TestVisitor,
        {
          provide: LoadedFilesService,
          useValue: {
            currentLoadedFile: {rdfModel: {hasDependency, addPrefix}},
            externalFiles,
          },
        },
      ],
    });

    service = TestBed.inject(TestVisitor);
  };

  beforeEach(() => {
    hasDependency = vi.fn(() => false);
    addPrefix = vi.fn();
    externalFiles = [];
  });

  it('should be created', () => {
    configureTestBed();
    expect(service).toBeTruthy();
  });

  it('should do nothing when the namespace is already a known dependency', () => {
    hasDependency = vi.fn(() => true);
    configureTestBed();

    service.callSetPrefix('urn:samm:test:1.0.0#Element');

    expect(hasDependency).toHaveBeenCalledWith('urn:samm:test:1.0.0#');
    expect(addPrefix).not.toHaveBeenCalled();
  });

  it('should add the prefix using the alias resolved from the matching external file', () => {
    const store = new Store();
    store.addQuad(
      DataFactory.namedNode('urn:samm:test:1.0.0#Element'),
      DataFactory.namedNode('urn:samm:test:1.0.0#p'),
      DataFactory.literal('v'),
    );
    const getAliasByDependency = vi.fn(() => 'ext');
    externalFiles = [{rdfModel: {store, getAliasByDependency}}];
    configureTestBed();

    service.callSetPrefix('urn:samm:test:1.0.0#Element');

    expect(getAliasByDependency).toHaveBeenCalledWith('urn:samm:test:1.0.0#');
    expect(addPrefix).toHaveBeenCalledWith('ext', 'urn:samm:test:1.0.0#');
  });

  it('should add an undefined alias when no external file matches the element', () => {
    externalFiles = [];
    configureTestBed();

    service.callSetPrefix('urn:samm:test:1.0.0#Element');

    expect(addPrefix).toHaveBeenCalledWith(undefined, 'urn:samm:test:1.0.0#');
  });

  it('should type the visit() method to accept a NamedElement', () => {
    configureTestBed();
    expect(typeof service.visit).toBe('function');
    expect(service.visit(undefined as unknown as NamedElement)).toBeUndefined();
  });
});
