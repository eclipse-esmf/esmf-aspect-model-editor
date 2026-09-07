/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * work, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {ElementCreatorService, NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultCharacteristic, DefaultCollection, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {ElementCharacteristicInputFieldComponent} from './element-characteristic-input-field.component';

describe('ElementCharacteristicInputFieldComponent', () => {
  let component: ElementCharacteristicInputFieldComponent;
  let fixture: ComponentFixture<ElementCharacteristicInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let currentElement: DefaultCollection;
  let cachedFile: ModelElementCache;
  let loadedFilesService: LoadedFilesService;
  let notificationsService: NotificationsService;
  let elementCreator: ElementCreatorService;

  beforeEach(() => {
    currentElement = new DefaultCollection({
      aspectModelUrn: 'urn:test:1.0.0#Collection',
      name: 'Collection',
      metaModelVersion: '2.0.0',
    });
    cachedFile = new ModelElementCache();

    TestBed.configureTestingModule({
      imports: [
        ElementCharacteristicInputFieldComponent,
        MatAutocompleteModule,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(currentElement)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
          isElementInCurrentFile: vi.fn(() => true),
        }),
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(value => of(value === 'UsedName' ? {checkShapeName: true, foundModel: true} : null)),
        }),
        MockProvider(ElementCreatorService),
        MockProvider(NotificationsService, {error: vi.fn()}),
        MockProvider(RdfService),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    notificationsService = TestBed.inject(NotificationsService);
    elementCreator = TestBed.inject(ElementCreatorService);
    fixture = TestBed.createComponent(ElementCharacteristicInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should register display and object values in the shared form', () => {
    expect(component).toBeTruthy();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({elementCharacteristicDisplay: '', elementCharacteristic: null});
  });

  it('should initialize and lock an existing characteristic', () => {
    const characteristic = createCharacteristic('ExistingCharacteristic');
    currentElement.elementCharacteristic = characteristic;

    component.setElementCharacteristicControl();

    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({
      elementCharacteristicDisplay: characteristic.name,
      elementCharacteristic: characteristic,
    });
  });

  it('should select local and externally referenced characteristics', () => {
    const local = createCharacteristic('LocalCharacteristic');
    cachedFile.addElement(local.aspectModelUrn, local);

    component.onSelectionChange('elementCharacteristicDisplay', {name: local.name, description: '', urn: local.aspectModelUrn});
    expect(signalForm.value().elementCharacteristic).toBe(local);

    component.unlockElementCharacteristic();
    const external = createCharacteristic('ExternalCharacteristic');
    vi.mocked(loadedFilesService.findElementOnExtReferences).mockReturnValue(external);
    component.onSelectionChange('elementCharacteristicDisplay', {
      name: external.name,
      description: '',
      urn: external.aspectModelUrn,
    });
    expect(signalForm.value().elementCharacteristic).toBe(external);
  });

  it('should create a new characteristic and prevent self-links', () => {
    vi.spyOn(elementCreator, 'createEmptyElement').mockReturnValue(createCharacteristic('CreatedCharacteristic'));
    component.createNewCharacteristic('CreatedCharacteristic');

    expect(elementCreator.createEmptyElement).toHaveBeenCalled();
    expect((signalForm.value().elementCharacteristic as DefaultCharacteristic).aspectModelUrn).toBe('urn:test:1.0.0#CreatedCharacteristic');
    expect(component.displayField().disabled()).toBe(true);

    component.unlockElementCharacteristic();
    signalForm.set('name', 'RenamedCollection');
    component.createNewCharacteristic('RenamedCollection');
    expect(notificationsService.error).toHaveBeenCalledWith({title: 'Element characteristic cannot link itself.'});
    expect(signalForm.value().elementCharacteristic).toBeNull();
  });

  it('should disable display editing while a data type entity is selected', () => {
    signalForm.set('dataTypeEntity', {name: 'Entity'});

    expect(component.displayField().disabled()).toBe(true);

    signalForm.set('dataTypeEntity', null);
    expect(component.displayField().disabled()).toBe(false);
  });

  it('should filter local characteristics and exclude itself', () => {
    const matching = createCharacteristic('MatchingCharacteristic');
    cachedFile.addElement(currentElement.aspectModelUrn, currentElement);
    cachedFile.addElement(matching.aspectModelUrn, matching);
    component.displayField().value.set('Matching');

    expect(component.filteredCharacteristicTypes().map(option => option.name)).toEqual(['MatchingCharacteristic']);
  });

  it('should propagate async duplicate errors into shared validity', async () => {
    component.displayField().value.set('UsedName');
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.waitFor(() => expect(component.hasError('checkShapeName')).toBe(true));
    expect(signalForm.valid()).toBe(false);
  });

  it('should unlock, clear, touch, and unregister fields', () => {
    const characteristic = createCharacteristic('ExistingCharacteristic');
    component.onSelectionChange('elementCharacteristicDisplay', {
      name: characteristic.name,
      description: '',
      urn: characteristic.aspectModelUrn,
    });
    component.unlockElementCharacteristic();

    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({elementCharacteristicDisplay: '', elementCharacteristic: null});

    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('elementCharacteristicDisplay');
    expect(signalForm.value()).not.toHaveProperty('elementCharacteristic');
  });

  function createCharacteristic(name: string): DefaultCharacteristic {
    return new DefaultCharacteristic({
      aspectModelUrn: `urn:test:1.0.0#${name}`,
      name,
      metaModelVersion: '2.0.0',
    });
  }
});
