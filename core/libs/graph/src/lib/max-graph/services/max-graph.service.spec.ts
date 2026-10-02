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

import {ConfigurationService, FilterAttributesService, LoadedFilesService} from '@ame/domain';
import {NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {Graph, InternalEvent} from '@maxgraph/core';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it} from 'vitest';
import {ThemeService} from '../themes/theme.service';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphGeometryProviderService} from './max-graph-geometry-provider.service';
import {MaxGraphSetupService} from './max-graph-setup.service';
import {MaxGraphShapeOverlayService} from './max-graph-shape-overlay.service';
import {MaxGraphShapeSelectorService} from './max-graph-shape-selector.service';
import {MaxGraphService} from './max-graph.service';

describe('MaxGraphService', () => {
  let service: MaxGraphService;
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph(document.createElement('div'));
    const parent = graph.getDefaultParent();
    graph.batchUpdate(() => {
      const aspect = graph.insertVertex({parent, value: 'aspect', position: [0, 0], size: [100, 40]});
      const property = graph.insertVertex({parent, value: 'property', position: [0, 100], size: [100, 40]});
      graph.insertEdge({parent, source: aspect, target: property});
    });

    TestBed.configureTestingModule({
      providers: [
        MaxGraphService,
        MockProvider(FilterAttributesService),
        MockProvider(LoadedFilesService),
        MockProvider(ConfigurationService),
        MockProvider(MaxGraphSetupService),
        MockProvider(MaxGraphGeometryProviderService),
        MockProvider(MaxGraphShapeOverlayService),
        MockProvider(MaxGraphAttributeService, {graph}),
        MockProvider(NotificationsService),
        MockProvider(ThemeService),
        MockProvider(MaxGraphShapeSelectorService),
      ],
    });
    service = TestBed.inject(MaxGraphService);
    service.graph = graph;
  });

  it('deleteAllShapes flags the removal as graph clearing so listeners can keep the model untouched', () => {
    const clearingStates: boolean[] = [];
    graph.addListener(InternalEvent.CELLS_REMOVED, () => {
      clearingStates.push(service.isClearingGraph);
    });

    expect(service.isClearingGraph).toBe(false);
    service.deleteAllShapes();

    expect(clearingStates).toEqual([true]);
    expect(service.isClearingGraph).toBe(false);
    expect(graph.getChildCells(graph.getDefaultParent())).toHaveLength(0);
  });

  it('does not flag regular cell removals as graph clearing', () => {
    const clearingStates: boolean[] = [];
    graph.addListener(InternalEvent.CELLS_REMOVED, () => clearingStates.push(service.isClearingGraph));

    service.removeCells([graph.getChildVertices(graph.getDefaultParent())[1]]);

    expect(clearingStates).toEqual([false]);
  });
});
