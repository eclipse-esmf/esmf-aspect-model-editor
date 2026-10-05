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

import {FilterAttributesService, FiltersService} from '@ame/domain';
import {MaxGraphService, MaxGraphShapeSelectorService, ShapeConnectorService} from '@ame/graph';
import {BarItemComponent, BindingsService, ModelFilter, NotificationsService} from '@ame/shared';
import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, computed, DestroyRef, inject, OnDestroy} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {first} from 'rxjs/operators';
import {ConnectWithDialogComponent} from '../connect-with-dialog/connect-with-dialog.component';
import {ShapeSettingsService} from '../editor-dialog/services/shape-settings.service';
import {EditorService} from '../editor.service';
import {ModelHistoryService} from '../history/model-history.service';
import {PrefixManagementService} from '../prefixes/prefix-management.service';
import {EditorViewModeService} from '../text-view/editor-view-mode.service';
import {FileHandlingService} from './services';

@Component({
  selector: 'ame-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
  imports: [BarItemComponent, CommonModule, MatTooltipModule, TranslocoDirective, MatIconModule],
})
export class EditorToolbarComponent implements AfterViewInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private fileHandlingService = inject(FileHandlingService);
  private editorService = inject(EditorService);
  private shapeConnectorService = inject(ShapeConnectorService);
  private bindingsService = inject(BindingsService);
  private maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private matDialog = inject(MatDialog);
  private shapeSettingsService = inject(ShapeSettingsService);
  private maxgraphService = inject(MaxGraphService);
  private prefixManagementService = inject(PrefixManagementService);
  private filtersService = inject(FiltersService);
  private filterAttributesService = inject(FilterAttributesService);
  private modelHistory = inject(ModelHistoryService);

  public notificationsService = inject(NotificationsService);

  public isAllShapesExpanded = this.editorService.isAllShapesExpanded;

  protected isModelEmpty = this.maxgraphService.isModelEmpty;
  protected selectedCells = this.maxgraphShapeSelectorService.selectedCells;
  protected hasSelection = this.maxgraphShapeSelectorService.hasSelection;
  protected isTextView = inject(EditorViewModeService).isTextView;
  protected canUndo = this.modelHistory.canUndo;
  protected canRedo = this.modelHistory.canRedo;
  protected readonly activeFilter = toSignal(this.filterAttributesService.activeFilter$, {
    initialValue: this.filterAttributesService.activeFilter,
  });
  protected readonly isPropertyFilterActive = computed(() => this.activeFilter() === ModelFilter.PROPERTIES);

  private checkChangesInterval: NodeJS.Timeout;

  ngAfterViewInit(): void {
    this.bindingsService.registerAction('connectElements', () => this.onConnect());
    this.bindingsService.registerAction('format', () => this.onFormat());
    this.bindingsService.registerAction('copy-to-clipboard', () => this.fileHandlingService.onCopyToClipboard());
    this.bindingsService.registerAction('connect-with', () => this.openConnectWithDialog());
    this.bindingsService.registerAction('select-tree', () => this.maxgraphShapeSelectorService.selectTree());
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

  openPrefixManagement() {
    this.prefixManagementService.openManagement();
  }

  togglePropertyFilter() {
    this.filtersService.renderByFilter(this.isPropertyFilterActive() ? ModelFilter.DEFAULT : ModelFilter.PROPERTIES);
  }

  editSelectedCell() {
    this.shapeSettingsService.editSelectedCell();
  }

  validateFile() {
    this.fileHandlingService.onValidateFile();
  }

  onUndo() {
    this.modelHistory.undo();
  }

  onRedo() {
    this.modelHistory.redo();
  }

  onDelete() {
    this.editorService.deleteSelectedElements();
  }

  onToggleExpand() {
    this.editorService.toggleExpand();
  }

  openConnectWithDialog() {
    const [selectedCell] = this.selectedCells();
    if (!selectedCell) {
      this.notificationsService.error({
        title: 'No element selected',
        message: 'An element needs to be selected to be connected',
      });
    }

    this.matDialog
      .open(ConnectWithDialogComponent, {data: selectedCell})
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef), first())
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
