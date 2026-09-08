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
import {SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockComponent, MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {DescriptionInputFieldComponent} from '../description-input-field/description-input-field.component';
import {NameInputFieldComponent} from '../name-input-field/name-input-field.component';
import {PreferredNameInputFieldComponent} from '../preferred-name-input-field/preferred-name-input-field.component';
import {SeeInputFieldComponent} from '../see-input-field/see-input-field.component';
import {BaseInputComponent} from './base-input.component';

describe('BaseInputComponent', () => {
  let component: BaseInputComponent;
  let fixture: ComponentFixture<BaseInputComponent>;
  let signalForm: EditorSignalFormContext;

  const sampleProperty = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#testProp',
    name: 'testProp',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        BaseInputComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {defaultLang: 'en', availableLangs: ['en']}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(sampleProperty)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(MaxGraphService, {
          getAllCells: vi.fn(() => []),
        }),
        MockProvider(SearchService),
        MockProvider(EditorDialogValidators, {
          duplicateNameValue: vi.fn(() => of(null)),
        }),
      ],
    }).overrideComponent(BaseInputComponent, {
      set: {
        imports: [
          MockComponent(NameInputFieldComponent),
          MockComponent(PreferredNameInputFieldComponent),
          MockComponent(DescriptionInputFieldComponent),
          MockComponent(SeeInputFieldComponent),
        ],
      },
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(BaseInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should create BaseInputComponent', () => {
    expect(component).toBeTruthy();
    expect(component.hideDescription()).toBe(false);
    expect(component.hideSee()).toBe(false);
  });
});
