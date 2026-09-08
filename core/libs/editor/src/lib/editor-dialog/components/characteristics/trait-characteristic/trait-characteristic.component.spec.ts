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
import {DefaultAspect, DefaultTrait, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {EditorDialogValidators} from '../../../validators';
import {TraitCharacteristicComponent} from './trait-characteristic.component';

describe('TraitCharacteristicComponent', () => {
  let component: TraitCharacteristicComponent;
  let fixture: ComponentFixture<TraitCharacteristicComponent>;
  let elementSubject: BehaviorSubject<DefaultTrait>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const trait = new DefaultTrait({
    aspectModelUrn: 'urn:test:1.0.0#TestTrait',
    name: 'TestTrait',
    metaModelVersion: '2.0.0',
  });
  trait.parents.push(dummyAspect);

  beforeEach(async () => {
    elementSubject = new BehaviorSubject<DefaultTrait>(trait);
    await TestBed.configureTestingModule({
      imports: [
        TraitCharacteristicComponent,
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

    fixture = TestBed.createComponent(TraitCharacteristicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle anonymous state and update name', () => {
    expect(component.canBeAnonymous()).toBe(true);
    component.onAnonymousToggleChange(true);
    expect(component.isAnonymous()).toBe(true);
    expect(trait.isAnonymous()).toBe(true);
    expect(trait.name).toBe('[Trait]');

    component.onAnonymousToggleChange(false);
    expect(component.isAnonymous()).toBe(false);
    expect(trait.isAnonymous()).toBe(false);
    expect(trait.name).toBe('Trait');
  });

  it('should not allow anonymous when element has no parent', () => {
    const traitNoParent = new DefaultTrait({
      aspectModelUrn: 'urn:test:1.0.0#TestTraitNoParent',
      name: 'TestTraitNoParent',
      metaModelVersion: '2.0.0',
    });
    elementSubject.next(traitNoParent);
    expect(component.canBeAnonymous()).toBe(false);
  });
});
