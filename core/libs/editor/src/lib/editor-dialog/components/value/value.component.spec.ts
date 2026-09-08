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
import {DefaultAspect, DefaultValue, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorDialogValidators} from '../../validators';
import {ValueComponent} from './value.component';

describe('ValueComponent', () => {
  let component: ValueComponent;
  let fixture: ComponentFixture<ValueComponent>;
  let elementSubject: BehaviorSubject<DefaultValue>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const value = new DefaultValue({
    aspectModelUrn: 'urn:test:1.0.0#Value',
    name: 'Value',
    metaModelVersion: '2.0.0',
    value: 'testValue',
  });
  value.parents.push(dummyAspect);

  beforeEach(async () => {
    elementSubject = new BehaviorSubject<DefaultValue>(value);
    await TestBed.configureTestingModule({
      imports: [
        ValueComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => elementSubject.asObservable()),
          isReadOnly: vi.fn(() => false),
          updateMetaModelElement: vi.fn(),
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

    fixture = TestBed.createComponent(ValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the value through the native Signal Form context', () => {
    expect(component.signalForm().value().value).toBe(value.value);
  });

  it('should toggle anonymous state and update name', () => {
    expect(component.canBeAnonymous()).toBe(true);
    component.onAnonymousToggleChange(true);
    expect(component.isAnonymous()).toBe(true);
    expect(value.isAnonymous()).toBe(true);
    expect(value.name).toBe('[Value]');

    component.onAnonymousToggleChange(false);
    expect(component.isAnonymous()).toBe(false);
    expect(value.isAnonymous()).toBe(false);
    expect(value.name).toBe('Value');
  });

  it('should not allow anonymous when element has no parent', () => {
    const valueNoParent = new DefaultValue({
      aspectModelUrn: 'urn:test:1.0.0#ValueNoParent',
      name: 'ValueNoParent',
      metaModelVersion: '2.0.0',
      value: 'testValue',
    });
    elementSubject.next(valueNoParent);
    expect(component.canBeAnonymous()).toBe(false);
  });
});
