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

import {AfterViewInit, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {first} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MxGraphShapeSelectorService, MxGraphService} from '@ame/mx-graph';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {BindingsService, ElectronSignals, ElectronSignalsService, NotificationsService} from '@ame/shared';
import {EditorService} from '../services';
import {ShapeConnectorService} from '@ame/connection';
import {FileHandlingService} from './services';
import {MatDialog} from '@angular/material/dialog';
import {ConnectWithDialogComponent} from '../connect-with-dialog';
import {ModelService} from '@ame/rdf/services';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService, ModelFilter} from '@ame/loader-filters';
import {ShapeSettingsService} from '../editor-dialog';

@Component({
  selector: 'ame-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
})
export class EditorToolbarComponent implements AfterViewInit, OnInit, OnDestroy {
  public filtersService = inject(FiltersService);
  public filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);
  public isAllShapesExpanded$: Observable<boolean>;
  public settings$: Observable<Settings>;
  public serializedModel: string;
  public filterTypes = ModelFilter;
  public get isModelEmpty() {
    return !this.mxGraphService.getAllCells()?.length;
  }

  public get selectedCells() {
    return this.mxGraphShapeSelectorService.getSelectedCells();
  }

  private checkChangesInterval: NodeJS.Timeout;
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    public notificationsService: NotificationsService,
    private fileHandlingService: FileHandlingService,
    private editorService: EditorService,
    private modelService: ModelService,
    private shapeConnectorService: ShapeConnectorService,
    private configurationService: ConfigurationService,
    private bindingsService: BindingsService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private matDialog: MatDialog,
    private shapeSettingsService: ShapeSettingsService,
    private mxGraphService: MxGraphService,
  ) {}

  ngOnInit(): void {
    this.settings$ = this.configurationService.settings$;
    this.isAllShapesExpanded$ = this.editorService.isAllShapesExpanded$;
  }

  ngAfterViewInit(): void {
    this.bindingsService.registerAction('connectElements', () => this.onConnect());
    this.bindingsService.registerAction('format', () => this.onFormat());
    this.bindingsService.registerAction('copy-to-clipboard', () => this.fileHandlingService.copyToClipboard());
    this.bindingsService.registerAction('connect-with', () => this.openConnectWithDialog());
    this.bindingsService.registerAction('select-tree', () => this.mxGraphShapeSelectorService.selectTree());
  }

  ngOnDestroy() {
    clearInterval(this.checkChangesInterval);
  }

  // Deactivates the bug where the shape can not be removed
  blurActiveButton() {
    requestAnimationFrame(() => {
      if (document.activeElement.tagName.toLowerCase() === 'button') {
        (document.activeElement as HTMLButtonElement).blur();
      }
    });
  }

  editSelectedCell() {
    this.shapeSettingsService.editSelectedCell();
  }

  validateFile() {
    this.fileHandlingService.onValidateFile();
  }

  onDelete() {
    this.editorService.deleteSelectedElements();
  }

  onToggleExpand() {
    this.editorService.toggleExpand();
  }

  openConnectWithDialog() {
    const [selectedCell] = this.selectedCells;
    if (!selectedCell) {
      this.notificationsService.error({
        title: 'No element selected',
        message: 'An element needs to be selected to be connected',
      });
    }

    this.matDialog
      .open(ConnectWithDialogComponent, {data: selectedCell})
      .afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.shapeConnectorService.connectSelectedElements([selectedCell, result.cell]);
        }
      });
  }

  onFormat() {
    this.editorService.formatModel();
  }

  onConnect() {
    this.shapeConnectorService.connectSelectedElements();
  }

  zoomIn() {
    this.editorService.zoomIn();
  }

  zoomOut() {
    this.editorService.zoomOut();
  }

  hasAspectElement(): boolean {
    return !!this.modelService.loadedAspect;
  }
}
