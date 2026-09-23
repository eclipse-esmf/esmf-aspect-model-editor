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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  DefaultAspect,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {EditorDialogValidators} from '../../../validators';
import {EntityInstanceModalComponent, NewEntityInstanceDialogOptions} from './entity-instance-modal.component';

describe('EntityInstanceModalComponent', () => {
  let component: EntityInstanceModalComponent;
  let fixture: ComponentFixture<EntityInstanceModalComponent>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const entity = new DefaultEntity({
    aspectModelUrn: 'urn:test:1.0.0#TestEntity',
    name: 'TestEntity',
    metaModelVersion: '2.0.0',
    properties: [],
  });

  const enumeration = new DefaultEnumeration({
    aspectModelUrn: 'urn:test:1.0.0#TestEnum',
    name: 'TestEnum',
    metaModelVersion: '2.0.0',
    dataType: entity,
    values: [],
  });

  const dialogData: NewEntityInstanceDialogOptions = {
    metaModel: enumeration,
    dataType: entity,
    complexValues: [],
  };

  const dialogRefMock = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [
        EntityInstanceModalComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: dialogData},
        {provide: MatDialogRef, useValue: dialogRefMock},
        MockProvider(EditorModelService, {
          getAspectModelUrn: vi.fn(() => 'urn:test:1.0.0#'),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), dummyAspect),
          isElementExtern: vi.fn(() => false),
        }),
        EditorDialogValidators,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityInstanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and build the Signal Form', () => {
    expect(component).toBeTruthy();
    expect(component.entityValueName).toBeDefined();
  });

  it('should close on cancel', () => {
    component.onClose();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should validate required and whitespace names', () => {
    expect(component.hasNameError('required')).toBe(true);

    component.entityValueNameModel.set('invalid name');

    expect(component.hasNameError('whitespace')).toBe(true);
    expect(component.valid()).toBe(false);
  });

  it('should reject names already present in the enumeration values', () => {
    component.complexValues.set([
      new DefaultEntityInstance({
        aspectModelUrn: 'urn:test:1.0.0#Duplicate',
        name: 'Duplicate',
        metaModelVersion: '2.0.0',
        type: entity,
      }),
    ]);
    component.entityValueNameModel.set('Duplicate');

    expect(component.hasNameError('nameAlreadyExists')).toBe(true);
  });

  it('should close with a created entity instance when valid', () => {
    component.entityValueNameModel.set('Created');
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefMock.close).toHaveBeenCalledWith({
      entityValue: expect.objectContaining({name: 'Created', type: entity}),
      newEntityValues: [],
    });
  });
});
