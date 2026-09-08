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

import {LoadedFilesService} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultFixedPointConstraint} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorFormModel, EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {IntegerInputFieldComponent} from './integer-input-field.component';

describe('IntegerInputFieldComponent signal form', () => {
  let component: IntegerInputFieldComponent;
  let fixture: ComponentFixture<IntegerInputFieldComponent>;
  let signalForm: EditorSignalFormContext;

  const constraint = new DefaultFixedPointConstraint({
    aspectModelUrn: 'urn:test:1.0.0#FixedPointConstraint',
    name: 'FixedPointConstraint',
    metaModelVersion: '2.0.0',
    integer: 3,
    scale: 2,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IntegerInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(constraint)),
        }),
        MockProvider(LoadedFilesService, {
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(MaxGraphService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    signalForm = TestBed.runInInjectionContext(() => new EditorSignalFormContext<EditorFormModel>({changedMetaModel: null}));
    fixture = TestBed.createComponent(IntegerInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    component.metaModelElement = constraint;
    component.initForm();
    fixture.detectChanges();
  });

  it('should register a valid native FieldTree', () => {
    expect(component.field().value()).toBe(3);
    expect(component.field().valid()).toBe(true);
    expect(signalForm.value().integer).toBe(3);
    expect(signalForm.valid()).toBe(true);
  });

  it('should expose required and positive-integer validation through its FieldTree', () => {
    component.field().value.set(null);
    expect(component.hasError('required')).toBe(true);
    expect(signalForm.valid()).toBe(false);

    component.field().value.set(-1);
    expect(component.hasError('pattern')).toBe(true);

    component.field().value.set(4);
    expect(component.field().valid()).toBe(true);
    expect(signalForm.value().integer).toBe(4);

    component.field().value.set('-1' as any);
    expect(component.hasError('pattern')).toBe(true);

    component.field().value.set('0' as any);
    expect(component.hasError('pattern')).toBe(true);

    component.field().value.set('4' as any);
    expect(component.field().valid()).toBe(true);
  });
});
