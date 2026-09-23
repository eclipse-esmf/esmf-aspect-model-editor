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
import {DefaultAspect, DefaultEntity, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {PropertiesDialogData, PropertiesModalComponent} from './properties-modal.component';

describe('PropertiesModalComponent', () => {
  let component: PropertiesModalComponent;
  let fixture: ComponentFixture<PropertiesModalComponent>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const prop1 = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#prop1',
    name: 'prop1',
    metaModelVersion: '2.0.0',
  });

  const entity = new DefaultEntity({
    aspectModelUrn: 'urn:test:1.0.0#Entity',
    name: 'Entity',
    metaModelVersion: '2.0.0',
    properties: [prop1],
  });

  const dialogData: PropertiesDialogData = {
    metaModelElement: entity,
    propertiesPayload: {
      'urn:test:1.0.0#prop1': {optional: true, payloadName: 'propOne', notInPayload: false},
    },
    isExternalRef: false,
    isPredefined: false,
  };

  const dialogRefMock = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertiesModalComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: dialogData},
        {provide: MatDialogRef, useValue: dialogRefMock},
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), dummyAspect),
          isElementExtern: vi.fn(() => false),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and build form', () => {
    expect(component).toBeTruthy();
    expect(component.propertiesModel()['urn:test:1.0.0#prop1']).toBeDefined();
    expect(component.propertiesModel()['urn:test:1.0.0#prop1'].payloadName).toBe('propOne');
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should save changes and close dialog', () => {
    component.saveChanges();
    expect(dialogRefMock.close).toHaveBeenCalledWith(component.propertiesModel());
  });

  it('should close on cancel', () => {
    component.closeModal();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
