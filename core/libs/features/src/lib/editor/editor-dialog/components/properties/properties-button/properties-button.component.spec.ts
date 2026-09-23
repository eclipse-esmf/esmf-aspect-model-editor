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
import {MatDialog} from '@angular/material/dialog';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {PropertiesButtonComponent} from './properties-button.component';

describe('PropertiesButtonComponent', () => {
  let component: PropertiesButtonComponent;
  let fixture: ComponentFixture<PropertiesButtonComponent>;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const dialogMock = {
    open: vi.fn(() => ({
      beforeClosed: () => of(null),
      afterClosed: () => of(null),
    })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertiesButtonComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(aspect)),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
          isElementExtern: vi.fn(() => false),
        }),
        {provide: MatDialog, useValue: dialogMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and receive metaModelElement', () => {
    expect(component).toBeTruthy();
    expect(component.metaModelElement()).toBe(aspect);
  });

  it('should open properties dialog', () => {
    component.openPropertiesTable();
    expect(dialogMock.open).toHaveBeenCalled();
  });
});
