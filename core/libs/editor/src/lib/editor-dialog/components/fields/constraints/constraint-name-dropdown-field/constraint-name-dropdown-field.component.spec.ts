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
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEncodingConstraint, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ConstraintNameDropdownFieldComponent} from './constraint-name-dropdown-field.component';

describe('ConstraintNameDropdownFieldComponent', () => {
  let component: ConstraintNameDropdownFieldComponent;
  let fixture: ComponentFixture<ConstraintNameDropdownFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let constraint: DefaultEncodingConstraint;

  beforeEach(() => {
    constraint = new DefaultEncodingConstraint({
      aspectModelUrn: 'urn:test:1.0.0#TestEncoding',
      name: 'TestEncoding',
      metaModelVersion: '2.0.0',
      value: 'US-ASCII',
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [ConstraintNameDropdownFieldComponent, BrowserAnimationsModule],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(constraint)),
          updateMetaModelElement: vi.fn(),
          originalMetaModel: constraint,
        }),
        MockProvider(ModelService),
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en']),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
          isElementExtern: vi.fn(() => false),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(ConstraintNameDropdownFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize with constraint name list', () => {
    expect(component).toBeTruthy();
    expect(component.listConstraintNames).toContain('EncodingConstraint');
    expect(component.listConstraintNames).toContain('RegularExpressionConstraint');
    expect(component.classField().value()).toBe('EncodingConstraint');
  });

  it('should emit selectedConstraint and update fields on constraint change', () => {
    const emitted: string[] = [];
    component.selectedConstraint.subscribe(val => emitted.push(val));

    component.onConstraintChange('RegularExpressionConstraint');

    expect(component.classField().value()).toBe('RegularExpressionConstraint');
    expect(emitted).toContain('RegularExpressionConstraint');
    expect(signalForm.value().changedMetaModel).toBeTruthy();
  });
});
