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

import {ConfigurationService, ElementModelService, GraphNavigatorPort, ModelSessionFacade, SearchStore} from '@ame/domain';
import {EditorFormModel, EditorService, ShapeSettingsService, ShapeSettingsStateService} from '@ame/editor';
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
    const mockElementModel = {updateElement: vi.fn()};
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
        {provide: ElementModelService, useValue: mockElementModel},
        {
          provide: ConfigurationService,
          useValue: {
            settings$: of({showEditorMap: true, toolbarVisibility: true}),
            getSettings: vi.fn(() => ({showEditorMap: true, toolbarVisibility: true})),
          },
        },
        {provide: SearchStore, useValue: {elementsSearchOpened: signal(false), filesSearchOpened: signal(false)}},
        MockProvider(GraphNavigatorPort, {isModelEmpty: signal(false), navigateToElement: vi.fn(), setScrollPosition: vi.fn()}),
        MockProvider(EditorService),
        MockProvider(ModelSessionFacade),
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
