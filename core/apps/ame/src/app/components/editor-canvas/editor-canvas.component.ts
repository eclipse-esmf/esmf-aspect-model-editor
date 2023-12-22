/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {fromEvent, Observable, Subject} from 'rxjs';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement, ElementModelService} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {LogService} from '@ame/shared';
import {ShapeSettingsService, ShapeSettingsStateService} from '@ame/editor';
import {ModelService} from '@ame/rdf/services';
import {FormGroup} from '@angular/forms';
import {CdkDragEnd} from '@angular/cdk/drag-drop';

const SIDEBAR_MIN_WIDTH = 480;
const SIDEBAR_DEFAULT_DRAG_POSITION = {x: -SIDEBAR_MIN_WIDTH, y: 0};

@Component({
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('graph') graph: ElementRef;
  private unsubscribe: Subject<void> = new Subject();

  sidebarWidth = SIDEBAR_MIN_WIDTH;
  sidebarDragPosition = {...SIDEBAR_DEFAULT_DRAG_POSITION};
  isShapeSettingsOpened$: Observable<boolean>;

  get selectedShapeForUpdate(): mxgraph.mxCell | null {
    return this.shapeSettingsStateService.selectedShapeForUpdate;
  }

  get modelElement(): BaseMetaModelElement {
    return this.shapeSettingsService.modelElement;
  }

  constructor(
    private shapeSettingsService: ShapeSettingsService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private mxGraphService: MxGraphService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modelService: ModelService,
    private logService: LogService,
    private elementModelService: ElementModelService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.isShapeSettingsOpened$ = this.shapeSettingsStateService.onSettingsOpened$.asObservable();
    this.isShapeSettingsOpened$.subscribe(() =>
      requestAnimationFrame(() => {
        this.changeDetector.detectChanges();
      })
    );
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap
      .pipe(
        takeUntil(this.unsubscribe),
        map(params => params?.get('urn')),
        filter(urn => !!urn),
        tap(urn =>
          this.mxGraphService.navigateToCellByUrn(urn) ? this.shapeSettingsService.editSelectedCell() : this.closeShapeSettings()
        ),
        switchMap(() =>
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {urn: null},
            queryParamsHandling: 'merge',
          })
        )
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.shapeSettingsService.setGraphListeners();
    this.shapeSettingsService.setContextMenuActions();
    this.shapeSettingsService.setHotKeysActions();

    this.watchScrollEvents();
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
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }

    this.shapeSettingsStateService.closeShapeSettings();
    this.changeDetector.detectChanges();
  }

  onSave(formData: FormGroup) {
    this.selectedShapeForUpdate
      ? this.elementModelService.updateElement(this.selectedShapeForUpdate, formData)
      : this.logService.logInfo('Skip shape update because nothing is selected.');

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
        takeUntil(this.unsubscribe)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
