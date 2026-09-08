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

import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {DefaultCharacteristic} from '@esmf/aspect-model-loader';
import {Cell, Geometry} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MaxGraphHelper} from '../../helpers';
import {ThemeService} from '../../themes';
import {MaxGraphAttributeService} from '../max-graph-attribute.service';
import {MaxGraphService} from '../max-graph.service';
import {BaseRenderService} from './base-render-service';

class TestRenderService extends BaseRenderService {
  isApplicable(cell: Cell): boolean {
    return true;
  }
}

describe('BaseRenderService', () => {
  let service: TestRenderService;
  let mockGraph: any;
  let mockMaxgraphService: any;
  let mockLoadedFilesService: any;
  let mockThemeService: any;

  beforeEach(() => {
    mockGraph = {
      labelChanged: vi.fn(),
      setCellStyle: vi.fn(),
    };

    mockMaxgraphService = {
      graph: mockGraph,
      formatCell: vi.fn(),
      formatShapes: vi.fn(),
    };

    mockLoadedFilesService = {
      currentLoadedFile: {
        absoluteName: 'com.test:1.0.0:Test.ttl',
        isElementExtern: vi.fn().mockReturnValue(false),
        rdfModel: {
          getAspectModelUrn: vi.fn().mockReturnValue('urn:samm:com.test:1.0.0#'),
        },
      },
      isElementExtern: vi.fn().mockReturnValue(false),
    };

    mockThemeService = {
      generateThemeStyle: vi.fn().mockReturnValue({baseStyleNames: ['characteristic']}),
    };

    TestBed.configureTestingModule({
      providers: [
        TestRenderService,
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: SammLanguageSettingsService, useValue: {currentLanguage: () => 'en'}},
        {provide: MaxGraphAttributeService, useValue: {graph: mockGraph}},
        {provide: ThemeService, useValue: mockThemeService},
      ],
    });

    service = TestBed.inject(TestRenderService);
  });

  it('should update cell style with dashed border when element is anonymous', () => {
    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'urn:samm:com.test:1.0.0#[Characteristic]_1234',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });

    const cell = new Cell();
    cell.geometry = new Geometry(0, 0, 100, 100);
    cell['configuration'] = {};
    const node = {element: anonChar, shape: {maxgraphStyle: {}}} as any;
    MaxGraphHelper.setElementNode(cell, node);

    service.update({cell});

    expect(cell.id).toBe('urn:samm:com.test:1.0.0#[Characteristic]_1234');
    expect(mockGraph.setCellStyle).toHaveBeenCalledWith(
      expect.objectContaining({
        dashed: true,
        dashPattern: '4 4',
      }),
      [cell],
    );
    expect(node.shape.maxgraphStyle.dashed).toBe(true);
  });

  it('should update cell style without dashed border when element is not anonymous', () => {
    const namedChar = new DefaultCharacteristic({
      name: 'NamedChar',
      aspectModelUrn: 'urn:samm:com.test:1.0.0#NamedChar',
      metaModelVersion: '2.2.0',
      isAnonymous: false,
    });

    const cell = new Cell();
    cell.geometry = new Geometry(0, 0, 100, 100);
    cell['configuration'] = {};
    const node = {element: namedChar, shape: {maxgraphStyle: {}}} as any;
    MaxGraphHelper.setElementNode(cell, node);

    service.update({cell});

    expect(cell.id).toBe('NamedChar');
    expect(mockGraph.setCellStyle).toHaveBeenCalledWith(
      expect.not.objectContaining({
        dashed: true,
      }),
      [cell],
    );
  });
});
