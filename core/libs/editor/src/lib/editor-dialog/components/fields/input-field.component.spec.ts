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
import {MaxGraphService} from '@ame/max-graph';
import {SearchService} from '@ame/shared';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {InputFieldComponent} from './input-field.component';

@Component({
  selector: 'ame-test-input-field',
  template: '',
  imports: [],
})
class TestInputFieldComponent extends InputFieldComponent<DefaultProperty> {
  constructor() {
    super();
    this.fieldName = 'name';
  }
}

describe('InputFieldComponent', () => {
  let component: TestInputFieldComponent;
  let fixture: ComponentFixture<TestInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let cachedFile: ModelElementCache;
  let loadedFilesService: LoadedFilesService;
  let maxGraphService: MaxGraphService;
  let searchService: SearchService;

  const sampleProperty = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#testProp',
    name: 'testProp',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [TestInputFieldComponent],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(sampleProperty)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(MaxGraphService, {
          getAllCells: vi.fn(() => []),
        }),
        MockProvider(SearchService, {
          search: vi.fn((_v, cells) => cells),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    maxGraphService = TestBed.inject(MaxGraphService);
    searchService = TestBed.inject(SearchService);

    fixture = TestBed.createComponent(TestInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    component.metaModelElement = sampleProperty;
    fixture.detectChanges();
  });

  it('should create and initialize base properties', () => {
    expect(component).toBeTruthy();
    expect(component.currentCachedFile).toBe(cachedFile);
  });

  it('should return current value from metaModelElement or previousData', () => {
    expect(component.getCurrentValue('name')).toBe('testProp');

    fixture.componentRef.setInput('previousData', {name: 'prevName'});
    expect(component.getCurrentValue('name')).toBe('prevName');
  });

  it('should return predefined value when metaModelElement is predefined', () => {
    const predefinedElement = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#predefinedProp',
      name: 'predefinedProp',
      metaModelVersion: '2.0.0',
    });
    predefinedElement.isPredefined = true;
    component.metaModelElement = predefinedElement;
    fixture.componentRef.setInput('previousData', {name: 'ignored'});

    expect(component.getCurrentValue('name')).toBe('predefinedProp');
  });

  it('should return predefined localized description and preferred name for predefined characteristics', () => {
    const predefinedChar = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#Timestamp',
      name: 'Timestamp',
      metaModelVersion: '2.0.0',
      isPredefined: true,
    });
    predefinedChar.descriptions.set('en', 'Timestamp description');
    predefinedChar.preferredNames.set('en', 'Timestamp');
    (component as any).metaModelElement = predefinedChar;

    (component as any).fieldName = 'description';
    expect(component.getCurrentValue('descriptionen', 'en')).toBe('Timestamp description');

    (component as any).fieldName = 'preferredName';
    expect(component.getCurrentValue('preferredNameen', 'en')).toBe('Timestamp');
  });

  it('should get, set and remove field values in signalForm', () => {
    component.setFieldValue('customField', 'customVal');
    expect(signalForm.value().customField).toBe('customVal');

    component.removeField('customField');
    expect(signalForm.value()).not.toHaveProperty('customField');
  });

  it('should evaluate search string helpers correctly', () => {
    expect(component.inSearchList({name: 'MyProp', description: 'desc'}, 'prop')).toBe(true);
    expect(component.inSearchList({name: 'MyProp', description: 'desc'}, 'xyz')).toBe(false);
    expect(component.inSearchList({name: 'MyProp', description: 'desc'}, '')).toBe(true);

    expect(component.isLowerCase('abc')).toBe(true);
    expect(component.isLowerCase('ABC')).toBe(false);
    expect(component.isLowerCase('Property2#')).toBe(false);
    expect(component.isLowerCase('1abc')).toBe(false);

    expect(component.isUpperCase('Abc')).toBe(true);
    expect(component.isUpperCase('abc')).toBe(false);

    expect(component.isAlreadyDefined([{name: 'First'}, {name: 'Second'}], 'First')).toBe(true);
    expect(component.isAlreadyDefined([{name: 'First'}, {name: 'Second'}], 'Third')).toBe(false);
  });

  it('should search external elements properly', () => {
    const extProp = new DefaultProperty({
      aspectModelUrn: 'urn:ext:1.0.0#extProp',
      name: 'extProp',
      metaModelVersion: '2.0.0',
    });
    const cellProp = new Cell();
    (cellProp as any).getMetaModelElement = () => ({element: extProp});

    const extChar = new DefaultCharacteristic({
      aspectModelUrn: 'urn:ext:1.0.0#extChar',
      name: 'extChar',
      metaModelVersion: '2.0.0',
    });
    const cellChar = new Cell();
    (cellChar as any).getMetaModelElement = () => ({element: extChar});

    const extEntity = new DefaultEntity({
      aspectModelUrn: 'urn:ext:1.0.0#extEntity',
      name: 'extEntity',
      metaModelVersion: '2.0.0',
    });
    const cellEntity = new Cell();
    (cellEntity as any).getMetaModelElement = () => ({element: extEntity});

    vi.mocked(maxGraphService.getAllCells).mockReturnValue([cellProp, cellChar, cellEntity]);
    vi.mocked(searchService.search).mockReturnValue([cellProp, cellChar, cellEntity]);
    vi.mocked(loadedFilesService.isElementExtern).mockReturnValue(true);

    const propResults = component.searchExtProperty('ext');
    expect(propResults).toEqual([
      {
        name: 'extProp',
        description: '',
        urn: 'urn:ext:1.0.0#extProp',
        namespace: 'urn:ext:1.0.0',
      },
    ]);

    const charResults = component.searchExtCharacteristic('ext');
    expect(charResults).toEqual([
      {
        name: 'extChar',
        description: '',
        urn: 'urn:ext:1.0.0#extChar',
        namespace: 'urn:ext:1.0.0',
      },
    ]);

    const entityResults = component.searchExtEntity('ext');
    expect(entityResults.length).toBe(1);
    expect(entityResults[0].name).toBe('extEntity');
    expect(entityResults[0].complex).toBe(true);
  });

  it('should reset form on destroy if not changedMetaModel', () => {
    signalForm.set('other', 'val');
    fixture.destroy();
    expect(signalForm.value()).toEqual({changedMetaModel: null});
  });
});
