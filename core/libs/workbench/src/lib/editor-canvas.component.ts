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

import {ConfigurationService, GraphNavigatorPort, ModelSessionFacade, SearchStore} from '@ame/domain';
import {
  AspectModelTextViewComponent,
  EditorFormModel,
  EditorService,
  EditorTabBarComponent,
  EditorToolbarComponent,
  EditorViewModeService,
  ShapeSettingsComponent,
  ShapeSettingsService,
  ShapeSettingsStateService,
} from '@ame/editor';
import {ElementsSearchComponent, FilesSearchComponent} from '@ame/search';
import {ResizeGutterComponent} from '@ame/shared';
import {SidebarComponent} from '@ame/sidebar';
import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, OnInit, signal, untracked, viewChild} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {fromEvent} from 'rxjs';
import {debounceTime, filter, map, switchMap, tap} from 'rxjs/operators';

export const EDIT_VIEW_MIN_WIDTH = 480;
export const EDIT_VIEW_WIDTH_STORAGE_KEY = 'ame.editView.width';

@Component({
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
  imports: [
    CommonModule,
    ResizeGutterComponent,
    MatIconModule,
    ElementsSearchComponent,
    FilesSearchComponent,
    EditorToolbarComponent,
    EditorTabBarComponent,
    SidebarComponent,
    ShapeSettingsComponent,
    AspectModelTextViewComponent,
    TranslocoDirective,
  ],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit {
  public readonly graph = viewChild<ElementRef>('graph');

  private destroyRef = inject(DestroyRef);
  private shapeSettingsService = inject(ShapeSettingsService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private graphNavigator = inject(GraphNavigatorPort);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private loadedFiles = inject(ModelSessionFacade);
  private editorService = inject(EditorService);
  private configurationService = inject(ConfigurationService);
  private searchStore = inject(SearchStore);
  protected readonly viewMode = inject(EditorViewModeService);

  public readonly sidebarWidth = signal<number | null>(EDIT_VIEW_MIN_WIDTH);
  protected readonly editViewMinWidth = EDIT_VIEW_MIN_WIDTH;
  protected readonly editViewWidthStorageKey = EDIT_VIEW_WIDTH_STORAGE_KEY;

  public readonly isMapVisible = toSignal(this.configurationService.settings$.pipe(map(settings => settings.showEditorMap)), {
    initialValue: this.configurationService.getSettings()?.showEditorMap ?? true,
  });

  public readonly isToolbarVisible = toSignal(this.configurationService.settings$.pipe(map(settings => settings.toolbarVisibility)), {
    initialValue: this.configurationService.getSettings()?.toolbarVisibility ?? true,
  });

  public readonly isShapeSettingsOpened = this.shapeSettingsStateService.isShapeSettingOpened;

  public readonly isElementsSearchOpened = this.searchStore.elementsSearchOpened;
  public readonly isFilesSearchOpened = this.searchStore.filesSearchOpened;
  public readonly isModelEmpty = this.graphNavigator.isModelEmpty;
  public readonly isTextView = this.viewMode.isTextView;

  constructor() {
    // Element settings are edited in the graph, so opening them leaves the text view.
    effect(() => {
      if (this.isShapeSettingsOpened() && untracked(this.isTextView)) {
        untracked(() => this.viewMode.setMode('graph'));
      }
    });
  }

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
        tap(urn => this.navigateToElement(urn)),
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

  private navigateToElement(urn: string): void {
    if (this.isTextView()) {
      this.viewMode.revealElement(urn);
      return;
    }

    if (this.graphNavigator.navigateToElement(urn)) {
      this.shapeSettingsService.editSelectedCell();
    } else {
      this.closeShapeSettings();
    }
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

  closeShapeSettings() {
    if (!this.loadedFiles.currentLoadedFile?.rdfModel) {
      return;
    }

    this.shapeSettingsStateService.closeShapeSettings();
  }

  onShapeSettingsSave(formData: EditorFormModel) {
    if (this.selectedShapeForUpdate) {
      this.editorService.updateElement(this.selectedShapeForUpdate, formData);
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
        tap(event => this.graphNavigator.setScrollPosition(event)),
      )
      .subscribe();
  }
}
