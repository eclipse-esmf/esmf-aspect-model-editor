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

import {SerializationMetadataState} from '@esmf/aspect-model-loader';

/** Number of steps which can be undone per tab. */
export const HISTORY_LIMIT = 25;

export interface ViewPoint {
  x: number;
  y: number;
}

/**
 * What the user sees of a model besides its content: positions of the shapes, routing of the connections and the selection.
 * Shapes are identified by the URN of their element, so the state can be applied to a newly rendered graph.
 */
export interface GraphViewState {
  collapsed: boolean;
  /** Positions of the shapes by element URN (a list, in case an element is shown more than once). */
  shapes: Record<string, ViewPoint[]>;
  /** Waypoints of the connections by "source URN -> target URN". */
  edges: Record<string, ViewPoint[][]>;
  selection: string[];
  scroll: ViewPoint;
}

/** Everything needed to show a model again as it was: its content, its file layout and its view. */
export interface ModelSnapshot {
  rdf: string;
  metadata: SerializationMetadataState;
  view: GraphViewState;
}

export type HistoryDirection = 'undo' | 'redo';

export interface TabHistory {
  undo: ModelSnapshot[];
  redo: ModelSnapshot[];
  /** The state after the last recorded step, which is the state to go back to with the next undo. */
  current: ModelSnapshot | null;
}
