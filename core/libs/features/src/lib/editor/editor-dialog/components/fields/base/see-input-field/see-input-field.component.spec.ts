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
import {DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {SeeInputFieldComponent} from './see-input-field.component';

describe('SeeInputFieldComponent', () => {
  let component: SeeInputFieldComponent;
  let fixture: ComponentFixture<SeeInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let property: DefaultProperty;

  beforeEach(() => {
    property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#testProp',
      name: 'testProp',
      metaModelVersion: '2.0.0',
    });
    property.see = ['https://example.com/doc'];

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        SeeInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {defaultLang: 'en', availableLangs: ['en']}}),
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
    fixture = TestBed.createComponent(SeeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize see field with elements', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().see).toBe('https://example.com/doc');
    expect(component.elements().length).toBe(1);
    expect(component.elements()[0].urn).toBe('https://example.com/doc');
  });

  it('should add element to list when valid URI is provided', () => {
    component.searchField().value.set('https://example.com/second');
    component.addElementToList('SecondDoc');

    expect(component.elements().length).toBe(2);
    expect(signalForm.value().see).toBe('https://example.com/doc,https://example.com/second');
  });

  it('should remove element from list', () => {
    const toRemove = component.elements()[0];
    component.removeElement(toRemove);

    expect(component.elements().length).toBe(0);
    expect(signalForm.value().see).toBe('');
    expect(property.see).toEqual([]);
  });

  it('should update metaModelElement.see when adding an element', () => {
    component.searchField().value.set('https://example.com/second');
    component.addElementToList('SecondDoc');

    expect(property.see).toEqual(['https://example.com/doc', 'https://example.com/second']);
  });

  it('should unregister see field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('see');
  });
});
