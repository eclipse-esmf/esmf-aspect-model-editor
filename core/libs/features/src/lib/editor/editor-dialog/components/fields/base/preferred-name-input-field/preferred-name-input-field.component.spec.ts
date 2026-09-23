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
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {PreferredNameInputFieldComponent} from './preferred-name-input-field.component';

describe('PreferredNameInputFieldComponent', () => {
  let component: PreferredNameInputFieldComponent;
  let fixture: ComponentFixture<PreferredNameInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let property: DefaultProperty;

  beforeEach(() => {
    property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#testProp',
      name: 'testProp',
      metaModelVersion: '2.0.0',
    });
    property.preferredNames.set('en', 'English Preferred');
    property.preferredNames.set('de', 'Deutscher Vorzugsname');

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [PreferredNameInputFieldComponent, BrowserAnimationsModule],
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
    fixture = TestBed.createComponent(PreferredNameInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize preferredName controls for each locale', () => {
    expect(component).toBeTruthy();
    expect(component.getPreferredNamesLocales()).toEqual(['en', 'de']);
    expect(signalForm.value().preferredNameen).toBe('English Preferred');
    expect(signalForm.value().preferredNamede).toBe('Deutscher Vorzugsname');
  });

  it('should update signalForm on field changes', () => {
    component.field('en')().value.set('Updated Preferred');
    expect(signalForm.value().preferredNameen).toBe('Updated Preferred');
  });

  it('should detect inherited preferredName when extends is present', () => {
    const baseProp = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#baseProp',
      name: 'baseProp',
      metaModelVersion: '2.0.0',
    });
    baseProp.preferredNames.set('en', 'Base Preferred');
    property.extends_ = baseProp;

    component.field('en')().value.set('Base Preferred');
    expect(component.isInherited('en')).toBe(true);
  });

  it('should unregister all fields on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('preferredNameen');
    expect(signalForm.value()).not.toHaveProperty('preferredNamede');
  });

  it('should safely return empty locales when metaModelElement is null', () => {
    component.metaModelElement = null;
    expect(component.getPreferredNamesLocales()).toEqual([]);
    expect(component.getDescriptionsLocales()).toEqual([]);
  });
});
