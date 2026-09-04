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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultCharacteristic, DefaultOperation, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {InputChiplistFieldComponent} from './input-chiplist-field.component';

describe('InputChiplistFieldComponent', () => {
  let component: InputChiplistFieldComponent;
  let fixture: ComponentFixture<InputChiplistFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let operation: DefaultOperation;
  let cachedFile: ModelElementCache;
  let prop1: DefaultProperty;

  beforeEach(() => {
    const char1 = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#Char1',
      name: 'Char1',
      metaModelVersion: '2.0.0',
    });

    prop1 = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
      characteristic: char1,
    });

    char1.parents.push(prop1);

    operation = new DefaultOperation({
      aspectModelUrn: 'urn:test:1.0.0#TestOp',
      name: 'TestOp',
      metaModelVersion: '2.0.0',
      input: [prop1],
    });

    prop1.parents.push(operation);

    cachedFile = new ModelElementCache();
    cachedFile.addElement(prop1.aspectModelUrn, prop1);
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        InputChiplistFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(operation)),
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
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(() => of(null)),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(InputChiplistFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize inputChipList in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().inputChipList).toEqual([prop1]);
  });

  it('should add a newly created property', () => {
    component.createNewProperty('newProp');
    const list = signalForm.value().inputChipList as DefaultProperty[];
    expect(list.length).toBe(2);
    expect(list[1].name).toBe('newProp');
  });

  it('should remove property from list', () => {
    component.remove(prop1);
    const list = signalForm.value().inputChipList as DefaultProperty[];
    expect(list.length).toBe(0);
  });

  it('should unregister inputChipList field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('inputChipList');
  });
});
