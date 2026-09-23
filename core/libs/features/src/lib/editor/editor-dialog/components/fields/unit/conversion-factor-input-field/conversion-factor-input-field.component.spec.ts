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
import {DefaultUnit, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ConversionFactorInputFieldComponent} from './conversion-factor-input-field.component';

describe('ConversionFactorInputFieldComponent', () => {
  let component: ConversionFactorInputFieldComponent;
  let fixture: ComponentFixture<ConversionFactorInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let unit: DefaultUnit;

  beforeEach(() => {
    unit = new DefaultUnit({
      aspectModelUrn: 'urn:test:1.0.0#TestUnit',
      name: 'TestUnit',
      metaModelVersion: '2.0.0',
      conversionFactor: '1.5',
      quantityKinds: [],
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [ConversionFactorInputFieldComponent, BrowserAnimationsModule],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(unit)),
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
    fixture = TestBed.createComponent(ConversionFactorInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register conversionFactor in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().conversionFactor).toBe('1.5');
    expect(component.field().valid()).toBe(true);
  });

  it('should unregister conversionFactor field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('conversionFactor');
  });
});
