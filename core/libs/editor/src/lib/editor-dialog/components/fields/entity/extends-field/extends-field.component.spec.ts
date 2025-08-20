/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEntity, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {EditorModelService} from '../../../../editor-model.service';
import {EntityExtendsFieldComponent} from './extends-field.component';

jest.mock('../../../../../../../../shared/src/lib/constants/xsd-datatypes.ts', () => ({}));
jest.mock('@esmf/aspect-model-loader', () => ({
  ...jest.requireActual('@esmf/aspect-model-loader'),
  useLoader: jest.fn(() => ({
    getAllPredefinedEntities: jest.fn(() => ({})),
  })),
}));

describe('EntityExtendsFieldComponent', () => {
  let component: EntityExtendsFieldComponent;
  let fixture: ComponentFixture<EntityExtendsFieldComponent>;
  let editorModelService: EditorModelService;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule],
      declarations: [EntityExtendsFieldComponent],
      providers: [
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
        }),
        MockProvider(NotificationsService),
        MockProvider(EditorModelService),
        MockProvider(RdfService),
        MockProvider(SearchService),
        MockProvider(MxGraphService),
      ],
    });

    editorModelService = TestBed.inject(EditorModelService);
    editorModelService.getMetaModelElement = jest.fn(() => of(new DefaultEntity({metaModelVersion: '', aspectModelUrn: '', name: ''})));

    fixture = TestBed.createComponent(EntityExtendsFieldComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
