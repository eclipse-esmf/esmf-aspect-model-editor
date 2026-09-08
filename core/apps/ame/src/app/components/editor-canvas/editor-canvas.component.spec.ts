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
import {EditorFormModel, EditorService, ShapeSettingsService, ShapeSettingsStateService} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {ElementModelService} from '@ame/meta-model';
import {ConfigurationService} from '@ame/settings-dialog';
import {SearchesStateService} from '@ame/utils';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {Cell} from '@maxgraph/core';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorCanvasComponent} from './editor-canvas.component';

describe('EditorCanvasComponent Signal Forms save contract', () => {
  let component: EditorCanvasComponent;
  let state: ShapeSettingsStateService;
  let shapeSettings: ShapeSettingsService;
  let elementModel: ElementModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditorCanvasComponent],
      providers: [
        MockProvider(ShapeSettingsService, {
          unselectShapeForUpdate: vi.fn(),
          modelElement: signal(null),
        }),
        {
          provide: ShapeSettingsStateService,
          useValue: {
            onSettingsOpened$: of(true),
            isShapeSettingOpened: signal(true),
            selectedShapeForUpdate: signal<Cell | null>(null),
            closeShapeSettings: vi.fn(),
          } as unknown as ShapeSettingsStateService,
        },
        MockProvider(ElementModelService, {updateElement: vi.fn()}),
        {
          provide: ConfigurationService,
          useValue: {
            settings$: of({showEditorMap: true, toolbarVisibility: true}),
            getSettings: vi.fn(() => ({showEditorMap: true, toolbarVisibility: true})),
          } as unknown as ConfigurationService,
        },
        {
          provide: SearchesStateService,
          useValue: {
            elementsSearch: {opened$: of(false)},
            filesSearch: {opened$: of(false)},
          } as unknown as SearchesStateService,
        },
        MockProvider(MaxGraphService, {getAllCells: vi.fn(() => []), isModelEmpty: signal(false)}),
        MockProvider(EditorService),
        MockProvider(LoadedFilesService),
        MockProvider(Router),
        MockProvider(ActivatedRoute, {queryParamMap: of(null)}),
      ],
    }).overrideComponent(EditorCanvasComponent, {set: {template: '', imports: []}});

    component = TestBed.createComponent(EditorCanvasComponent).componentInstance;
    state = TestBed.inject(ShapeSettingsStateService);
    shapeSettings = TestBed.inject(ShapeSettingsService);
    elementModel = TestBed.inject(ElementModelService);
  });

  it('forwards the emitted Signal Forms value object to the selected shape', () => {
    const selectedShape = {} as Cell;
    const formValue: EditorFormModel = {changedMetaModel: null, name: 'Updated'};
    Object.defineProperty(state, 'selectedShapeForUpdate', {value: signal(selectedShape), configurable: true});

    component.onShapeSettingsSave(formValue);

    expect(elementModel.updateElement).toHaveBeenCalledWith(selectedShape, formValue);
    expect(state.closeShapeSettings).toHaveBeenCalled();
    expect(shapeSettings.unselectShapeForUpdate).toHaveBeenCalled();
  });

  it('does not update an element when no shape is selected', () => {
    Object.defineProperty(state, 'selectedShapeForUpdate', {value: signal(null), configurable: true});

    component.onShapeSettingsSave({changedMetaModel: null});

    expect(elementModel.updateElement).not.toHaveBeenCalled();
    expect(state.closeShapeSettings).toHaveBeenCalled();
    expect(shapeSettings.unselectShapeForUpdate).toHaveBeenCalled();
  });
});
