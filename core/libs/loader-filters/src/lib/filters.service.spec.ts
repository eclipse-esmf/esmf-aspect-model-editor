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
import {EditorService, ShapeSettingsStateService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphRenderer, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FILTER_ATTRIBUTES} from './active-filter.session';
import {DefaultFilter, PropertiesFilterLoader} from './filters';
import {FiltersService} from './filters.service';
import {ModelFilter} from './models';

describe('FiltersService', () => {
  let service: FiltersService;
  let loadingScreenMock: {open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>};
  let maxGraphServiceMock: {
    graph: {selectionModel: {cells: unknown[]}};
    deleteAllShapes: ReturnType<typeof vi.fn>;
    renderModelElement?: ReturnType<typeof vi.fn>;
    updateGraph: ReturnType<typeof vi.fn>;
    formatShapes: ReturnType<typeof vi.fn>;
    resolveCellByModelElement: ReturnType<typeof vi.fn>;
    navigateToCellByUrn: ReturnType<typeof vi.fn>;
    foldCells: ReturnType<typeof vi.fn>;
  };
  let editorServiceMock: {validate: ReturnType<typeof vi.fn>};
  let loadedFilesMock: {
    currentLoadedFile: NamespaceFile;
    isElementExtern: ReturnType<typeof vi.fn>;
  };

  const namespace = 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#';

  beforeEach(() => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0', namespace);
    const cachedFile = new ModelElementCache();

    loadingScreenMock = {
      open: vi.fn(() => ({
        afterOpened: () => of(undefined),
      })),
      close: vi.fn(),
    };

    maxGraphServiceMock = {
      graph: {
        selectionModel: {cells: []},
      },
      deleteAllShapes: vi.fn(),
      renderModelElement: vi.fn(),
      updateGraph: vi.fn((cb: () => void) => {
        cb?.();
        return of(undefined);
      }),
      formatShapes: vi.fn(),
      resolveCellByModelElement: vi.fn(),
      navigateToCellByUrn: vi.fn(),
      foldCells: vi.fn(),
    };

    editorServiceMock = {
      validate: vi.fn(() => of(undefined)),
    };

    loadedFilesMock = {
      currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
      isElementExtern: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      providers: [
        FiltersService,
        {provide: LoadingScreenService, useValue: loadingScreenMock},
        {provide: MaxGraphService, useValue: maxGraphServiceMock},
        {provide: EditorService, useValue: editorServiceMock},
        {provide: LoadedFilesService, useValue: loadedFilesMock},
        MockProvider(LanguageTranslationService, {
          language: {
            loadingScreenDialog: {
              filterChange: 'Changing filter',
              filterWait: 'Please wait',
            },
          },
        }),
        MockProvider(MaxGraphShapeOverlayService),
        MockProvider(SammLanguageSettingsService),
        MockProvider(MaxGraphAttributeService, {inCollapsedMode: false}),
        MockProvider(ShapeSettingsStateService, {isShapeSettingOpened: vi.fn(() => false) as any, closeShapeSettings: vi.fn()}),
      ],
    });

    service = TestBed.inject(FiltersService);
  });

  it('should be created and initialized with DefaultFilter', () => {
    expect(service).toBeTruthy();
    expect(service.currentFilter).toBeInstanceOf(DefaultFilter);
    expect(TestBed.inject(FILTER_ATTRIBUTES).activeFilter).toBe(ModelFilter.DEFAULT);
  });

  it('should switch to PropertiesFilter', () => {
    service.selectPropertiesFilter();

    expect(service.currentFilter).toBeInstanceOf(PropertiesFilterLoader);
    expect(TestBed.inject(FILTER_ATTRIBUTES).activeFilter).toBe(ModelFilter.PROPERTIES);
  });

  it('should filter elements and store in filteredTree', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: `${namespace}prop1`,
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });
    const aspect = new DefaultAspect({
      aspectModelUrn: `${namespace}TestAspect`,
      name: 'TestAspect',
      metaModelVersion: '2.0.0',
      properties: [prop],
    });

    const result = service.filter([aspect]);

    expect(result).toHaveLength(1);
    expect(service.filteredTree[ModelFilter.DEFAULT]).toEqual(result);
  });

  it('should create and update node tree info', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: `${namespace}prop1`,
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });

    const node = service.createNode(prop);

    expect(node).toBeTruthy();
    expect(node.element).toBe(prop);
    expect(node.filterType).toBe(ModelFilter.DEFAULT);
    expect(node.shape).toBeDefined();
  });

  it('should render graph by filter with loading screen and validation', () => {
    vi.spyOn(MaxGraphRenderer.prototype, 'render').mockReturnValue(null as never);

    const prop = new DefaultProperty({
      aspectModelUrn: `${namespace}prop1`,
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });
    const aspect = new DefaultAspect({
      aspectModelUrn: `${namespace}TestAspect`,
      name: 'TestAspect',
      metaModelVersion: '2.0.0',
      properties: [prop],
    });

    loadedFilesMock.currentLoadedFile.cachedFile.addElement(aspect.aspectModelUrn, aspect);

    service.renderByFilter(ModelFilter.DEFAULT);

    expect(loadingScreenMock.open).toHaveBeenCalled();
    expect(maxGraphServiceMock.deleteAllShapes).toHaveBeenCalled();
    expect(maxGraphServiceMock.updateGraph).toHaveBeenCalled();
    expect(maxGraphServiceMock.formatShapes).toHaveBeenCalledWith(true);
    expect(editorServiceMock.validate).toHaveBeenCalled();
    expect(loadingScreenMock.close).toHaveBeenCalled();
  });
});
