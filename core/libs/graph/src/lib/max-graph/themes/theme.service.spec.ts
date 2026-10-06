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
import {Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {darkColors} from './dark-theme';
import {lightColors} from './light-theme';
import {ThemeService} from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockGraph: any;
  let defaultEdgeStyle: any;
  let defaultVertexStyle: any;
  let edgeCell: any;
  let vertexCell: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    defaultEdgeStyle = {strokeColor: '#000000', fontColor: '#000000'};
    defaultVertexStyle = {strokeColor: '#000000', fontColor: '#000000'};
    edgeCell = {isEdge: () => true, isVertex: () => false, style: {}};
    vertexCell = {isEdge: () => false, isVertex: () => true, style: {baseStyleNames: ['aspect']}};

    mockGraph = {
      batchUpdate: vi.fn((fn: () => void) => fn()),
      getStylesheet: vi.fn(() => ({
        getDefaultEdgeStyle: () => defaultEdgeStyle,
        getDefaultVertexStyle: () => defaultVertexStyle,
      })),
      getDefaultParent: vi.fn(() => ({})),
      getChildCells: vi.fn(() => [edgeCell, vertexCell]),
      setCellStyles: vi.fn(),
      setCellStyle: vi.fn(),
      refresh: vi.fn(),
    };
  });

  it('should initialize with light theme by default', () => {
    expect(service.currentTheme).toBe('light');
    expect(service.currentColors).toEqual(lightColors);
  });

  it('should switch to dark theme and update stylesheet and cell styles', () => {
    service.setGraph(mockGraph as unknown as Graph);
    service.applyTheme('dark');

    expect(service.currentTheme).toBe('dark');
    expect(service.currentColors).toEqual(darkColors);
    expect(defaultEdgeStyle.strokeColor).toBe(darkColors.border);
    expect(defaultEdgeStyle.fontColor).toBe(darkColors.font);
    expect(mockGraph.setCellStyles).toHaveBeenCalledWith('strokeColor', darkColors.border, [edgeCell]);
    expect(mockGraph.setCellStyles).toHaveBeenCalledWith('fontColor', darkColors.font, [edgeCell]);
    expect(mockGraph.refresh).toHaveBeenCalled();
  });

  it('should apply current theme when setGraph is called', () => {
    service.applyTheme('dark');
    service.setGraph(mockGraph as unknown as Graph);

    expect(defaultEdgeStyle.strokeColor).toBe(darkColors.border);
    expect(mockGraph.setCellStyles).toHaveBeenCalledWith('strokeColor', darkColors.border, [edgeCell]);
  });
  describe('applyElementState', () => {
    let loadedFiles: LoadedFilesService;
    const element = (anonymous = false) => ({aspectModelUrn: 'urn:samm:com.example:1.0.0#element', isAnonymous: () => anonymous}) as any;

    beforeEach(() => {
      loadedFiles = TestBed.inject(LoadedFilesService);
      vi.spyOn(loadedFiles, 'isElementExtern').mockReturnValue(false);
      vi.spyOn(loadedFiles, 'isElementUnresolved').mockReturnValue(false);
    });

    it('should keep the style of a regular element', () => {
      expect(service.applyElementState({strokeColor: '#000'}, element())).toEqual({strokeColor: '#000'});
    });

    it('should make external elements lighter', () => {
      vi.mocked(loadedFiles.isElementExtern).mockReturnValue(true);

      expect(service.applyElementState({}, element()).fillOpacity).toBe(80);
    });

    it('should mark unresolved references with a dashed border in the error color', () => {
      vi.mocked(loadedFiles.isElementExtern).mockReturnValue(true);
      vi.mocked(loadedFiles.isElementUnresolved).mockReturnValue(true);

      expect(service.applyElementState({strokeColor: '#000'}, element())).toEqual({
        strokeColor: lightColors.error,
        dashed: true,
        dashPattern: '8 4',
        fillOpacity: 80,
      });
    });

    it('should mark anonymous elements with a dashed border', () => {
      expect(service.applyElementState({}, element(true))).toEqual({dashed: true, dashPattern: '4 4'});
    });

    it('should keep the unresolved marking when the theme changes', () => {
      vi.mocked(loadedFiles.isElementUnresolved).mockReturnValue(true);
      vertexCell.getMetaModelElement = () => ({element: element()});
      vertexCell.value = {};

      service.setGraph(mockGraph as unknown as Graph);
      service.applyTheme('dark');

      expect(mockGraph.setCellStyle).toHaveBeenLastCalledWith(expect.objectContaining({strokeColor: darkColors.error, dashed: true}), [
        vertexCell,
      ]);
    });
  });
});
