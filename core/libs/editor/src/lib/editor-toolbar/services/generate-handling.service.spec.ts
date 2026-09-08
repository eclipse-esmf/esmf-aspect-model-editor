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
import {LoadingScreenService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorService} from '../../editor.service';
import {AASXGenerationModalComponent} from '../components/aasx-generation-modal/aasx-generation-modal.component';
import {GenerateAsyncApiComponent} from '../components/generate-async-api/generate-async-api.component';
import {GenerateDocumentationComponent} from '../components/generate-documentation/generate-documentation.component';
import {GenerateOpenApiComponent} from '../components/generate-open-api/generate-open-api.component';
import {FileHandlingService} from './file-handling.service';
import {GenerateHandlingService} from './generate-handling.service';

describe('GenerateHandlingService', () => {
  let service: GenerateHandlingService;
  let dialog: MatDialog;
  let editorService: EditorService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#MyAspect',
    name: 'MyAspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GenerateHandlingService,
        MockProvider(MatDialog, {
          open: vi.fn(() => ({afterClosed: () => of(null)}) as any),
        }),
        MockProvider(EditorService, {
          generateJsonSample: vi.fn(() => of('{"test": true}')),
          generateJsonSchema: vi.fn(() => of('{"type": "object"}')),
        }),
        MockProvider(ModelService, {
          synchronizeModelToRdf: vi.fn(() => of(undefined)),
        }),
        MockProvider(NotificationsService, {
          error: vi.fn(),
          info: vi.fn(),
        }),
        MockProvider(LoadingScreenService, {
          open: vi.fn(),
          close: vi.fn(),
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            generateHandling: {
              failGenerateJsonSample: 'Fail sample',
              invalidModel: 'Invalid',
              jsonPayloadPreview: 'JSON Payload',
              failGenerateJsonSchema: 'Fail schema',
              jsonSchemaPreview: 'JSON Schema',
              noAspectTitle: 'No Aspect',
            },
          } as any,
        }),
        MockProvider(FileHandlingService, {
          validateFile: vi.fn(cb => of(cb?.())),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
      ],
    });

    service = TestBed.inject(GenerateHandlingService);
    dialog = TestBed.inject(MatDialog);
    editorService = TestBed.inject(EditorService);
  });

  it('openGenerationOpenApiSpec should open dialog', () => {
    service.openGenerationOpenApiSpec();
    expect(dialog.open).toHaveBeenCalledWith(GenerateOpenApiComponent, {disableClose: true});
  });

  it('openGenerationAsyncApiSpec should open dialog', () => {
    service.openGenerationAsyncApiSpec();
    expect(dialog.open).toHaveBeenCalledWith(GenerateAsyncApiComponent, {disableClose: true});
  });

  it('openGenerationDocumentation should open dialog', () => {
    service.openGenerationDocumentation();
    expect(dialog.open).toHaveBeenCalledWith(GenerateDocumentationComponent, {disableClose: true});
  });

  it('onGenerateAASXFile should validate and open modal', () => {
    service.onGenerateAASXFile();
    expect(dialog.open).toHaveBeenCalledWith(AASXGenerationModalComponent, {disableClose: true});
  });

  it('generateJsonSample should call editorService.generateJsonSample and open preview', async () => {
    await new Promise(resolve => service.generateJsonSample().subscribe(resolve));
    expect(editorService.generateJsonSample).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });
});
