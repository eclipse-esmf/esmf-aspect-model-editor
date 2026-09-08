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
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeSelectorService} from '@ame/max-graph';
import {BindingsService} from '@ame/shared';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorService} from '../../editor.service';
import {OpenReferencedElementService} from '../../open-element-window/open-element-window.service';
import {ShapeSettingsStateService} from './shape-settings-state.service';
import {ShapeSettingsService} from './shape-settings.service';

describe('ShapeSettingsService', () => {
  let service: ShapeSettingsService;
  let shapeSettingsStateService: ShapeSettingsStateService;
  let maxgraphShapeSelectorService: MaxGraphShapeSelectorService;
  let openReferencedElementService: OpenReferencedElementService;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    const selectedShapeSignal = signal<Cell | null>(null);

    TestBed.configureTestingModule({
      providers: [
        ShapeSettingsService,
        MockProvider(MaxGraphAttributeService),
        MockProvider(MaxGraphService, {
          isModelEmpty: signal(false),
        }),
        MockProvider(MaxGraphShapeSelectorService, {
          selectedCells: signal([]),
          getSelectedShape: vi.fn(),
        }),
        MockProvider(BindingsService, {
          registerAction: vi.fn(),
        }),
        MockProvider(EditorService),
        MockProvider(ShapeSettingsStateService, {
          openShapeSettings: vi.fn(),
          selectedShapeForUpdate: selectedShapeSignal,
          setSelectedShapeForUpdate: vi.fn(cell => selectedShapeSignal.set(cell)),
        }),
        MockProvider(OpenReferencedElementService, {
          openReferencedElement: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          isElementExtern: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(ShapeSettingsService);
    shapeSettingsStateService = TestBed.inject(ShapeSettingsStateService);
    maxgraphShapeSelectorService = TestBed.inject(MaxGraphShapeSelectorService);
    openReferencedElementService = TestBed.inject(OpenReferencedElementService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
  });

  it('unselectShapeForUpdate should clear selectedShapeForUpdate', () => {
    service.unselectShapeForUpdate();
    expect(shapeSettingsStateService.setSelectedShapeForUpdate).toHaveBeenCalledWith(null);
  });

  it('editModel should open shape settings and set modelElement', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    service.editModel(entity);

    expect(shapeSettingsStateService.openShapeSettings).toHaveBeenCalled();
    expect(service.modelElement()).toBe(entity);
  });

  it('editSelectedCell should do nothing if selected shape is edge or null', () => {
    const edgeCell = new Cell();
    edgeCell.setEdge(true);
    vi.spyOn(maxgraphShapeSelectorService, 'getSelectedShape').mockReturnValue(edgeCell);

    service.editSelectedCell();

    expect(shapeSettingsStateService.openShapeSettings).not.toHaveBeenCalled();
  });

  it('editSelectedCell should open referenced element if external', () => {
    const vertexCell = new Cell();
    vertexCell.setVertex(true);
    const entity = new DefaultEntity({aspectModelUrn: 'urn:ext#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    vertexCell.setValue(entity);
    (vertexCell as any).getMetaModelElement = () => ({element: entity});

    vi.spyOn(maxgraphShapeSelectorService, 'getSelectedShape').mockReturnValue(vertexCell);
    vi.spyOn(loadedFilesService, 'isElementExtern').mockReturnValue(true);

    service.editSelectedCell();

    expect(openReferencedElementService.openReferencedElement).toHaveBeenCalledWith(entity);
    expect(shapeSettingsStateService.openShapeSettings).not.toHaveBeenCalled();
  });
});
