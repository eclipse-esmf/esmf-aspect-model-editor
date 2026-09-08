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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphService, MaxGraphShapeSelectorService} from '@ame/max-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {BindingsService, NotificationsService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsService} from '../editor-dialog';
import {EditorService} from '../editor.service';
import {EditorToolbarComponent} from './editor-toolbar.component';
import {FileHandlingService} from './services';

describe('EditorToolbarComponent', () => {
  let component: EditorToolbarComponent;
  let fixture: ComponentFixture<EditorToolbarComponent>;
  let editorService: EditorService;
  let fileHandlingService: FileHandlingService;
  let shapeSettingsService: ShapeSettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditorToolbarComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(FileHandlingService, {
          onValidateFile: vi.fn(),
          copyToClipboard: vi.fn(() => of(null as any)),
        }),
        MockProvider(EditorService, {
          isAllShapesExpanded: signal(true),
          isAllShapesExpanded$: of(true),
          deleteSelectedElements: vi.fn(),
          toggleExpand: vi.fn(),
          formatModel: vi.fn(),
          zoomIn: vi.fn(),
          zoomOut: vi.fn(),
        }),
        MockProvider(ShapeConnectorService, {
          connectSelectedElements: vi.fn(),
        }),
        MockProvider(ConfigurationService, {
          settings$: of({} as any),
        }),
        MockProvider(BindingsService, {
          registerAction: vi.fn(),
        }),
        MockProvider(MaxGraphShapeSelectorService, {
          selectedCells: signal([]),
          selectTree: vi.fn(),
        }),
        MockProvider(MatDialog),
        MockProvider(ShapeSettingsService, {
          editSelectedCell: vi.fn(),
        }),
        MockProvider(MaxGraphService, {
          isModelEmpty: signal(false),
        }),
        MockProvider(NotificationsService),
        MockProvider(FiltersService),
      ],
    }).compileComponents();

    editorService = TestBed.inject(EditorService);
    fileHandlingService = TestBed.inject(FileHandlingService);
    shapeSettingsService = TestBed.inject(ShapeSettingsService);
    fixture = TestBed.createComponent(EditorToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDelete should call editorService.deleteSelectedElements', () => {
    component.onDelete();
    expect(editorService.deleteSelectedElements).toHaveBeenCalled();
  });

  it('onToggleExpand should call editorService.toggleExpand', () => {
    component.onToggleExpand();
    expect(editorService.toggleExpand).toHaveBeenCalled();
  });

  it('onFormat should call editorService.formatModel', () => {
    component.onFormat();
    expect(editorService.formatModel).toHaveBeenCalled();
  });

  it('editSelectedCell should call shapeSettingsService.editSelectedCell', () => {
    component.editSelectedCell();
    expect(shapeSettingsService.editSelectedCell).toHaveBeenCalled();
  });

  it('validateFile should call fileHandlingService.onValidateFile', () => {
    component.validateFile();
    expect(fileHandlingService.onValidateFile).toHaveBeenCalled();
  });
});
