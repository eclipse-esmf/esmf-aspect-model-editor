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

import {LoadedFilesService, NamespaceFile} from '@ame/infrastructure';
import {GRAPH_FILTER_RENDERER, IGraphFilterRenderer, SHAPE_SETTINGS_STATE_SERVICE} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FILTER_ATTRIBUTES} from './active-filter.session';
import {DefaultFilter, PropertiesFilterLoader} from './filters';
import {FiltersService} from './filters.service';
import {ModelFilter} from './models';

describe('FiltersService', () => {
  let service: FiltersService;
  let graphFilterRendererMock: IGraphFilterRenderer;
  let loadedFilesMock: {
    currentLoadedFile: NamespaceFile;
    isElementExtern: ReturnType<typeof vi.fn>;
  };

  const namespace = 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#';

  beforeEach(() => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0', namespace);
    const cachedFile = new ModelElementCache();

    graphFilterRendererMock = {
      renderFilteredTree: vi.fn(),
      getSelectedModelElement: vi.fn(() => null),
    };

    loadedFilesMock = {
      currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
      isElementExtern: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      providers: [
        FiltersService,
        {provide: GRAPH_FILTER_RENDERER, useValue: graphFilterRendererMock},
        {provide: LoadedFilesService, useValue: loadedFilesMock},
        {provide: SHAPE_SETTINGS_STATE_SERVICE, useValue: {isShapeSettingOpened: vi.fn(() => false) as any, closeShapeSettings: vi.fn()}},
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

  it('should render graph by filter using GRAPH_FILTER_RENDERER', () => {
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

    expect(graphFilterRendererMock.renderFilteredTree).toHaveBeenCalled();
  });
});
