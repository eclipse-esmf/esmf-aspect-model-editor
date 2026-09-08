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
import {MatOptionSelectionChange} from '@angular/material/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultUnit, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ReferenceUnitInputFieldComponent} from './reference-unit-input-field.component';

describe('ReferenceUnitInputFieldComponent', () => {
  let component: ReferenceUnitInputFieldComponent;
  let fixture: ComponentFixture<ReferenceUnitInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let unit: DefaultUnit;
  let refUnit: DefaultUnit;

  beforeEach(() => {
    refUnit = new DefaultUnit({
      aspectModelUrn: 'urn:test:1.0.0#metre',
      name: 'metre',
      metaModelVersion: '2.0.0',
      quantityKinds: [],
    });

    (globalThis as any).sammUDefinition = {
      quantityKinds: {},
      units: {
        metre: refUnit,
        second: new DefaultUnit({
          aspectModelUrn: 'urn:test:1.0.0#second',
          name: 'second',
          metaModelVersion: '2.0.0',
          quantityKinds: [],
        }),
      },
    };

    unit = new DefaultUnit({
      aspectModelUrn: 'urn:test:1.0.0#kilometre',
      name: 'kilometre',
      metaModelVersion: '2.0.0',
      referenceUnit: refUnit,
      quantityKinds: [],
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [ReferenceUnitInputFieldComponent, BrowserAnimationsModule],
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
        MockProvider(SearchService, {
          search: vi.fn((_v, units) => units),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(ReferenceUnitInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register referenceUnit in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().referenceUnit).toBe(refUnit);
    expect(component.displayField().value()).toBe('metre');
  });

  it('should unlock and reset reference unit', () => {
    component.unlockUnit();
    expect(component.displayField().value()).toBe('');
    expect(signalForm.value().referenceUnit).toBeNull();
  });

  it('should set reference unit on predefined unit selection', () => {
    component.unlockUnit();
    const secondUnit = (globalThis as any).sammUDefinition.units.second;
    component.onPredefinedUnitChange(secondUnit, {isUserInput: true} as MatOptionSelectionChange);

    expect(component.displayField().value()).toBe('second');
  });

  it('should unregister referenceUnit field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('referenceUnit');
  });
});
