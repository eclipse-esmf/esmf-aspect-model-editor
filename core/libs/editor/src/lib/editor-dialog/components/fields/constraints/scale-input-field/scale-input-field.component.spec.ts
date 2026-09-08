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
import {DefaultFixedPointConstraint, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ScaleInputFieldComponent} from './scale-input-field.component';

describe('ScaleInputFieldComponent', () => {
  let component: ScaleInputFieldComponent;
  let fixture: ComponentFixture<ScaleInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let constraint: DefaultFixedPointConstraint;

  beforeEach(() => {
    constraint = new DefaultFixedPointConstraint({
      aspectModelUrn: 'urn:test:1.0.0#TestScale',
      name: 'TestScale',
      metaModelVersion: '2.0.0',
      scale: 2,
      integer: 3,
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        ScaleInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(constraint)),
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
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(ScaleInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register scale in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().scale).toBe(2);
    expect(component.field().valid()).toBe(true);
  });

  it('should validate positive number pattern', () => {
    component.field().value.set(-1);
    expect(component.hasError('pattern')).toBe(true);
    expect(signalForm.valid()).toBe(false);

    component.field().value.set(4);
    expect(component.hasError('pattern')).toBe(false);
    expect(signalForm.valid()).toBe(true);

    component.field().value.set('-1' as any);
    expect(component.hasError('pattern')).toBe(true);

    component.field().value.set('0' as any);
    expect(component.hasError('pattern')).toBe(true);

    component.field().value.set('4' as any);
    expect(component.hasError('pattern')).toBe(false);

    component.field().value.set('abc' as any);
    expect(component.hasError('pattern')).toBe(true);
  });

  it('should unregister field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('scale');
  });
});
