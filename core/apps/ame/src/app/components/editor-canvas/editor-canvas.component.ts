/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {EditorDialogModule, EditorService, EditorToolbarComponent, ShapeSettingsService, ShapeSettingsStateService} from '@ame/editor';
import {ElementModelService} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {SidebarModule} from '@ame/sidebar';
import {ElementsSearchComponent, FilesSearchComponent, SearchesStateService} from '@ame/utils';
import {CdkDrag, CdkDragEnd, CdkDragHandle} from '@angular/cdk/drag-drop';
import {AsyncPipe, CommonModule} from '@angular/common';
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {Observable, Subject, fromEvent} from 'rxjs';
import {debounceTime, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';

const SIDEBAR_MIN_WIDTH = 480;
const SIDEBAR_DEFAULT_DRAG_POSITION = {x: -SIDEBAR_MIN_WIDTH, y: 0};

@Component({
  standalone: true,
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
  imports: [
    SidebarModule,
    AsyncPipe,
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    MatIconModule,
    ElementsSearchComponent,
    FilesSearchComponent,
    EditorDialogModule,
    EditorToolbarComponent,
  ],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('graph') public graph: ElementRef;
  private unsubscribe: Subject<void> = new Subject();

  public sidebarWidth = SIDEBAR_MIN_WIDTH;
  public sidebarDragPosition = {...SIDEBAR_DEFAULT_DRAG_POSITION};
  public isShapeSettingsOpened$: Observable<boolean>;

  get isMapVisible$() {
    return this.configurationService.settings$.pipe(map(settings => settings.showEditorMap));
  }

  get isToolbarVisible$() {
    return this.configurationService.settings$.pipe(map(settings => settings.toolbarVisibility));
  }

  get selectedShapeForUpdate(): mxgraph.mxCell | null {
    return this.shapeSettingsStateService.selectedShapeForUpdate;
  }

  get modelElement(): NamedElement {
    return this.shapeSettingsService.modelElement;
  }

  get isModelEmpty(): boolean {
    return !this.mxGraphService.getAllCells()?.length;
  }

  constructor(
    private shapeSettingsService: ShapeSettingsService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private mxGraphService: MxGraphService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loadedFiles: LoadedFilesService,
    private elementModelService: ElementModelService,
    private changeDetector: ChangeDetectorRef,
    private editorService: EditorService,
    private configurationService: ConfigurationService,
    public searchesStateService: SearchesStateService,
  ) {
    this.isShapeSettingsOpened$ = this.shapeSettingsStateService.onSettingsOpened$.asObservable();
    this.isShapeSettingsOpened$.subscribe(() =>
      requestAnimationFrame(() => {
        this.changeDetector.detectChanges();
      }),
    );
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap
      .pipe(
        takeUntil(this.unsubscribe),
        map(params => params?.get('urn')),
        filter(urn => !!urn),
        tap(urn =>
          this.mxGraphService.navigateToCellByUrn(urn) ? this.shapeSettingsService.editSelectedCell() : this.closeShapeSettings(),
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
    const newWidth = this.sidebarWidth - event.distance.x;
    this.sidebarWidth = newWidth >= SIDEBAR_MIN_WIDTH ? newWidth : SIDEBAR_MIN_WIDTH;

    if (newWidth < SIDEBAR_MIN_WIDTH) {
      this.sidebarDragPosition = {...SIDEBAR_DEFAULT_DRAG_POSITION};
    } else {
      this.sidebarDragPosition = {
        x: this.sidebarDragPosition.x + event.distance.x,
        y: this.sidebarDragPosition.y,
      };
    }
  }

  closeShapeSettings() {
    if (!this.loadedFiles.currentLoadedFile?.rdfModel) {
      return;
    }

    this.shapeSettingsStateService.closeShapeSettings();
    this.changeDetector.detectChanges();
  }

  onSave(formData: FormGroup) {
    this.selectedShapeForUpdate
      ? this.elementModelService.updateElement(this.selectedShapeForUpdate, formData)
      : console.info('Skip shape update because nothing is selected.');

    this.resetSelectedShapeForUpdate();
  }

  resetSelectedShapeForUpdate() {
    this.shapeSettingsStateService.closeShapeSettings();
    this.shapeSettingsService.unselectShapeForUpdate();
  }

  watchScrollEvents(): void {
    fromEvent<Event>(this.graph.nativeElement, 'scroll')
      .pipe(
        debounceTime(250),
        tap(event => this.mxGraphService.setScrollPosition(event)),
        takeUntil(this.unsubscribe),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
