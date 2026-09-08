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
import {RdfService} from '@ame/rdf/services';
import {DataTypeService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatOptionSelectionChange} from '@angular/material/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultCharacteristic, DefaultEntity, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {DataTypeInputFieldComponent} from './data-type-input-field.component';

describe('DataTypeInputFieldComponent', () => {
  let component: DataTypeInputFieldComponent;
  let fixture: ComponentFixture<DataTypeInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let characteristic: DefaultCharacteristic;
  let cachedFile: ModelElementCache;
  let loadedFilesService: LoadedFilesService;

  const stringType = {
    isDefinedBy: 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#string',
    description: 'A string value',
  };

  beforeEach(() => {
    characteristic = createCharacteristic();
    cachedFile = new ModelElementCache();

    TestBed.configureTestingModule({
      imports: [
        DataTypeInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(characteristic)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
          isElementInCurrentFile: vi.fn(() => true),
        }),
        MockProvider(DataTypeService, {
          getDataTypes: vi.fn(() => ({string: stringType})),
          getDataType: vi.fn(() => stringType),
        }),
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(value =>
            of(value === 'UsedName' ? {checkShapeNameExtRef: true, foundModel: true} : null),
          ),
        }),
        MockProvider(MaxGraphService, {resolveCellByModelElement: vi.fn(() => null)}),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(DataTypeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should register all display and save values', () => {
    expect(component).toBeTruthy();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({dataType: '', dataTypeEntity: null, newDataType: null});
  });

  it('should initialize and lock an existing data type', () => {
    const entity = createEntity('ExistingEntity');
    characteristic.dataType = entity;

    component.setDataTypeControl();

    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value().dataTypeEntity).toBe(entity);
    expect(signalForm.value().dataType).toBe(entity.getUrn());
  });

  it('should resolve selected complex types through cache and external references', () => {
    const cached = createEntity('CachedEntity');
    cachedFile.addElement(cached.aspectModelUrn, cached);

    component.onSelectionChange('dataType', cached, {isUserInput: true} as MatOptionSelectionChange);
    expect(signalForm.value().dataTypeEntity).toBe(cached);

    component.unlockDataType();
    const external = createEntity('ExternalEntity');
    vi.mocked(loadedFilesService.findElementOnExtReferences).mockReturnValue(external);
    component.onSelectionChange('dataType', external, {isUserInput: true} as MatOptionSelectionChange);
    expect(signalForm.value().dataTypeEntity).toBe(external);
  });

  it('should create and clear a new entity consistently across both save keys', () => {
    component.createNewEntity('CreatedEntity');

    const created = signalForm.value().dataTypeEntity as DefaultEntity;
    expect(created.aspectModelUrn).toBe('urn:test:1.0.0#CreatedEntity');
    expect(signalForm.value().newDataType).toBe(created);
    expect(component.displayField().disabled()).toBe(true);

    component.unlockDataType();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({dataType: '', dataTypeEntity: null, newDataType: null});
  });

  it('should disable display editing while an element characteristic is selected', () => {
    signalForm.set('elementCharacteristic', {name: 'NestedCharacteristic'});
    expect(component.displayField().disabled()).toBe(true);

    signalForm.set('elementCharacteristic', null);
    expect(component.displayField().disabled()).toBe(false);
  });

  it('should filter scalar and entity data types from signal input', () => {
    const entity = createEntity('MatchingEntity');
    cachedFile.addElement(entity.aspectModelUrn, entity);

    component.displayField().value.set('string');
    expect(component.filteredDataTypes().map(type => type.name)).toEqual(['string']);

    component.displayField().value.set('Matching');
    expect(component.filteredEntityTypes().map(type => type.name)).toEqual(['MatchingEntity']);
  });

  it('should suppress entity choices for Structured Value contexts', () => {
    component.entitiesDisabled.set(true);
    expect(component.filteredEntityTypes()).toEqual([]);
  });

  it('should propagate duplicate validation and unregister on destroy', async () => {
    component.displayField().value.set('UsedName');
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.waitFor(() => expect(component.hasError('checkShapeNameExtRef')).toBe(true));
    expect(signalForm.valid()).toBe(false);

    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('dataType');
    expect(signalForm.value()).not.toHaveProperty('dataTypeEntity');
    expect(signalForm.value()).not.toHaveProperty('newDataType');
  });

  it('should restore data type object from previousData snapshot without treating string as Type', () => {
    const entity = createEntity('PreviousEntity');
    fixture.componentRef.setInput('previousData', {
      dataType: 'PreviousEntity',
      dataTypeEntity: entity,
      newDataType: null,
    });

    component.setDataTypeControl();

    expect(component.getCurrentValue()).toBe(entity);
    expect(signalForm.value().dataTypeEntity).toBe(entity);
    expect(signalForm.value().dataType).toBe(entity.getUrn());
    expect(component.displayValue()).toBe(entity.getUrn());
  });

  it('should prioritize newDataType from previousData snapshot if newly created', () => {
    const newEntity = createEntity('NewCreatedEntity');
    fixture.componentRef.setInput('previousData', {
      dataType: 'NewCreatedEntity',
      dataTypeEntity: null,
      newDataType: newEntity,
    });

    component.setDataTypeControl();

    expect(component.getCurrentValue()).toBe(newEntity);
    expect(signalForm.value().dataTypeEntity).toBe(newEntity);
    expect(signalForm.value().newDataType).toBe(newEntity);
  });

  function createCharacteristic(): DefaultCharacteristic {
    return new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#Characteristic',
      name: 'Characteristic',
      metaModelVersion: '2.0.0',
    });
  }

  function createEntity(name: string): DefaultEntity {
    return new DefaultEntity({
      aspectModelUrn: `urn:test:1.0.0#${name}`,
      name,
      metaModelVersion: '2.0.0',
    });
  }
});
