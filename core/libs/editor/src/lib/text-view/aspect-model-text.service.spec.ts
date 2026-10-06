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

import {ConfigurationService, LoadedFilesService, ModelApiPort, ModelService, RdfPort} from '@ame/domain';
import {TestBed} from '@angular/core/testing';
import {firstValueFrom, of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AspectModelTextService} from './aspect-model-text.service';

const SERIALIZED = '@prefix : <urn:samm:org.example:1.0.0#> .\n:A a :B .\n';

describe('AspectModelTextService', () => {
  let service: AspectModelTextService;
  let rdfModel: {getSourceLocation: ReturnType<typeof vi.fn>; serializationMetadata?: {headerComments: string[]}};
  let loadedFiles: {currentLoadedFile: any};
  let modelService: {synchronizeModelToRdf: ReturnType<typeof vi.fn>};
  let rdfService: {serializeModel: ReturnType<typeof vi.fn>};
  let modelApi: {fetchFormatedAspectModel: ReturnType<typeof vi.fn>};
  let copyrightHeader: string[];

  beforeEach(() => {
    rdfModel = {getSourceLocation: vi.fn(() => 'file:///Movement.ttl')};
    loadedFiles = {currentLoadedFile: {rdfModel}};
    modelService = {synchronizeModelToRdf: vi.fn(() => of(undefined))};
    rdfService = {serializeModel: vi.fn(() => SERIALIZED)};
    modelApi = {fetchFormatedAspectModel: vi.fn(() => of('formatted\n'))};
    copyrightHeader = ['# Copyright'];

    TestBed.configureTestingModule({
      providers: [
        AspectModelTextService,
        {provide: LoadedFilesService, useValue: loadedFiles},
        {provide: ModelService, useValue: modelService},
        {provide: RdfPort, useValue: rdfService},
        {provide: ModelApiPort, useValue: modelApi},
        {provide: ConfigurationService, useValue: {getSettings: () => ({copyrightHeader})}},
      ],
    });
    service = TestBed.inject(AspectModelTextService);
  });

  it('synchronizes the graph and returns the formatted model with the copyright header', async () => {
    const result = await firstValueFrom(service.load());

    expect(modelService.synchronizeModelToRdf).toHaveBeenCalled();
    expect(rdfService.serializeModel).toHaveBeenCalledWith(rdfModel);
    expect(modelApi.fetchFormatedAspectModel).toHaveBeenCalledWith(SERIALIZED, 'file:///Movement.ttl');
    expect(result).toEqual({content: '# Copyright\n\nformatted\n', formatted: true});
  });

  it('uses the header of the loaded file instead of the configured default', async () => {
    rdfModel.serializationMetadata = {headerComments: ['# File header']};
    expect(await firstValueFrom(service.load())).toEqual({content: '# File header\nformatted\n', formatted: true});
  });

  it('omits an empty copyright header', async () => {
    copyrightHeader = [];
    expect(await firstValueFrom(service.load())).toEqual({content: 'formatted\n', formatted: true});
  });

  it('does not duplicate a copyright header returned by the formatter', async () => {
    modelApi.fetchFormatedAspectModel.mockReturnValue(of('# Copyright\nformatted\n'));
    expect(await firstValueFrom(service.load())).toEqual({content: '# Copyright\nformatted\n', formatted: true});
  });

  it('falls back to the raw serialization when formatting fails', async () => {
    modelApi.fetchFormatedAspectModel.mockReturnValue(throwError(() => new Error('offline')));
    expect(await firstValueFrom(service.load())).toEqual({content: SERIALIZED, formatted: false});
  });

  it('falls back to the raw serialization when the formatter returns nothing', async () => {
    modelApi.fetchFormatedAspectModel.mockReturnValue(of('  '));
    expect(await firstValueFrom(service.load())).toEqual({content: SERIALIZED, formatted: false});
  });

  it('returns an empty text for models without statements', async () => {
    rdfService.serializeModel.mockReturnValue('@prefix : <urn:samm:org.example:1.0.0#> .\n');

    expect(await firstValueFrom(service.load())).toEqual({content: '', formatted: false});
    expect(modelApi.fetchFormatedAspectModel).not.toHaveBeenCalled();
  });

  it('returns an empty text when no model is loaded', async () => {
    loadedFiles.currentLoadedFile = null;

    expect(await firstValueFrom(service.load())).toEqual({content: '', formatted: false});
    expect(modelService.synchronizeModelToRdf).not.toHaveBeenCalled();
  });

  it('propagates synchronization errors', async () => {
    modelService.synchronizeModelToRdf.mockReturnValue(throwError(() => ({type: 'emptyModel'})));
    await expect(firstValueFrom(service.load())).rejects.toEqual({type: 'emptyModel'});
  });
});
