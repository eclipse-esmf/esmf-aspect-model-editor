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
import {DefaultAspect, DefaultCharacteristic, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../validators';
import {CharacteristicComponent} from './characteristic.component';

describe('CharacteristicComponent', () => {
  let component: CharacteristicComponent;
  let fixture: ComponentFixture<CharacteristicComponent>;
  let elementSubject: BehaviorSubject<DefaultCharacteristic>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const char = new DefaultCharacteristic({
    aspectModelUrn: 'urn:test:1.0.0#Char',
    name: 'Char',
    metaModelVersion: '2.0.0',
  });
  char.parents.push(dummyAspect);

  beforeEach(async () => {
    elementSubject = new BehaviorSubject<DefaultCharacteristic>(char);
    await TestBed.configureTestingModule({
      imports: [
        CharacteristicComponent,
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
        MockProvider(EditorDialogValidators),
        MockProvider(ModelApiService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacteristicComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'signalForm',
      TestBed.runInInjectionContext(() => EditorSignalFormContext.create()),
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose element-characteristic fields only for collection-like classes', () => {
    component.onClassChange(component.characteristicClassType().Collection);
    expect(component.isElementCharacteristicAllowed()).toBe(true);
    expect(component.isUnitAllowed()).toBe(false);

    component.onClassChange(component.characteristicClassType().Enumeration);
    expect(component.isElementCharacteristicAllowed()).toBe(false);
  });

  it('should expose unit fields only for quantifiable classes', () => {
    component.onClassChange(component.characteristicClassType().Measurement);
    expect(component.isUnitAllowed()).toBe(true);
    expect(component.isElementCharacteristicAllowed()).toBe(false);

    component.onClassChange(component.characteristicClassType().Duration);
    expect(component.isUnitAllowed()).toBe(true);
  });

  it('should handle anonymous toggle change', () => {
    expect(component.canBeAnonymous()).toBe(true);
    component.onAnonymousToggleChange(true);
    expect(component.isAnonymous()).toBe(true);
    expect(component.signalForm().value()['isAnonymous']).toBe(true);
    expect(component.signalForm().value()['name']).toBe('[Characteristic]');

    component.onAnonymousToggleChange(false);
    expect(component.isAnonymous()).toBe(false);
    expect(component.signalForm().value()['isAnonymous']).toBe(false);
  });

  it('should not allow anonymous when element has no parent', () => {
    const charNoParent = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#CharNoParent',
      name: 'CharNoParent',
      metaModelVersion: '2.0.0',
    });
    elementSubject.next(charNoParent);
    expect(component.canBeAnonymous()).toBe(false);
  });
});
