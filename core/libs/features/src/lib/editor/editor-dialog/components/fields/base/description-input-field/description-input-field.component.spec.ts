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
import {DefaultCharacteristic, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {DescriptionInputFieldComponent} from './description-input-field.component';

describe('DescriptionInputFieldComponent', () => {
  let component: DescriptionInputFieldComponent;
  let fixture: ComponentFixture<DescriptionInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let property: DefaultProperty;

  beforeEach(() => {
    property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#testProp',
      name: 'testProp',
      metaModelVersion: '2.0.0',
    });
    property.descriptions.set('en', 'English description');
    property.descriptions.set('de', 'Deutsche Beschreibung');

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [DescriptionInputFieldComponent, BrowserAnimationsModule],
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
    fixture = TestBed.createComponent(DescriptionInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize description controls for each locale', () => {
    expect(component).toBeTruthy();
    expect(component.getDescriptionsLocales()).toEqual(['en', 'de']);
    expect(signalForm.value().descriptionen).toBe('English description');
    expect(signalForm.value().descriptionde).toBe('Deutsche Beschreibung');
  });

  it('should update signalForm on field changes', () => {
    component.field('en')().value.set('Updated description');
    expect(signalForm.value().descriptionen).toBe('Updated description');
  });

  it('should detect inherited description when extends is present', () => {
    const baseProp = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#baseProp',
      name: 'baseProp',
      metaModelVersion: '2.0.0',
    });
    baseProp.descriptions.set('en', 'Base description');
    property.extends_ = baseProp;

    component.field('en')().value.set('Base description');
    expect(component.isInherited('en')).toBe(true);
  });

  it('should return predefined description when metaModelElement is a predefined characteristic', () => {
    const predefinedChar = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#Timestamp',
      name: 'Timestamp',
      metaModelVersion: '2.0.0',
      isPredefined: true,
    });
    predefinedChar.descriptions.set('en', 'Predefined timestamp description');
    component.metaModelElement = predefinedChar;

    expect(component.getCurrentValue('descriptionen', 'en')).toBe('Predefined timestamp description');
  });

  it('should unregister all fields on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('descriptionen');
    expect(signalForm.value()).not.toHaveProperty('descriptionde');
  });

  it('should safely return empty locales when metaModelElement is null', () => {
    component.metaModelElement = null;
    expect(component.getDescriptionsLocales()).toEqual([]);
    expect(component.getPreferredNamesLocales()).toEqual([]);
  });
});
