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

import {LoadedFilesService, ModelService, NamespaceFile, SammLanguageSettingsService} from '@ame/domain';
import {LanguageTranslationService, LoadingScreenService, NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {firstValueFrom, of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorService} from '../../editor.service';
import {PreviewDialogComponent, PreviewDialogOptions} from '../../preview-dialog';
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
  let sammLanguages: string[];
  let uiLanguage: string;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#MyAspect',
    name: 'MyAspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    sammLanguages = ['en'];
    uiLanguage = 'en';
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
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => sammLanguages),
        }),
        MockProvider(LanguageTranslationService, {
          translateService: {getActiveLang: () => uiLanguage} as any,
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

  describe('generateJsonSchema', () => {
    let loadingScreen: LoadingScreenService;

    beforeEach(() => {
      loadingScreen = TestBed.inject(LoadingScreenService);
      (service as any).translate.language.notificationDialog = {GENERATE_JSON_SCHEMA: 'Generate', CONTENT: 'Wait'};
    });

    function run(): Promise<'completed'> {
      return new Promise((resolve, reject) =>
        service.generateJsonSchema().subscribe({error: reject, complete: () => resolve('completed')}),
      );
    }

    function previewData(): PreviewDialogOptions {
      const call = (dialog.open as ReturnType<typeof vi.fn>).mock.calls.find(([component]) => component === PreviewDialogComponent);
      return call?.[1]?.data;
    }

    it('should generate directly without asking for a language first', async () => {
      await run();

      const opened = (dialog.open as ReturnType<typeof vi.fn>).mock.calls.map(([component]) => component);
      expect(opened).toEqual([PreviewDialogComponent]);
      expect(editorService.generateJsonSchema).toHaveBeenCalledWith(expect.any(RdfModel), 'en');
    });

    it('should show the loading screen while generating and close it before the preview opens', async () => {
      const order: string[] = [];
      (loadingScreen.open as ReturnType<typeof vi.fn>).mockImplementation(() => order.push('loading-open'));
      (loadingScreen.close as ReturnType<typeof vi.fn>).mockImplementation(() => order.push('loading-close'));
      (dialog.open as ReturnType<typeof vi.fn>).mockImplementation(() => {
        order.push('preview');
        return {afterClosed: () => of(null)};
      });

      await run();

      expect(order.slice(0, 3)).toEqual(['loading-open', 'loading-close', 'preview']);
    });

    it.each([
      ['the UI language when the model has texts in it', ['en', 'de'], 'de', 'de'],
      ['English when the model has no texts in the UI language', ['fr', 'en'], 'de', 'en'],
      ['the first model language otherwise', ['fr', 'it'], 'de', 'fr'],
      ['English for a model without languages', [], 'de', 'en'],
    ])('should use %s', async (_label, languages, ui, expected) => {
      sammLanguages = languages;
      uiLanguage = ui;

      await run();

      expect(editorService.generateJsonSchema).toHaveBeenCalledWith(expect.any(RdfModel), expected);
      expect(previewData().language).toBe(expected);
    });

    it('should pass the model languages and a regenerate function to the preview', async () => {
      sammLanguages = ['en', 'de'];
      await run();

      const data = previewData();
      expect(data.title).toBe('JSON Schema');
      expect(data.fileName).toBe('MyAspect-schema.json');
      expect(data.languages).toEqual(['en', 'de']);
      expect(JSON.parse(data.content)).toEqual('{"type": "object"}');

      (editorService.generateJsonSchema as ReturnType<typeof vi.fn>).mockReturnValue(of('{"description": "Deutsch"}'));
      const regenerated = await firstValueFrom(data.regenerate('de'));
      expect(editorService.generateJsonSchema).toHaveBeenLastCalledWith(expect.any(RdfModel), 'de');
      expect(regenerated).toBe(JSON.stringify('{"description": "Deutsch"}', null, 2));
    });

    it('should report a failed regeneration', async () => {
      sammLanguages = ['en', 'de'];
      await run();
      const notifications = TestBed.inject(NotificationsService);

      (editorService.generateJsonSchema as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('400')));
      await expect(firstValueFrom(previewData().regenerate('de'))).rejects.toBe('Fail schema');
      expect(notifications.error).toHaveBeenCalledWith(expect.objectContaining({title: 'Fail schema'}));
    });

    it('should close the loading screen and open no preview when the generation fails', async () => {
      (editorService.generateJsonSchema as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('400')));

      await expect(run()).rejects.toBe('Fail schema');

      expect(loadingScreen.close).toHaveBeenCalled();
      expect(dialog.open).not.toHaveBeenCalled();
    });
  });
});
