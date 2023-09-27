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

import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement, ElementModelService} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {LogService} from '@ame/shared';
import {ShapeSettingsService, ShapeSettingsStateService} from '@ame/editor';
import {ModelService} from '@ame/rdf/services';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'ame-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  private get selectedShapeForUpdate(): mxgraph.mxCell | null {
    return this.shapeSettingsStateService.selectedShapeForUpdate;
  }

  public get isShapeSettingOpened() {
    return this.shapeSettingsStateService.isShapeSettingOpened;
  }

  public get modelElement(): BaseMetaModelElement {
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
    this.shapeSettingsStateService.onSettingsOpened$.subscribe(() =>
      requestAnimationFrame(() => {
        this.changeDetector.detectChanges();
      })
    );
  }

  ngAfterViewInit(): void {
    this.shapeSettingsService.setGraphListeners();
    this.shapeSettingsService.setContextMenuActions();
    this.shapeSettingsService.setHotKeysActions();
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap
      .pipe(
        takeUntil(this.unsubscribe),
        filter(params => !!params?.get('urn'))
      )
      .subscribe(params => {
        if (this.mxGraphService.navigateToCellByUrn(params?.get('urn'))) {
          this.shapeSettingsService.editSelectedCell();
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
      this.shapeSettingsStateService.closeShapeSettings();
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
    this.shapeSettingsStateService.closeShapeSettings();
    this.shapeSettingsService.unselectShapeForUpdate();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
