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
import {ElementCreatorService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorDialogValidators} from '../../../../../validators';
import {StructuredValuePropertiesComponent} from './structured-value-properties.component';

describe('StructuredValuePropertiesComponent', () => {
  let component: StructuredValuePropertiesComponent;
  let fixture: ComponentFixture<StructuredValuePropertiesComponent>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const dialogRefMock = {
    close: vi.fn(),
  };

  const property = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#prop1',
    name: 'prop1',
    metaModelVersion: '2.0.0',
  });

  const dialogData = {
    groups: [
      {
        start: 0,
        end: 5,
        text: '([a-z]+)',
        property,
      },
    ],
  };

  beforeEach(async () => {
    dialogRefMock.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [
        StructuredValuePropertiesComponent,
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
        MockProvider(ElementCreatorService),
        EditorDialogValidators,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StructuredValuePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and populate a valid signal form', () => {
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.propertiesModel()[0].propertyName).toBe('prop1');
    expect(component.propertiesForm().valid()).toBe(true);
  });

  it('should close modal on cancel', () => {
    component.closeModal(false);
    expect(dialogRefMock.close).toHaveBeenCalledWith(null);
  });

  it('should prevent saving while a required property is missing', () => {
    component.onPropertyChange(0, '[0-5] -> ([a-z]+)', null);
    component.closeModal(true);

    expect(component.propertiesForm().invalid()).toBe(true);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should save the signal model as the expected key-value record', () => {
    component.closeModal(true);

    expect(dialogRefMock.close).toHaveBeenCalledWith({'[0-5] -> ([a-z]+)': property});
  });
});
