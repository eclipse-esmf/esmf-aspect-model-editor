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
import {inject, Injectable} from '@angular/core';
import {Cell, Point} from '@maxgraph/core';

@Injectable({providedIn: 'root'})
export class GraphViewStateService {
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);

  capture(): GraphViewState {
    const graph = this.maxgraphService.graph;
    const state: GraphViewState = {
      collapsed: this.maxgraphAttributeService.inCollapsedMode,
      shapes: {},
      edges: {},
      selection: [],
      scroll: {x: graph?.container?.scrollLeft ?? 0, y: graph?.container?.scrollTop ?? 0},
    };
    if (!graph) return state;

    for (const cell of graph.getChildVertices(graph.getDefaultParent())) {
      const urn = this.urnOf(cell);
      const geometry = cell.getGeometry();
      if (urn && geometry) {
        (state.shapes[urn] ??= []).push({x: geometry.x, y: geometry.y});
      }
    }

    for (const edge of graph.getChildEdges(graph.getDefaultParent())) {
      const key = this.edgeKey(edge);
      if (key) {
        (state.edges[key] ??= []).push((edge.getGeometry()?.points ?? []).map(point => ({x: point.x, y: point.y})));
      }
    }

    state.selection = graph
      .getSelectionCells()
      .map(cell => this.urnOf(cell))
      .filter(Boolean);
    return state;
  }

  /**
   * Applies a captured state to the rendered graph. When shapes are not part of the state (e.g. anonymous elements
   * without a stable URN), the automatic layout runs first and the known shapes are moved to their previous position afterwards.
   */
  apply(state: GraphViewState): void {
    const graph = this.maxgraphService.graph;
    if (!graph || !state) return;

    const vertices = graph.getChildVertices(graph.getDefaultParent());
    const sameMode = state.collapsed === this.maxgraphAttributeService.inCollapsedMode;
    const allShapesKnown = this.countKnownShapes(vertices, state) === vertices.length;
    if (!sameMode || !allShapesKnown) {
      this.maxgraphService.formatShapes(true);
    }

    if (sameMode) {
      graph.model.beginUpdate();
      try {
        this.applyShapes(vertices, state);
        // with the automatic layout involved, the layout routes the connections
        if (allShapesKnown) this.applyEdges(graph.getChildEdges(graph.getDefaultParent()), state);
      } finally {
        graph.model.endUpdate();
      }
    }

    graph.setSelectionCells(vertices.filter(cell => state.selection.includes(this.urnOf(cell))));

    if (graph.container) {
      graph.container.scrollLeft = state.scroll.x;
      graph.container.scrollTop = state.scroll.y;
    }
  }

  private countKnownShapes(vertices: Cell[], state: GraphViewState): number {
    const remaining = Object.fromEntries(Object.entries(state.shapes).map(([urn, positions]) => [urn, positions.length]));
    return vertices.filter(cell => {
      const urn = this.urnOf(cell);
      if (!urn || !remaining[urn]) return false;
      remaining[urn]--;
      return true;
    }).length;
  }

  private applyShapes(vertices: Cell[], state: GraphViewState): void {
    const used: Record<string, number> = {};
    for (const cell of vertices) {
      const urn = this.urnOf(cell);
      const position = urn ? state.shapes[urn]?.[used[urn] ?? 0] : undefined;
      const geometry = cell.getGeometry();
      if (!position || !geometry) continue;

      used[urn] = (used[urn] ?? 0) + 1;
      const moved = geometry.clone();
      moved.x = position.x;
      moved.y = position.y;
      this.maxgraphService.graph.model.setGeometry(cell, moved);
    }
  }

  private applyEdges(edges: Cell[], state: GraphViewState): void {
    const used: Record<string, number> = {};
    for (const edge of edges) {
      const key = this.edgeKey(edge);
      const points = key ? state.edges[key]?.[used[key] ?? 0] : undefined;
      const geometry = edge.getGeometry();
      if (!points || !geometry) continue;

      used[key] = (used[key] ?? 0) + 1;
      const routed = geometry.clone();
      routed.points = points.map(point => new Point(point.x, point.y));
      this.maxgraphService.graph.model.setGeometry(edge, routed);
    }
  }

  private edgeKey(edge: Cell): string | null {
    const source = this.urnOf(edge.source);
    const target = this.urnOf(edge.target);
    return source && target ? `${source} -> ${target}` : null;
  }

  private urnOf(cell: Cell | null | undefined): string | undefined {
    return cell ? MaxGraphHelper.getModelElement(cell)?.aspectModelUrn : undefined;
  }
}
