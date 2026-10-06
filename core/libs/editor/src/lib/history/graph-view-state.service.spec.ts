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

import {GraphViewState} from '@ame/domain';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService} from '@ame/graph';
import {TestBed} from '@angular/core/testing';
import {Geometry, Point} from '@maxgraph/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphViewStateService} from './graph-view-state.service';

interface FakeCell {
  urn?: string;
  geometry: Geometry;
  source?: FakeCell;
  target?: FakeCell;
  getGeometry: () => Geometry;
}

const vertex = (urn: string | undefined, x: number, y: number): FakeCell => {
  const cell: FakeCell = {urn, geometry: new Geometry(x, y, 100, 50), getGeometry: () => cell.geometry};
  return cell;
};

const edge = (source: FakeCell, target: FakeCell, points: Point[] = []): FakeCell => {
  const geometry = new Geometry();
  geometry.points = points;
  const cell: FakeCell = {source, target, geometry, getGeometry: () => cell.geometry};
  return cell;
};

describe('GraphViewStateService', () => {
  let service: GraphViewStateService;
  let vertices: FakeCell[];
  let edges: FakeCell[];
  let selection: FakeCell[];
  let attributes: {inCollapsedMode: boolean};
  let maxgraphService: {graph: any; formatShapes: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    const aspect = vertex('urn:a#Aspect', 10, 20);
    const property = vertex('urn:a#property', 30, 200);
    vertices = [aspect, property];
    edges = [edge(aspect, property, [new Point(5, 6)])];
    selection = [property];
    attributes = {inCollapsedMode: false};

    const graph = {
      container: {scrollLeft: 40, scrollTop: 50},
      getDefaultParent: () => null,
      getChildVertices: () => vertices,
      getChildEdges: () => edges,
      getSelectionCells: () => selection,
      setSelectionCells: vi.fn((cells: FakeCell[]) => (selection = cells)),
      model: {
        beginUpdate: vi.fn(),
        endUpdate: vi.fn(),
        setGeometry: vi.fn((cell: FakeCell, geometry: Geometry) => (cell.geometry = geometry)),
      },
    };
    maxgraphService = {graph, formatShapes: vi.fn()};
    vi.spyOn(MaxGraphHelper, 'getModelElement').mockImplementation((cell: any) => (cell?.urn ? {aspectModelUrn: cell.urn} : null) as any);

    TestBed.configureTestingModule({
      providers: [
        GraphViewStateService,
        {provide: MaxGraphService, useValue: maxgraphService},
        {provide: MaxGraphAttributeService, useValue: attributes},
      ],
    });
    service = TestBed.inject(GraphViewStateService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('captures positions, connections, selection and scrolling by element URN', () => {
    expect(service.capture()).toEqual({
      collapsed: false,
      shapes: {'urn:a#Aspect': [{x: 10, y: 20}], 'urn:a#property': [{x: 30, y: 200}]},
      edges: {'urn:a#Aspect -> urn:a#property': [[{x: 5, y: 6}]]},
      selection: ['urn:a#property'],
      scroll: {x: 40, y: 50},
    });
  });

  it('applies the state to a newly rendered graph without running the layout', () => {
    const state: GraphViewState = service.capture();
    const aspect = vertex('urn:a#Aspect', 0, 0);
    const property = vertex('urn:a#property', 0, 0);
    vertices = [aspect, property];
    edges = [edge(aspect, property)];
    selection = [];
    maxgraphService.graph.container = {scrollLeft: 0, scrollTop: 0};

    service.apply(state);

    expect(maxgraphService.formatShapes).not.toHaveBeenCalled();
    expect([aspect.geometry.x, aspect.geometry.y]).toEqual([10, 20]);
    expect([property.geometry.x, property.geometry.y]).toEqual([30, 200]);
    expect(edges[0].geometry.points.map(p => [p.x, p.y])).toEqual([[5, 6]]);
    expect(selection).toEqual([property]);
    expect(maxgraphService.graph.container).toEqual({scrollLeft: 40, scrollTop: 50});
  });

  it('keeps the order of shapes which show the same element more than once', () => {
    vertices = [vertex('urn:shared', 1, 1), vertex('urn:shared', 2, 2)];
    edges = [];
    const state = service.capture();
    const first = vertex('urn:shared', 0, 0);
    const second = vertex('urn:shared', 0, 0);
    vertices = [first, second];

    service.apply(state);
    expect([first.geometry.x, second.geometry.x]).toEqual([1, 2]);
  });

  it('runs the layout first for unknown shapes and keeps the routing of the layout', () => {
    const state = service.capture();
    const aspect = vertex('urn:a#Aspect', 0, 0);
    const property = vertex('urn:a#property', 0, 0);
    const anonymous = vertex(undefined, 7, 8);
    vertices = [aspect, property, anonymous];
    edges = [edge(aspect, property, [new Point(99, 99)])];

    service.apply(state);

    expect(maxgraphService.formatShapes).toHaveBeenCalledWith(true);
    expect([aspect.geometry.x, property.geometry.y]).toEqual([10, 200]);
    expect([anonymous.geometry.x, anonymous.geometry.y]).toEqual([7, 8]);
    expect(edges[0].geometry.points.map(p => [p.x, p.y])).toEqual([[99, 99]]);
  });

  it('only runs the layout when the collapse mode differs', () => {
    const state = {...service.capture(), collapsed: true};
    const aspect = vertex('urn:a#Aspect', 0, 0);
    vertices = [aspect, vertex('urn:a#property', 0, 0)];

    service.apply(state);

    expect(maxgraphService.formatShapes).toHaveBeenCalledWith(true);
    expect(aspect.geometry.x).toBe(0);
    expect(maxgraphService.graph.model.setGeometry).not.toHaveBeenCalled();
  });

  it('does nothing without graph or state', () => {
    maxgraphService.graph = null;
    expect(() => service.apply(service.capture())).not.toThrow();
    expect(service.capture().shapes).toEqual({});
  });
});
