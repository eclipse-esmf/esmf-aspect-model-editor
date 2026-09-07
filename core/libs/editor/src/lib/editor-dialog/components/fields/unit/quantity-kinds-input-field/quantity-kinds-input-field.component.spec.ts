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
import {DefaultQuantityKind, DefaultUnit, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {QuantityKindsInputFieldComponent} from './quantity-kinds-input-field.component';

describe('QuantityKindsInputFieldComponent', () => {
  let component: QuantityKindsInputFieldComponent;
  let fixture: ComponentFixture<QuantityKindsInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let unit: DefaultUnit;

  beforeEach(() => {
    (globalThis as any).sammUDefinition = {
      quantityKinds: {
        length: {},
        mass: {},
        time: {},
      },
      units: {},
    };

    const qk = new DefaultQuantityKind({
      aspectModelUrn: 'urn:test:1.0.0#length',
      name: 'length',
      label: 'length',
      metaModelVersion: '2.0.0',
    });

    unit = new DefaultUnit({
      aspectModelUrn: 'urn:test:1.0.0#TestUnit',
      name: 'TestUnit',
      metaModelVersion: '2.0.0',
      quantityKinds: [qk],
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        QuantityKindsInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
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
    fixture = TestBed.createComponent(QuantityKindsInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize quantityKindsChipList in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().quantityKindsChipList).toEqual(['length']);
  });

  it('should add selected quantity kind', () => {
    component.onSelectionChange('mass');
    expect(signalForm.value().quantityKindsChipList).toEqual(['length', 'mass']);
  });

  it('should remove quantity kind', () => {
    component.remove('length');
    expect(signalForm.value().quantityKindsChipList).toEqual([]);
  });

  it('should unregister quantityKindsChipList field on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('quantityKindsChipList');
  });
});
