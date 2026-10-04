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

import {ConfigurationService, FilterAttributesService, FiltersService} from '@ame/domain';
import {MaxGraphService, MaxGraphShapeSelectorService, ShapeConnectorService} from '@ame/graph';
import {BindingsService, ModelFilter, NotificationsService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsService} from '../editor-dialog';
import {EditorService} from '../editor.service';
import {PrefixManagementService} from '../prefixes/prefix-management.service';
import {EditorToolbarComponent} from './editor-toolbar.component';
import {FileHandlingService} from './services';

describe('EditorToolbarComponent', () => {
  let component: EditorToolbarComponent;
  let fixture: ComponentFixture<EditorToolbarComponent>;
  let editorService: EditorService;
  let fileHandlingService: FileHandlingService;
  let shapeSettingsService: ShapeSettingsService;
  let filtersService: FiltersService;
  let activeFilter$: BehaviorSubject<ModelFilter>;
  let isModelEmpty: ReturnType<typeof signal<boolean>>;

  const filterButton = (): HTMLElement => fixture.nativeElement.querySelector('[data-testid="tbPropertyFilterButton"]');

  beforeEach(async () => {
    activeFilter$ = new BehaviorSubject<ModelFilter>(ModelFilter.DEFAULT);
    isModelEmpty = signal(false);
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
          hasSelection: signal(false),
          selectTree: vi.fn(),
        }),
        MockProvider(MatDialog),
        MockProvider(ShapeSettingsService, {
          editSelectedCell: vi.fn(),
        }),
        MockProvider(MaxGraphService, {
          isModelEmpty,
        }),
        MockProvider(FiltersService, {renderByFilter: vi.fn()}),
        {
          provide: FilterAttributesService,
          useValue: {
            get activeFilter() {
              return activeFilter$.value;
            },
            activeFilter$: activeFilter$.asObservable(),
          },
        },
        MockProvider(NotificationsService),
        MockProvider(PrefixManagementService, {openManagement: vi.fn()}),
      ],
    }).compileComponents();

    editorService = TestBed.inject(EditorService);
    fileHandlingService = TestBed.inject(FileHandlingService);
    shapeSettingsService = TestBed.inject(ShapeSettingsService);
    filtersService = TestBed.inject(FiltersService);
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

  it('should open the prefix management', () => {
    component.openPrefixManagement();
    expect(TestBed.inject(PrefixManagementService).openManagement).toHaveBeenCalled();
  });

  describe('property filter', () => {
    it('should render the property filter button enabled when a model is loaded', () => {
      expect(filterButton()).toBeTruthy();
      expect(filterButton().classList).not.toContain('disabled');
      expect(filterButton().getAttribute('aria-pressed')).toBe('false');
    });

    it('should activate the property filter when inactive', () => {
      filterButton().click();
      expect(filtersService.renderByFilter).toHaveBeenCalledWith(ModelFilter.PROPERTIES);
    });

    it('should deactivate the property filter when active', () => {
      activeFilter$.next(ModelFilter.PROPERTIES);
      fixture.detectChanges();

      expect(filterButton().classList).toContain('toolbar-item--active');
      expect(filterButton().getAttribute('aria-pressed')).toBe('true');

      filterButton().click();
      expect(filtersService.renderByFilter).toHaveBeenCalledWith(ModelFilter.DEFAULT);
    });

    it('should be disabled and not react when no model is loaded', () => {
      isModelEmpty.set(true);
      fixture.detectChanges();

      expect(filterButton().classList).toContain('disabled');
      filterButton().click();
      expect(filtersService.renderByFilter).not.toHaveBeenCalled();
    });
  });
});
