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

import {
  MaxGraphAttributeService,
  MaxGraphService,
  MaxGraphSetupService,
  MaxGraphShapeOverlayService,
  MaxGraphShapeSelectorService,
  ThemeService,
} from '@ame/graph';
import {LoadedFilesService, ModelApiService, ModelService, NamespaceFile, RdfService} from '@ame/infrastructure';
import {
  AlertService,
  ELEMENT_MODEL_SERVICE,
  ElementCreatorService,
  FILTER_ATTRIBUTES,
  FILTERS_SERVICE,
  LanguageTranslationService,
  LoadingScreenService,
  MODEL_ELEMENT_NAMING_SERVICE,
  NotificationsService,
  TitleService,
} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService, SammLanguageSettingsService} from '../settings-dialog';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {ShapeSettingsStateService} from './editor-dialog';
import {EditorService} from './editor.service';
import {ModelSaverService} from './model-saver.service';

describe('EditorService', () => {
  let service: EditorService;
  let modelApiService: ModelApiService;
  let rdfService: RdfService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    const mockElementModel = {
      deleteElement: vi.fn(),
      updateElement: vi.fn(),
    };
    const mockFiltersService = {
      createNode: vi.fn(),
      filter: vi.fn(elements => elements),
    };
    const mockNamingService = {
      resolveMetaModelElement$: vi.fn().mockImplementation(el => of(el)),
      resolveMetaModelElement: vi.fn().mockImplementation(el => el),
      resolveElementNaming: vi.fn().mockImplementation(el => el),
    };

    TestBed.configureTestingModule({
      providers: [
        EditorService,
        {provide: FILTERS_SERVICE, useValue: mockFiltersService},
        {provide: FILTER_ATTRIBUTES, useValue: {isFiltering: false, changeState: vi.fn()}},
        MockProvider(ConfigurationService, {
          getSettings: vi.fn(
            () =>
              ({
                autoValidationEnabled: false,
                validationTimerSeconds: 60,
              }) as any,
          ),
        }),
        MockProvider(ModelSaverService, {
          enableAutoSave: vi.fn(),
        }),
        MockProvider(MaxGraphService, {
          initGraph: vi.fn(),
          resetValidationErrorOnAllShapes: vi.fn(),
          graph: {
            getOutgoingEdges: vi.fn(() => []),
          } as any,
        }),
        MockProvider(MaxGraphSetupService, {
          centerGraph: vi.fn(),
        }),
        MockProvider(MaxGraphShapeOverlayService),
        MockProvider(MaxGraphShapeSelectorService, {
          getSelectedCells: vi.fn(() => []),
        }),
        MockProvider(MaxGraphAttributeService, {
          graph: {
            getContainer: vi.fn(() => document.createElement('div')),
            addListener: vi.fn(),
            getDataModel: vi.fn(() => ({addListener: vi.fn()})),
            view: {setTranslate: vi.fn()},
            zoomIn: vi.fn(),
            zoomOut: vi.fn(),
            setCellStyles: vi.fn(),
          } as any,
        }),
        MockProvider(NotificationsService),
        MockProvider(ModelApiService, {
          generateJsonSample: vi.fn(() => of('{}')),
          generateJsonSchema: vi.fn(() => of('{}')),
          generateOpenApiSpec: vi.fn(() => of('')),
          generateAsyncApiSpec: vi.fn(() => of('')),
          validate: vi.fn(() => of([])),
        }),
        MockProvider(ModelService, {
          synchronizeModelToRdf: vi.fn(() => of(undefined)),
        }),
        MockProvider(AlertService),
        MockProvider(RdfService, {
          serializeModel: vi.fn(() => 'turtle content'),
        }),
        MockProvider(SammLanguageSettingsService),
        MockProvider(ConfirmDialogService),
        {provide: ELEMENT_MODEL_SERVICE, useValue: mockElementModel},
        MockProvider(TitleService),
        MockProvider(ThemeService, {
          currentColors: {border: '#000000', font: '#000000'} as any,
        }),
        MockProvider(ShapeSettingsStateService, {
          isShapeSettingOpened: vi.fn(() => false) as any,
          selectedShapeForUpdate: vi.fn(() => null) as any,
          closeShapeSettings: vi.fn(),
        }),
        MockProvider(LoadingScreenService, {
          open: vi.fn(() => ({afterOpened: () => of(null)}) as any),
          close: vi.fn(),
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            loadingScreenDialog: {
              zoomInProgress: 'Zoom In',
              zoomInWait: 'Wait',
              zoomOutProgress: 'Zoom Out',
              fittingProgress: 'Fit',
              fittingWait: 'Wait',
              fitToViewProgress: 'Actual',
              folding: 'Fold',
              expanding: 'Expand',
              actionWait: 'Wait',
              formatting: 'Format',
              waitFormat: 'Wait',
            },
            notificationService: {},
          } as any,
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
        MockProvider(ElementCreatorService),
        {provide: MODEL_ELEMENT_NAMING_SERVICE, useValue: mockNamingService},
      ],
    });

    service = TestBed.inject(EditorService);
    modelApiService = TestBed.inject(ModelApiService);
    rdfService = TestBed.inject(RdfService);
  });

  it('generateJsonSample should serialize model and call api', async () => {
    const rdfModel = new RdfModel(new Store());
    await new Promise(resolve => service.generateJsonSample(rdfModel).subscribe(resolve));

    expect(rdfService.serializeModel).toHaveBeenCalledWith(rdfModel);
    expect(modelApiService.generateJsonSample).toHaveBeenCalled();
  });

  it('validate should synchronize and call validate on api', async () => {
    await new Promise(resolve => service.validate().subscribe(resolve));

    expect(modelApiService.validate).toHaveBeenCalled();
  });

  it('deleteSelectedElements should delegate edge deletion to elementModelService when only edge is selected', () => {
    const elementModelService = TestBed.inject(ELEMENT_MODEL_SERVICE);
    const shapeSelectorService = TestBed.inject(MaxGraphShapeSelectorService);
    const edge = {isEdge: () => true, isVertex: () => false} as any;
    vi.spyOn(shapeSelectorService, 'getSelectedCells').mockReturnValue([edge]);

    service.deleteSelectedElements();

    expect(elementModelService.deleteElement).toHaveBeenCalledWith(edge);
  });

  it('deleteSelectedElements should delete vertex cells only when both vertex and edge are selected', () => {
    const elementModelService = TestBed.inject(ELEMENT_MODEL_SERVICE);
    const shapeSelectorService = TestBed.inject(MaxGraphShapeSelectorService);
    const maxgraphService = TestBed.inject(MaxGraphService);
    (maxgraphService as any).graph = {getOutgoingEdges: vi.fn(() => [])};
    const vertex = {isEdge: () => false, isVertex: () => true} as any;
    const edge = {isEdge: () => true, isVertex: () => false} as any;
    vi.spyOn(shapeSelectorService, 'getSelectedCells').mockReturnValue([vertex, edge]);

    service.deleteSelectedElements();

    expect(elementModelService.deleteElement).toHaveBeenCalledWith(vertex);
    expect(elementModelService.deleteElement).not.toHaveBeenCalledWith(edge);
  });

  it('createElement should center element coordinates when the graph is empty', async () => {
    const maxgraphService = TestBed.inject(MaxGraphService);
    const maxgraphSetupService = TestBed.inject(MaxGraphSetupService);
    const elementCreatorService = TestBed.inject(ElementCreatorService);
    const filtersService = TestBed.inject(FILTERS_SERVICE);

    (maxgraphService as any).isModelEmpty = vi.fn(() => true);
    maxgraphService.renderModelElement = vi.fn(() => ({id: 'mock-cell'}) as any);
    maxgraphService.setCoordinatesForNextCellRender = vi.fn();
    maxgraphService.formatCell = vi.fn();
    maxgraphService.navigateToCell = vi.fn();

    const mockElement = new DefaultProperty({name: 'property', aspectModelUrn: 'urn:test:1.0.0#property', metaModelVersion: '2.0.0'});
    vi.spyOn(elementCreatorService, 'createEmptyElement').mockReturnValue(mockElement as any);
    vi.spyOn(filtersService, 'createNode').mockReturnValue({
      element: mockElement,
      shape: {expandedWith: 300, expandedHeight: 120},
      children: [],
    } as any);

    await service.createElement(50, 60, 'property');

    expect(elementCreatorService.createEmptyElement).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({resolveNaming: false, cached: false}),
    );
    expect(maxgraphService.setCoordinatesForNextCellRender).toHaveBeenCalledWith(40, 40);
    expect(maxgraphSetupService.centerGraph).toHaveBeenCalled();
  });

  it('createElement should use given drop coordinates when the graph is not empty', async () => {
    const maxgraphService = TestBed.inject(MaxGraphService);
    const maxgraphAttributeService = TestBed.inject(MaxGraphAttributeService);
    const elementCreatorService = TestBed.inject(ElementCreatorService);
    const filtersService = TestBed.inject(FILTERS_SERVICE);

    const mockContainer = {clientWidth: 1000, clientHeight: 800} as HTMLDivElement;
    (maxgraphAttributeService as any).graph.getContainer = vi.fn(() => mockContainer);
    (maxgraphService as any).isModelEmpty = vi.fn(() => false);
    maxgraphService.renderModelElement = vi.fn(() => ({id: 'mock-cell'}) as any);
    maxgraphService.setCoordinatesForNextCellRender = vi.fn();
    maxgraphService.formatCell = vi.fn();
    maxgraphService.navigateToCell = vi.fn();

    const mockElement = new DefaultProperty({name: 'property', aspectModelUrn: 'urn:test:1.0.0#property', metaModelVersion: '2.0.0'});
    vi.spyOn(elementCreatorService, 'createEmptyElement').mockReturnValue(mockElement as any);
    vi.spyOn(filtersService, 'createNode').mockReturnValue({
      element: mockElement,
      shape: {expandedWith: 300, expandedHeight: 120},
      children: [],
    } as any);

    await service.createElement(50, 60, 'property');

    expect(maxgraphService.setCoordinatesForNextCellRender).toHaveBeenCalledWith(50, 60);
  });

  it('createElement with aspectModelUrn should render only the reference and clear any children', async () => {
    const maxgraphService = TestBed.inject(MaxGraphService);
    const loadedFilesService = TestBed.inject(LoadedFilesService);
    const filtersService = TestBed.inject(FILTERS_SERVICE);

    (maxgraphService as any).isModelEmpty = vi.fn(() => false);
    maxgraphService.resolveCellByModelElement = vi.fn(() => null);
    maxgraphService.setCoordinatesForNextCellRender = vi.fn();
    maxgraphService.formatCell = vi.fn();
    maxgraphService.navigateToCell = vi.fn();

    const mockExtProp = new DefaultProperty({
      name: 'extProp',
      aspectModelUrn: 'urn:ext:1.0.0#extProp',
      metaModelVersion: '2.0.0',
    });
    vi.spyOn(loadedFilesService, 'findElementOnExtReferences').mockReturnValue(mockExtProp as any);

    const childNode = {element: {name: 'Text', aspectModelUrn: 'urn:samm:...#Text'}, children: []};
    const nodeWithChildren = {
      element: mockExtProp,
      shape: {expandedWith: 300, expandedHeight: 120},
      children: [childNode],
    };
    vi.spyOn(filtersService, 'filter').mockReturnValue([nodeWithChildren as any]);

    await service.createElement(100, 150, 'property', 'urn:ext:1.0.0#extProp');

    expect(nodeWithChildren.children).toHaveLength(0);
    expect(maxgraphService.setCoordinatesForNextCellRender).toHaveBeenCalledWith(100, 150);
  });
});
