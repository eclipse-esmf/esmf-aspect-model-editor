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

import {describe, expect, it} from 'vitest';
import {
  ModelCompactTreeLayout,
  ModelHierarchicalLayout,
  basicShapeGeometry,
  circleShapeGeometry,
  overlayGeometry,
  smallBasicShapeGeometry,
  smallCircleShapeGeometry,
} from './shape-geometry';

describe('Shape Geometry Constants', () => {
  it('should define basicShapeGeometry properties', () => {
    expect(basicShapeGeometry.type).toBe('basic');
    expect(basicShapeGeometry.expandedWith).toBe(300);
    expect(basicShapeGeometry.expandedHeight).toBe(120);
    expect(basicShapeGeometry.collapsedWidth).toBe(120);
    expect(basicShapeGeometry.collapsedHeight).toBe(40);
  });

  it('should define circleShapeGeometry properties', () => {
    expect(circleShapeGeometry.type).toBe('circle');
    expect(circleShapeGeometry.expandedWith).toBe(65);
    expect(circleShapeGeometry.expandedHeight).toBe(65);
  });

  it('should define smallBasicShapeGeometry properties', () => {
    expect(smallBasicShapeGeometry.type).toBe('small');
    expect(smallBasicShapeGeometry.expandedWith).toBe(80);
    expect(smallBasicShapeGeometry.expandedHeight).toBe(35);
  });

  it('should define overlayGeometry properties', () => {
    expect(overlayGeometry.type).toBe('overlay');
    expect(overlayGeometry.expandedWith).toBe(20);
    expect(overlayGeometry.expandedHeight).toBe(20);
  });

  it('should define smallCircleShapeGeometry properties', () => {
    expect(smallCircleShapeGeometry.type).toBe('smallCircle');
    expect(smallCircleShapeGeometry.expandedWith).toBe(45);
    expect(smallCircleShapeGeometry.expandedHeight).toBe(45);
  });

  it('should define layout enums', () => {
    expect(ModelHierarchicalLayout.expandedIntraCellSpacing).toBe(30);
    expect(ModelCompactTreeLayout.minEdgeJetty).toBe(10);
  });
});
