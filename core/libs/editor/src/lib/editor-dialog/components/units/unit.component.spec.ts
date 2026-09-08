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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultUnit, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorDialogValidators} from '../../validators';
import {UnitComponent} from './unit.component';

describe('UnitComponent', () => {
  let component: UnitComponent;
  let fixture: ComponentFixture<UnitComponent>;

  const unit = new DefaultUnit({
    aspectModelUrn: 'urn:test:1.0.0#Unit',
    name: 'Unit',
    metaModelVersion: '2.0.0',
    quantityKinds: [],
  });

  beforeEach(async () => {
    (globalThis as any).sammUDefinition = {quantityKinds: {}, units: {}};

    await TestBed.configureTestingModule({
      imports: [
        UnitComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(unit)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
          isElementExtern: vi.fn(() => false),
        }),
        EditorDialogValidators,
        MockProvider(ModelApiService, {
          checkElementExists: vi.fn(() => of(false)),
        }),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should aggregate Unit fields in the native Signal Form context', () => {
    expect(component.signalForm().value()).toMatchObject({
      code: '',
      symbol: '',
      quantityKindsChipList: [],
      referenceUnit: null,
    });
  });
});
