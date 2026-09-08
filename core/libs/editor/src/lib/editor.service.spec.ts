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
import {FILTER_ATTRIBUTES, FiltersService} from '@ame/loader-filters';
import {
  MaxGraphAttributeService,
  MaxGraphService,
  MaxGraphSetupService,
  MaxGraphShapeOverlayService,
  MaxGraphShapeSelectorService,
  ThemeService,
} from '@ame/max-graph';
import {ElementModelService} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ConfigurationService, SammLanguageSettingsService} from '@ame/settings-dialog';
import {AlertService, ElementCreatorService, LoadingScreenService, NotificationsService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
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
    TestBed.configureTestingModule({
      providers: [
        EditorService,
        MockProvider(FiltersService),
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
        MockProvider(ElementModelService, {
          deleteElement: vi.fn(),
          updateElement: vi.fn(),
        }),
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
    const elementModelService = TestBed.inject(ElementModelService);
    const shapeSelectorService = TestBed.inject(MaxGraphShapeSelectorService);
    const edge = {isEdge: () => true, isVertex: () => false} as any;
    vi.spyOn(shapeSelectorService, 'getSelectedCells').mockReturnValue([edge]);

    service.deleteSelectedElements();

    expect(elementModelService.deleteElement).toHaveBeenCalledWith(edge);
  });

  it('deleteSelectedElements should delete vertex cells only when both vertex and edge are selected', () => {
    const elementModelService = TestBed.inject(ElementModelService);
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

  it('createElement should center element coordinates when the graph is empty', () => {
    const maxgraphService = TestBed.inject(MaxGraphService);
    const maxgraphSetupService = TestBed.inject(MaxGraphSetupService);
    const elementCreatorService = TestBed.inject(ElementCreatorService);
    const filtersService = TestBed.inject(FiltersService);

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

    service.createElement(50, 60, 'property');

    expect(maxgraphService.setCoordinatesForNextCellRender).toHaveBeenCalledWith(40, 40);
    expect(maxgraphSetupService.centerGraph).toHaveBeenCalled();
  });

  it('createElement should use given drop coordinates when the graph is not empty', () => {
    const maxgraphService = TestBed.inject(MaxGraphService);
    const maxgraphAttributeService = TestBed.inject(MaxGraphAttributeService);
    const elementCreatorService = TestBed.inject(ElementCreatorService);
    const filtersService = TestBed.inject(FiltersService);

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

    service.createElement(50, 60, 'property');

    expect(maxgraphService.setCoordinatesForNextCellRender).toHaveBeenCalledWith(50, 60);
  });
});
