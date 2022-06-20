/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

export enum ExpandedModelShape {
  expandedElementWidth = 300,
  expandedElementHeight = 120,
  collapsedElementWidth = 120,
  collapsedElementHeight = 40,
  parameterHeight = 30,
}

export enum ExpandedOverlay {
  width = 20,
  height = 20,
}

export enum CollapsedOverlay {
  width = 16,
  height = 16,
}

export enum ModelHierarchicalLayout {
  expandedIntraCellSpacing = 30,
  expandedInterRankCellSpacing = 30,
  collapsedIntraCellSpacing = 15,
  collapsedInterRankCellSpacing = 20,
  edgeStyle = 2,
}

export enum ModelCompactTreeLayout {
  minEdgeJetty = 10,
  expandedLevelDistance = 30,
  collapsedLevelDistance = 15,
  expandedNodeDistance = 20,
  collapsedNodeDistance = 10,
}

export enum ExpandedEllipseShape {
  collapsedEllipseElementWidth = 30,
  collapsedEllipseElementHeight = 30,
  expandedEllipseElementWidth = 65,
  expandedEllipseElementHeight = 65,
}

export enum ExpandedRoundBorderShape {
  expandedRoundBorderWidth = 80,
  expandedRoundBorderHeight = 35,
  collapsedRoundBorderWidth = 30,
  collapsedRoundBorderHeight = 30,
}

export enum ExpandedMiniShape {
  expandedRoundBorderWidth = 100,
  expandedRoundBorderHeight = 40,
  collapsedRoundBorderWidth = 30,
  collapsedRoundBorderHeight = 30,
}
