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
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {mxgraph} from 'mxgraph-factory';
import {ElementModelService} from '@ame/meta-model';
import {
  mxConstants,
  mxEvent,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeSelectorService,
  mxUtils,
} from '@ame/mx-graph';
import {BindingsService, LogService} from '@ame/shared';
import {EditorService, ShapeSettingsComponent} from '@ame/editor';
import {ModelService} from '@ame/rdf/services';
import {FormGroup} from '@angular/forms';

const PURPLE_BLUE = '#448ee4';
const BLACK = 'black';

@Component({
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(ShapeSettingsComponent) shapeSettingsComponent: ShapeSettingsComponent;
  @ViewChild('graph') graphElement: ElementRef<HTMLDivElement>;

  private unsubscribe: Subject<void> = new Subject();
  private selectedShapeForUpdate: mxgraph.mxCell | null;
  private shapesToHighlight: Array<mxgraph.mxCell> | null;

  public isShapeSettingOpened = false;
  public modelElement = null;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modelService: ModelService,
    private logService: LogService,
    private bindingsService: BindingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private elementModelService: ElementModelService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.MOVE_CELLS,
      mxUtils.bind(this, () => {
        this.mxGraphAttributeService.graph.resetEdgesOnMove = true;
      })
    );
    this.mxGraphAttributeService.graph.addListener(mxEvent.FOLD_CELLS, () => this.mxGraphService.formatShapes());
    this.mxGraphAttributeService.graph.addListener(mxEvent.DOUBLE_CLICK, () => this.onEditSelectedCell());
    // actions for context menu
    this.bindingsService.registerAction('editElement', () => this.onEditSelectedCell());
    this.bindingsService.registerAction('deleteElement', () => this.editorService.deleteSelectedElements());

    // actions for hotkeys
    this.editorService.bindAction(
      'deleteElement',
      mxUtils.bind(this, () => this.editorService.deleteSelectedElements())
    );

    this.graphElement.nativeElement.addEventListener('wheel', evt => {
      if (evt.altKey) {
        evt.preventDefault();
      }
    });

    this.mxGraphAttributeService.graph
      .getSelectionModel()
      .addListener(mxEvent.CHANGE, selectionModel => this.onSelectedCell(selectionModel.cells));
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap
      .pipe(
        takeUntil(this.unsubscribe),
        filter(params => !!params?.get('urn'))
      )
      .subscribe(params => {
        if (this.mxGraphService.navigateToCellByUrn(params?.get('urn'))) {
          this.onEditSelectedCell();
        } else {
          this.closeShapeSettings();
        }
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: {urn: null},
          queryParamsHandling: 'merge',
        });
      });
  }

  closeShapeSettings() {
    if (this.modelService.getLoadedAspectModel().rdfModel) {
      this.isShapeSettingOpened = false;
      this.changeDetector.detectChanges();
    }
  }

  onSave(formData: FormGroup) {
    if (this.selectedShapeForUpdate) {
      this.elementModelService.updateElement(this.selectedShapeForUpdate, formData);
    } else {
      this.logService.logInfo('Skip shape update because nothing is selected.');
    }

    this.resetSelectedShapeForUpdate();
  }

  resetSelectedShapeForUpdate() {
    this.isShapeSettingOpened = false;
    this.selectedShapeForUpdate = null;
  }

  onEditSelectedCell() {
    this.selectedShapeForUpdate = this.mxGraphShapeSelectorService.getSelectedShape();

    if (!this.selectedShapeForUpdate) {
      return;
    }

    this.isShapeSettingOpened = true;
    this.modelElement = MxGraphHelper.getModelElement(this.selectedShapeForUpdate);
    this.changeDetector.detectChanges();
  }

  onSelectedCell(cells: Array<mxgraph.mxCell>) {
    if (this.shapesToHighlight) {
      this.setCellColor(BLACK);
    }

    if (!cells.length || cells.length >= 2) {
      return;
    }

    this.shapesToHighlight = [];
    const selectedCell = cells[0];

    if (!selectedCell.isEdge()) {
      this.shapesToHighlight.push(...this.mxGraphAttributeService.graph.getOutgoingEdges(selectedCell));
      const elementShapes = this.shapesToHighlight.filter(edge => MxGraphHelper.getModelElement(edge.target)).map(edge => edge.target);
      this.shapesToHighlight.push(...elementShapes);
      this.setCellColor(PURPLE_BLUE);
    }

    this.changeDetector.detectChanges();
  }

  private setCellColor(value: string) {
    this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value, this.shapesToHighlight);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
