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
import {
  EditorFormModel,
  EditorService,
  EditorToolbarComponent,
  ShapeSettingsComponent,
  ShapeSettingsService,
  ShapeSettingsStateService,
} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {ElementModelService} from '@ame/meta-model';
import {ConfigurationService} from '@ame/settings-dialog';
import {SidebarComponent} from '@ame/sidebar';
import {ElementsSearchComponent, FilesSearchComponent, SearchesStateService} from '@ame/utils';
import {CdkDrag, CdkDragEnd, CdkDragHandle} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {fromEvent} from 'rxjs';
import {debounceTime, filter, map, switchMap, tap} from 'rxjs/operators';

const SIDEBAR_MIN_WIDTH = 480;
const SIDEBAR_DEFAULT_DRAG_POSITION = {x: -SIDEBAR_MIN_WIDTH, y: 0};

@Component({
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    MatIconModule,
    ElementsSearchComponent,
    FilesSearchComponent,
    EditorToolbarComponent,
    SidebarComponent,
    ShapeSettingsComponent,
    TranslocoDirective,
  ],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit {
  public readonly graph = viewChild<ElementRef>('graph');

  private destroyRef = inject(DestroyRef);
  private shapeSettingsService = inject(ShapeSettingsService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private maxgraphService = inject(MaxGraphService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private loadedFiles = inject(LoadedFilesService);
  private elementModelService = inject(ElementModelService);
  private editorService = inject(EditorService);
  private configurationService = inject(ConfigurationService);
  private searchesStateService = inject(SearchesStateService);

  public readonly sidebarWidth = signal(SIDEBAR_MIN_WIDTH);
  public readonly sidebarDragPosition = signal({...SIDEBAR_DEFAULT_DRAG_POSITION});

  public readonly isMapVisible = toSignal(this.configurationService.settings$.pipe(map(settings => settings.showEditorMap)), {
    initialValue: this.configurationService.getSettings()?.showEditorMap ?? true,
  });

  public readonly isToolbarVisible = toSignal(this.configurationService.settings$.pipe(map(settings => settings.toolbarVisibility)), {
    initialValue: this.configurationService.getSettings()?.toolbarVisibility ?? true,
  });

  public readonly isShapeSettingsOpened = this.shapeSettingsStateService.isShapeSettingOpened;

  public readonly isElementsSearchOpened = toSignal(this.searchesStateService.elementsSearch.opened$, {initialValue: false});
  public readonly isFilesSearchOpened = toSignal(this.searchesStateService.filesSearch.opened$, {initialValue: false});
  public readonly isModelEmpty = this.maxgraphService.isModelEmpty;

  get selectedShapeForUpdate(): Cell | null {
    return this.shapeSettingsStateService.selectedShapeForUpdate();
  }

  get modelElement(): NamedElement {
    return this.shapeSettingsService.modelElement();
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(params => params?.get('urn')),
        filter(urn => !!urn),
        tap(urn =>
          this.maxgraphService.navigateToCellByUrn(urn) ? this.shapeSettingsService.editSelectedCell() : this.closeShapeSettings(),
        ),
        switchMap(() =>
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {urn: null},
            queryParamsHandling: 'merge',
          }),
        ),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.editorService.initCanvas();
    this.shapeSettingsService.setGraphListeners();
    this.shapeSettingsService.setContextMenuActions();
    this.shapeSettingsService.setHotKeysActions();

    this.watchScrollEvents();
  }

  toggleMap() {
    this.configurationService.toggleEditorMap();
  }

  toggleToolbar() {
    this.configurationService.toggleToolbar();
  }

  onDragEnded(event: CdkDragEnd): void {
    const newWidth = this.sidebarWidth() - event.distance.x;

    if (newWidth < SIDEBAR_MIN_WIDTH) {
      this.sidebarWidth.set(SIDEBAR_MIN_WIDTH);
      this.sidebarDragPosition.set({...SIDEBAR_DEFAULT_DRAG_POSITION});
    } else {
      this.sidebarWidth.set(newWidth);
      this.sidebarDragPosition.update(position => ({
        x: position.x + event.distance.x,
        y: position.y,
      }));
    }
  }

  closeShapeSettings() {
    if (!this.loadedFiles.currentLoadedFile?.rdfModel) {
      return;
    }

    this.shapeSettingsStateService.closeShapeSettings();
  }

  onShapeSettingsSave(formData: EditorFormModel) {
    if (this.selectedShapeForUpdate) {
      this.elementModelService.updateElement(this.selectedShapeForUpdate, formData);
    } else {
      console.info('Skip shape update because nothing is selected.');
    }

    this.resetSelectedShapeForUpdate();
  }

  resetSelectedShapeForUpdate() {
    this.shapeSettingsStateService.closeShapeSettings();
    this.shapeSettingsService.unselectShapeForUpdate();
  }

  watchScrollEvents(): void {
    fromEvent<Event>(this.graph().nativeElement, 'scroll')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(250),
        tap(event => this.maxgraphService.setScrollPosition(event)),
      )
      .subscribe();
  }
}
