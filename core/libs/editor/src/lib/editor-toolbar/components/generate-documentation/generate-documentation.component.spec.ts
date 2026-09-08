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
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {BrowserService, IPC_RENDERER} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorService} from '../../../editor.service';
import {GenerateDocumentationComponent} from './generate-documentation.component';

describe('GenerateDocumentationComponent', () => {
  let component: GenerateDocumentationComponent;
  let fixture: ComponentFixture<GenerateDocumentationComponent>;
  let dialogRef: MatDialogRef<GenerateDocumentationComponent>;
  let modelApiService: ModelApiService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<GenerateDocumentationComponent>;

    await TestBed.configureTestingModule({
      imports: [
        GenerateDocumentationComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: IPC_RENDERER, useValue: {writePrintFile: vi.fn(() => Promise.resolve('path')), openPrintWindow: vi.fn()}},
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en', 'de']),
        }),
        MockProvider(ModelApiService, {
          generateDocumentation: vi.fn(() => of('<html>Documentation</html>')),
        }),
        MockProvider(EditorService, {
          getSerializedModel: vi.fn(() => 'turtle model'),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
        MockProvider(BrowserService, {
          isStartedAsElectronApp: vi.fn(() => false),
        }),
      ],
    }).compileComponents();

    modelApiService = TestBed.inject(ModelApiService);
    fixture = TestBed.createComponent(GenerateDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load languages', () => {
    expect(component).toBeTruthy();
    expect(component.languages().length).toBeGreaterThan(0);
    expect(component.docModel().language).toBe('en');
  });

  it('downloadDocumentation should call modelApiService.generateDocumentation and close dialog', () => {
    component.downloadDocumentation();

    expect(modelApiService.generateDocumentation).toHaveBeenCalledWith('turtle model', 'en', undefined);
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
