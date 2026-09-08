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
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultEntity, DefaultState, ModelElementCache, RdfModel, Value} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../validators';
import {StateCharacteristicComponent} from './state-characteristic.component';

describe('StateCharacteristicComponent', () => {
  let component: StateCharacteristicComponent;
  let fixture: ComponentFixture<StateCharacteristicComponent>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const state = new DefaultState({
    aspectModelUrn: 'urn:test:1.0.0#TestState',
    name: 'TestState',
    metaModelVersion: '2.0.0',
    defaultValue: new Value('val1'),
    values: [new Value('val1'), new Value('val2')],
    dataType: new DefaultEntity({
      aspectModelUrn: 'urn:test:1.0.0#TestEntity',
      name: 'TestEntity',
      metaModelVersion: '2.0.0',
    }),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StateCharacteristicComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(state)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), dummyAspect),
          isElementExtern: vi.fn(() => false),
        }),
        EditorDialogValidators,
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StateCharacteristicComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'signalForm',
      TestBed.runInInjectionContext(() => EditorSignalFormContext.create()),
    );
    fixture.detectChanges();
  });

  it('should create and detect entity dataType', () => {
    expect(component).toBeTruthy();
    expect(component.hasEntityType).toBe(true);
    expect(component.signalForm().value().defaultValue).toBe('');
  });

  it('should select the scalar default-value branch for non-entity data types', () => {
    const entityType = state.dataType;
    state.dataType = null;

    expect(component.hasEntityType).toBe(false);

    state.dataType = entityType;
  });
});
