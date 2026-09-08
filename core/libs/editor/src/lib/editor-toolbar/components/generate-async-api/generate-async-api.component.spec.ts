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
import {SammLanguageSettingsService} from '@ame/settings-dialog';
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
import {GenerateAsyncApiComponent} from './generate-async-api.component';

describe('GenerateAsyncApiComponent', () => {
  let component: GenerateAsyncApiComponent;
  let fixture: ComponentFixture<GenerateAsyncApiComponent>;
  let dialogRef: MatDialogRef<GenerateAsyncApiComponent>;
  let editorService: EditorService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<GenerateAsyncApiComponent>;

    await TestBed.configureTestingModule({
      imports: [
        GenerateAsyncApiComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en']),
        }),
        MockProvider(EditorService, {
          generateAsyncApiSpec: vi.fn(() => of('asyncapi: 2.0.0')),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
      ],
    }).compileComponents();

    editorService = TestBed.inject(EditorService);
    fixture = TestBed.createComponent(GenerateAsyncApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.asyncApiForm).toBeDefined();
    expect(component.asyncApiModel().output).toBe('yaml');
  });

  it('generateAsyncApiSpec should call editorService.generateAsyncApiSpec and close dialog', () => {
    component.generateAsyncApiSpec();

    expect(editorService.generateAsyncApiSpec).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
