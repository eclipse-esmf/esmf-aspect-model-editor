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
import {ModelService, RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultConstraint, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorDialogValidators} from '../../validators';
import {ConstraintComponent} from './constraint.component';

describe('ConstraintComponent', () => {
  let component: ConstraintComponent;
  let fixture: ComponentFixture<ConstraintComponent>;
  let elementSubject: BehaviorSubject<DefaultConstraint>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const constraint = new DefaultConstraint({
    aspectModelUrn: 'urn:test:1.0.0#TestConstraint',
    name: 'TestConstraint',
    metaModelVersion: '2.0.0',
  });
  constraint.parents.push(dummyAspect);

  beforeEach(async () => {
    elementSubject = new BehaviorSubject<DefaultConstraint>(constraint);
    await TestBed.configureTestingModule({
      imports: [
        ConstraintComponent,
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
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en', 'de']),
        }),
        EditorDialogValidators,
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(ModelService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle class change', () => {
    component.selectedConstraint.set('EncodingConstraint');
    expect(component.selectedConstraint()).toBe('EncodingConstraint');
  });

  it('should toggle anonymous state and update name', () => {
    expect(component.canBeAnonymous()).toBe(true);
    component.onAnonymousToggleChange(true);
    expect(component.isAnonymous()).toBe(true);
    expect(constraint.isAnonymous()).toBe(true);
    expect(constraint.name).toBe('[Constraint]');

    component.onAnonymousToggleChange(false);
    expect(component.isAnonymous()).toBe(false);
    expect(constraint.isAnonymous()).toBe(false);
    expect(constraint.name).toBe('Constraint');
  });

  it('should not allow anonymous when element has no parent', () => {
    const constraintNoParent = new DefaultConstraint({
      aspectModelUrn: 'urn:test:1.0.0#TestConstraintNoParent',
      name: 'TestConstraintNoParent',
      metaModelVersion: '2.0.0',
    });
    elementSubject.next(constraintNoParent);
    expect(component.canBeAnonymous()).toBe(false);
  });

  it('should handle previous data change', () => {
    component.onPreviousDataChange({name: 'Updated'});
    expect(component.previousData()).toEqual({name: 'Updated'});
  });

  it('should use a native Signal Form context without a legacy parent form', () => {
    component.signalForm().set('languageCode', 'en');

    expect(component.signalForm().value().languageCode).toBe('en');
    expect(component.signalForm().valid()).toBe(true);
  });
});
