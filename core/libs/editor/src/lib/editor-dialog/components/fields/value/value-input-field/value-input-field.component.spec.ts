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
import {DefaultValue, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ValueInputFieldComponent} from './value-input-field.component';

describe('ValueInputFieldComponent', () => {
  let component: ValueInputFieldComponent;
  let fixture: ComponentFixture<ValueInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let valueElement: DefaultValue;

  beforeEach(() => {
    valueElement = new DefaultValue({
      aspectModelUrn: 'urn:test:1.0.0#TestValue',
      name: 'TestValue',
      metaModelVersion: '2.0.0',
      value: 'constantValue',
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        ValueInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {defaultLang: 'en', availableLangs: ['en']}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(valueElement)),
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
    fixture = TestBed.createComponent(ValueInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register value in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().value).toBe('constantValue');
    expect(component.field().valid()).toBe(true);
  });

  it('should validate required value', () => {
    component.field().value.set('');
    expect(component.hasError('required')).toBe(true);
    expect(signalForm.valid()).toBe(false);
  });

  it('should unregister value field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('value');
  });
});
