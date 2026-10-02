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

import {LoadedFilesService} from '@ame/domain';
import {TestBed} from '@angular/core/testing';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphShapeSelectorService} from './max-graph-shape-selector.service';

describe('MaxGraphShapeSelectorService', () => {
  let service: MaxGraphShapeSelectorService;
  let graph: Graph;
  let aspect: Cell;
  let property: Cell;
  let edge: Cell;

  beforeEach(() => {
    graph = new Graph(document.createElement('div'));
    const parent = graph.getDefaultParent();
    graph.batchUpdate(() => {
      aspect = graph.insertVertex({parent, value: 'aspect', position: [0, 0], size: [100, 40]});
      property = graph.insertVertex({parent, value: 'property', position: [0, 100], size: [100, 40]});
      edge = graph.insertEdge({parent, source: aspect, target: property});
    });

    TestBed.configureTestingModule({
      providers: [
        MaxGraphShapeSelectorService,
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: LoadedFilesService, useValue: {isElementExtern: vi.fn().mockReturnValue(false)}},
      ],
    });
    service = TestBed.inject(MaxGraphShapeSelectorService);
    service.initSelectionListener();
  });

  it('should track selected edges separately from selected elements', () => {
    graph.setSelectionCells([aspect, edge]);

    expect(service.getSelectedCells()).toEqual([aspect]);
    expect(service.getSelectedEdges()).toEqual([edge]);
    expect(service.selectedCells()).toEqual([aspect]);
    expect(service.selectedEdges()).toEqual([edge]);
    expect(service.selectedShape()).toBe(aspect);
    expect(service.hasSelection()).toBe(true);
  });

  it('should report a selection when only an edge is selected', () => {
    graph.setSelectionCell(edge);

    expect(service.selectedCells()).toEqual([]);
    expect(service.selectedShape()).toBeNull();
    expect(service.hasSelection()).toBe(true);

    graph.clearSelection();
    expect(service.hasSelection()).toBe(false);
  });

  it('should select the whole tree starting from a selected edge', () => {
    graph.setSelectionCell(edge);

    service.selectTree();

    expect(graph.getSelectionCells()).toEqual(expect.arrayContaining([aspect, property]));
  });
});
