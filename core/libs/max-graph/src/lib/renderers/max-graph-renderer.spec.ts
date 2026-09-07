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

import {DefaultCharacteristic, DefaultUnit} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MaxGraphRenderer} from './max-graph-renderer';

describe('MaxGraphRenderer', () => {
  let renderer: MaxGraphRenderer;
  let mockMaxgraphService: any;
  let mockShapeOverlayService: any;
  let mockSammLangService: any;
  let mockGraph: any;

  beforeEach(() => {
    mockGraph = {
      getOutgoingEdges: vi.fn().mockReturnValue([]),
    };

    mockMaxgraphService = {
      graph: mockGraph,
      renderModelElement: vi.fn().mockReturnValue(new Cell()),
      resolveCellByModelElement: vi.fn().mockReturnValue(undefined),
      assignToParent: vi.fn(),
    };

    mockShapeOverlayService = {};
    mockSammLangService = {
      getLanguageValues: vi.fn().mockReturnValue({preferredNames: [], descriptions: []}),
      setSammLanguageCodes: vi.fn(),
    };

    renderer = new MaxGraphRenderer(mockMaxgraphService, mockShapeOverlayService, mockSammLangService, null);
  });

  it('should render a standalone unit when parent is null without throwing errors', () => {
    const unit = new DefaultUnit({
      name: 'Kilometre',
      aspectModelUrn: 'urn:samm:org.example:1.0.0#Kilometre',
      metaModelVersion: '2.2.0',
    });

    const node = {
      element: unit,
      children: [],
      parents: [],
    } as any;

    const cell = renderer.renderUnit(node, null);
    expect(cell).toBeDefined();
    expect(mockMaxgraphService.renderModelElement).toHaveBeenCalled();
  });

  it('should return null when parent is not a DefaultCharacteristic', () => {
    const unit = new DefaultUnit({
      name: 'Kilometre',
      aspectModelUrn: 'urn:samm:org.example:1.0.0#Kilometre',
      metaModelVersion: '2.2.0',
    });

    const parentCell = new Cell();
    const node = {
      element: unit,
      children: [],
      parents: [],
    } as any;

    const cell = renderer.renderUnit(node, parentCell);
    expect(cell).toBeNull();
  });
});

