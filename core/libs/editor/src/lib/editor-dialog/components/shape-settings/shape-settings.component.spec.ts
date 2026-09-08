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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService, SearchService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../validators';
import {ShapeSettingsComponent} from './shape-settings.component';

describe('ShapeSettingsComponent', () => {
  let component: ShapeSettingsComponent;
  let fixture: ComponentFixture<ShapeSettingsComponent>;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShapeSettingsComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(aspect)),
          updateMetaModelElement: vi.fn(),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en']),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(EditorDialogValidators),
        MockProvider(ModelApiService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShapeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and receive metaModelElement', () => {
    expect(component).toBeTruthy();
    expect(component.metaModelElement()).toBe(aspect);
  });

  it('onClose should reset form and emit afterClose', () => {
    const afterCloseSpy = vi.fn();
    component.afterClose.subscribe(afterCloseSpy);

    component.onClose();

    expect(afterCloseSpy).toHaveBeenCalled();
  });

  it('should emit the aggregated Signal Forms value on save', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    component.signalForm = TestBed.runInInjectionContext(
      () => new EditorSignalFormContext<Record<string, unknown>>({changedMetaModel: null, customField: 'saved'}),
    );

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({customField: 'saved'}));
  });

  it('should not save while a registered Signal Forms field is invalid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    const model = signal('');
    const requiredField = TestBed.runInInjectionContext(() => form(model, path => required(path)));
    component.signalForm.register('requiredField', requiredField);

    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
