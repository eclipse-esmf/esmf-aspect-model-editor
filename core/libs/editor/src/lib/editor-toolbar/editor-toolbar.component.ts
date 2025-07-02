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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {MxGraphService, MxGraphShapeSelectorService} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {BindingsService, NotificationsService} from '@ame/shared';
import {LanguageTranslateModule} from '@ame/translation';
import {AsyncPipe, CommonModule} from '@angular/common';
import {AfterViewInit, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {BarItemComponent} from '../../../../shared/src/lib/components/bar-item/bar-item.component';
import {ConnectWithDialogComponent} from '../connect-with-dialog/connect-with-dialog.component';
import {ShapeSettingsService} from '../editor-dialog';
import {EditorService} from '../editor.service';
import {FileHandlingService} from './services';

@Component({
  standalone: true,
  selector: 'ame-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
  imports: [BarItemComponent, CommonModule, MatTooltipModule, LanguageTranslateModule, MatIconModule, AsyncPipe],
})
export class EditorToolbarComponent implements AfterViewInit, OnInit, OnDestroy {
  public filtersService = inject(FiltersService);
  public isAllShapesExpanded$: Observable<boolean>;
  public settings$: Observable<Settings>;

  public get isModelEmpty() {
    return !this.mxGraphService.getAllCells()?.length;
  }

  public get selectedCells() {
    return this.mxGraphShapeSelectorService.getSelectedCells();
  }

  private checkChangesInterval: NodeJS.Timeout;

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
}
