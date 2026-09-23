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
import {DefaultOperation, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {OutputInputFieldComponent} from './output-input-field.component';

describe('OutputInputFieldComponent', () => {
  let component: OutputInputFieldComponent;
  let fixture: ComponentFixture<OutputInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let operation: DefaultOperation;
  let cachedFile: ModelElementCache;
  let propOut: DefaultProperty;

  beforeEach(() => {
    propOut = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#propOut',
      name: 'propOut',
      metaModelVersion: '2.0.0',
    });

    operation = new DefaultOperation({
      aspectModelUrn: 'urn:test:1.0.0#TestOp',
      name: 'TestOp',
      metaModelVersion: '2.0.0',
      input: [],
    });
    operation.output = propOut;

    cachedFile = new ModelElementCache();
    cachedFile.addElement(propOut.aspectModelUrn, propOut);
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [
        OutputInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(operation)),
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
          search: vi.fn((_v, cells) => cells),
        }),
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(() => of(null)),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    fixture = TestBed.createComponent(OutputInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize and register output and outputValue in signalForm', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value().output).toBe('propOut');
    expect(signalForm.value().outputValue).toBe(propOut);
  });

  it('should unlock and reset output', () => {
    component.unlockOutput();

    expect(component.displayField().value()).toBe('');
    expect(signalForm.value().output).toBe('');
    expect(signalForm.value().outputValue).toBeNull();
  });

  it('should create new property and lock output', () => {
    component.unlockOutput();
    component.createNewProperty('createdOutput');

    expect(signalForm.value().output).toBe('createdOutput');
    expect(signalForm.value().outputValue).toBeInstanceOf(DefaultProperty);
  });

  it('should unregister fields on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('output');
    expect(signalForm.value()).not.toHaveProperty('outputValue');
  });
});
