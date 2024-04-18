/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

export type ShapeGeometry = {
  type: 'basic' | 'circle' | 'small' | 'overlay' | 'smallCircle';
  expandedWith: number;
  expandedHeight: number;
  collapsedWidth: number;
  collapsedHeight: number;
  mxGraphStyle?: string;
};

export const basicShapeGeometry: ShapeGeometry = {
  type: 'basic',
  expandedWith: 300,
  expandedHeight: 120,
  collapsedWidth: 120,
  collapsedHeight: 40,
};

export const circleShapeGeometry: ShapeGeometry = {
  type: 'circle',
  expandedWith: 65,
  expandedHeight: 65,
  collapsedWidth: 30,
  collapsedHeight: 30,
};

export const smallBasicShapeGeometry: ShapeGeometry = {
  type: 'small',
  expandedWith: 80,
  expandedHeight: 35,
  collapsedWidth: 46,
  collapsedHeight: 30,
};

export const overlayGeometry: ShapeGeometry = {
  type: 'overlay',
  expandedWith: 20,
  expandedHeight: 20,
  collapsedWidth: 16,
  collapsedHeight: 16,
};

export const smallCircleShapeGeometry: ShapeGeometry = {
  type: 'smallCircle',
  expandedWith: 45,
  expandedHeight: 45,
  collapsedWidth: 20,
  collapsedHeight: 20,
};

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
