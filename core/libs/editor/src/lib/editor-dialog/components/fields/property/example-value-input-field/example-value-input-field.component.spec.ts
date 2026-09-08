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
import {DefaultCharacteristic, DefaultProperty, DefaultScalar, ModelElementCache, RdfModel, ScalarValue} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ExampleValueInputFieldComponent} from './example-value-input-field.component';

describe('ExampleValueInputFieldComponent', () => {
  let component: ExampleValueInputFieldComponent;
  let fixture: ComponentFixture<ExampleValueInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let property: DefaultProperty;

  beforeEach(() => {
    property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#testProp',
      name: 'testProp',
      metaModelVersion: '2.0.0',
    });
    const char = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#testChar',
      name: 'testChar',
      metaModelVersion: '2.0.0',
    });
    char.dataType = new DefaultScalar({
      urn: 'urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#string',
      metaModelVersion: '2.0.0',
    });
    property.characteristic = char;
    property.exampleValue = new ScalarValue({value: 'exampleString', type: char.dataType});

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        ExampleValueInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(property)),
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
        MockProvider(SearchService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(ExampleValueInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register exampleValue in signalForm', () => {
    expect(component).toBeTruthy();
    expect(component.displayValue()).toBe('exampleString');
    expect(signalForm.value().exampleValue).toEqual(property.exampleValue);
  });

  it('should select example value as scalar literal', () => {
    component.selectExampleValue('newExampleValue', true);
    expect(component.displayValue()).toBe('newExampleValue');
    expect((signalForm.value().exampleValue as ScalarValue).value).toBe('newExampleValue');
  });

  it('should unregister exampleValue on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('exampleValue');
  });
});
