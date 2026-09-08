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
import {BoundDefinition, DefaultRangeConstraint, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {LowerBoundInputFieldComponent} from './lower-bound-input-field.component';

describe('LowerBoundInputFieldComponent', () => {
  let component: LowerBoundInputFieldComponent;
  let fixture: ComponentFixture<LowerBoundInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let constraint: DefaultRangeConstraint;

  beforeEach(() => {
    constraint = new DefaultRangeConstraint({
      aspectModelUrn: 'urn:test:1.0.0#TestRange',
      name: 'TestRange',
      metaModelVersion: '2.0.0',
    });
    constraint.lowerBoundDefinition = BoundDefinition.AT_LEAST;

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [LowerBoundInputFieldComponent, BrowserAnimationsModule],
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
    fixture = TestBed.createComponent(LowerBoundInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register lowerBoundDefinition in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().lowerBoundDefinition).toBe(BoundDefinition.AT_LEAST);
    expect(component.field().valid()).toBe(true);
  });

  it('should unregister field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('lowerBoundDefinition');
  });
});
