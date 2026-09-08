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
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {Observable, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorDialogValidators} from './editor-dialog-validators';

describe('EditorDialogValidators', () => {
  let validators: EditorDialogValidators;
  let modelApiService: ModelApiService;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EditorDialogValidators,
        MockProvider(ModelApiService, {
          checkElementExists: vi.fn(() => of(false)),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
        }),
      ],
    });

    validators = TestBed.inject(EditorDialogValidators);
    modelApiService = TestBed.inject(ModelApiService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
  });

  it('validates comma-separated URL and URN values without an AbstractControl', () => {
    expect(EditorDialogValidators.seeURIValue('')).toBeNull();
    expect(EditorDialogValidators.seeURIValue('https://example.com/spec, urn:samm:com.example:1.0.0#Test')).toBeNull();
    expect(EditorDialogValidators.seeURIValue('invalid-uri-here')).toEqual({
      uri: {invalidUris: ['invalid-uri-here'], elementsCount: 1},
    });
  });

  it('returns null for an empty value or the unchanged element name', async () => {
    const element = property('myProp');

    expect(await resultOf(validators.duplicateNameValue('', element))).toBeNull();
    expect(await resultOf(validators.duplicateNameValue('myProp', element))).toBeNull();
    expect(modelApiService.checkElementExists).not.toHaveBeenCalled();
  });

  it('returns an external-reference error when the element exists in the workspace', async () => {
    const element = property('myProp');
    vi.spyOn(modelApiService, 'checkElementExists').mockReturnValue(of(true));

    const result = await resultOf(validators.duplicateNameValue('otherProp', element));

    expect(result).toEqual({checkShapeNameExtRef: true, foundModel: true});
  });

  it('returns the cached duplicate when it does not exist in the workspace', async () => {
    const element = property('myProp');
    const cached = property('cachedProp');
    loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(cached);

    const result = await resultOf(validators.duplicateNameValue('cachedProp', element));

    expect(result).toEqual({checkShapeName: true, foundModel: cached});
  });

  it('can force checking the unchanged name', async () => {
    const element = property('myProp');
    loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(element);

    const result = await resultOf(validators.duplicateNameValue('myProp', element, false));

    expect(result).toEqual({checkShapeName: true, foundModel: element});
  });

  it('allows a cached duplicate of the requested type', async () => {
    const element = property('property');
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(entity);

    const result = await resultOf(validators.duplicateNameWithDifferentTypeValue('Entity', element, DefaultEntity));

    expect(result).toBeNull();
  });

  it('rejects a cached duplicate of another type', async () => {
    const element = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    const duplicate = property('duplicate');
    loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(duplicate);

    const result = await resultOf(validators.duplicateNameWithDifferentTypeValue('duplicate', element, DefaultEntity));

    expect(result).toEqual({checkShapeName: true, foundModel: duplicate});
  });
});

function property(name: string): DefaultProperty {
  return new DefaultProperty({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0'});
}

function resultOf<T>(observable: Observable<T>): Promise<T> {
  return new Promise(resolve => observable.subscribe(resolve));
}
