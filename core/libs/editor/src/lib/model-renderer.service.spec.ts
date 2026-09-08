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
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphAttributeService, MaxGraphService, MaxGraphSetupService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsService} from './editor-dialog';
import {LargeFileWarningService} from './large-file-warning-dialog/large-file-warning-dialog.service';
import {ModelRendererService} from './model-renderer.service';

describe('ModelRendererService', () => {
  let service: ModelRendererService;
  let maxgraphService: MaxGraphService;
  let largeFileWarningService: LargeFileWarningService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelRendererService,
        MockProvider(MaxGraphService, {
          deleteAllShapes: vi.fn(),
          updateGraph: vi.fn(cb => of(cb())),
          formatShapes: vi.fn(),
        }),
        MockProvider(LargeFileWarningService, {
          openDialog: vi.fn(() => of<'open' | 'cancel' | 'ignore'>('ignore')),
        }),
        MockProvider(LoadingScreenService, {
          open: vi.fn(),
          close: vi.fn(),
        }),
        MockProvider(FiltersService, {
          currentFilter: {filterType: 'ALL'} as any,
          filter: vi.fn(elements => elements),
        }),
        MockProvider(MaxGraphAttributeService, {
          inCollapsedMode: false,
        }),
        MockProvider(ShapeSettingsService),
        MockProvider(MaxGraphSetupService, {
          centerGraph: vi.fn(),
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            loadingScreenDialog: {modelGeneration: 'Generating'},
          } as any,
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
        MockProvider(NotificationsService),
        MockProvider(MaxGraphShapeOverlayService),
        MockProvider(SammLanguageSettingsService),
      ],
    });

    service = TestBed.inject(ModelRendererService);
    maxgraphService = TestBed.inject(MaxGraphService);
    largeFileWarningService = TestBed.inject(LargeFileWarningService);
  });

  it('renderModel should delete old shapes and prepare graph update', async () => {
    await new Promise(resolve => service.renderModel().subscribe(resolve));

    expect(maxgraphService.deleteAllShapes).toHaveBeenCalled();
    expect(largeFileWarningService.openDialog).toHaveBeenCalled();
  });
});
