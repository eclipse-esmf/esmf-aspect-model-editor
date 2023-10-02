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

import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {finalize, first, switchMap, take} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
} from '@ame/mx-graph';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {BindingsService, LoadingScreenOptions, LoadingScreenService, NotificationsService, cellRelations} from '@ame/shared';
import {EditorService} from '../editor.service';
import {ShapeConnectorService, ShapeConnectorUtil} from '@ame/connection';
import {FileHandlingService, GenerateHandlingService, InformationHandlingService} from './services';
import {MatDialog} from '@angular/material/dialog';
import {ConnectWithDialogComponent} from '../connect-with-dialog/connect-with-dialog.component';
import {mxgraph} from 'mxgraph-factory';
import {ModelService} from '@ame/rdf/services';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {RdfModel} from '@ame/rdf/utils';
import {readFile} from '@ame/utils';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService, ModelFilter} from '@ame/loader-filters';
import {ShapeSettingsService} from '../editor-dialog';
import {BaseMetaModelElement} from '@ame/meta-model';

@Component({
  selector: 'ame-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
})
export class EditorToolbarComponent implements AfterViewInit, OnInit, OnDestroy {
  @Output() closeEditDialog = new EventEmitter<any>();

  public filtersService = inject(FiltersService);
  public filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);
  public isAllShapesExpanded = true;
  public settings: Settings;
  public serializedModel: string;
  public filterTypes = ModelFilter;

  private checkChangesInterval: NodeJS.Timeout;

  private loadingScreen$: Subscription;
  private loadingScreenOptions: LoadingScreenOptions;

  get labelExpandCollapse() {
    return this.isAllShapesExpanded ? 'Collapse all' : 'Expand all';
  }

  constructor(
    public notificationsService: NotificationsService,
    private informationService: InformationHandlingService,
    private fileHandlingService: FileHandlingService,
    private generateHandlingService: GenerateHandlingService,
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private modelService: ModelService,
    private shapeConnectorService: ShapeConnectorService,
    private configurationService: ConfigurationService,
    private bindingsService: BindingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private matDialog: MatDialog,
    private namespaceManagerService: NamespacesManagerService,
    private shapeSettingsService: ShapeSettingsService,
    private loadingScreenService: LoadingScreenService
  ) {}

  ngOnInit(): void {
    this.settings = this.configurationService.getSettings();
    this.loadingScreenOptions = {
      content: 'Please wait. Be aware that after 60 seconds a timeout will automatically cancel this operation',
    };
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

  openSettingsDialog() {
    this.informationService.openSettingsDialog();
  }

  openHelpDialog() {
    this.informationService.openHelpDialog();
  }

  openNotificationDialog() {
    this.informationService.openNotificationDialog();
  }

  openLoadNewAspectModelDialog() {
    this.loadingScreenOptions.title = 'Loading Aspect Model';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreen$ = this.fileHandlingService
      .openLoadNewAspectModelDialog(this.loadingScreenOptions)
      .pipe(
        finalize(() => {
          this.closeEditDialog.emit();
          this.loadingScreen$.unsubscribe();
        })
      )
      .subscribe();
  }

  exportAsAspectModelFile() {
    this.loadingScreenOptions.title = 'Saving Aspect Model';
    this.loadingScreenOptions.hasCloseButton = false;

    this.fileHandlingService.exportAsAspectModelFile(this.loadingScreenOptions).subscribe();
  }

  saveAspectModelToWorkspace() {
    this.fileHandlingService.saveAspectModelToWorkspace().subscribe();
  }

  copyToClipboard() {
    this.fileHandlingService.copyToClipboard();
  }

  openExportDialog() {
    this.namespaceManagerService.exportNamespaces();
  }

  addFileToNamespace(event: any): void {
    this.validateFile(() => {
      this.onAddFileToNamespace(event.target.files[0]).pipe(take(1)).subscribe();
      event.target.value = '';
    });
  }

  onAddFileToNamespace(file: File): Observable<RdfModel> {
    return readFile(file).pipe(switchMap(fileContent => this.fileHandlingService.addFileToWorkspace(file.name, fileContent)));
  }

  uploadZip(event: any) {
    const file = event?.target?.files[0];

    if (!file) {
      return;
    }

    this.namespaceManagerService.importNamespaces(file).subscribe();
    event.target.value = '';
  }

  validateFile(callback?: Function) {
    this.loadingScreenOptions.title = 'Validating';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreen$ = this.fileHandlingService
      .validateFile(this.loadingScreenOptions, callback)
      .pipe(finalize(() => this.loadingScreen$.unsubscribe()))
      .subscribe();
  }

  generateDocumentation() {
    this.validateFile(this.onGenerateDocumentation.bind(this));
  }

  onGenerateDocumentation() {
    this.loadingScreenOptions.title = 'Generate HTML Documentation';
    this.loadingScreenOptions.hasCloseButton = true;

    const subscription$ = this.generateHandlingService
      .openGenerationDocumentation(this.loadingScreenOptions)
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe();
  }

  generateJsonSample() {
    this.validateFile(this.onGenerateJsonSample.bind(this));
  }

  onGenerateJsonSample() {
    this.loadingScreenOptions.title = 'Generate JSON payload';
    this.loadingScreenOptions.hasCloseButton = true;

    const subscription$ = this.generateHandlingService
      .generateJsonSample(this.loadingScreenOptions)
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe();
  }

  generateJsonSchema() {
    this.validateFile(this.onGenerateJsonSchema.bind(this));
  }

  onGenerateJsonSchema() {
    this.loadingScreenOptions.title = 'Generate JSON Schema';
    this.loadingScreenOptions.hasCloseButton = true;

    const subscription$ = this.generateHandlingService
      .generateJsonSchema(this.loadingScreenOptions)
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe();
  }

  openGenerationOpenApiSpec() {
    this.validateFile(this.onGenerateOpenApiSpec.bind(this));
  }

  onGenerateOpenApiSpec() {
    this.loadingScreenOptions.title = 'Generate Open API specification';
    this.loadingScreenOptions.hasCloseButton = true;

    const subscription$ = this.generateHandlingService
      .openGenerationOpenApiSpec(this.loadingScreenOptions)
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe();
  }

  onDelete() {
    this.editorService.deleteSelectedElements();
  }

  onToggleExpand() {
    this.loadingScreenService
      .open({
        title: this.isAllShapesExpanded ? 'Folding...' : 'Expanding...',
        content: 'Please wait until the action is finished!',
      })
      .afterOpened()
      .pipe(switchMap(() => (this.isAllShapesExpanded ? this.mxGraphService.foldCells() : this.mxGraphService.expandCells())))
      .subscribe(() => {
        this.isAllShapesExpanded = !this.isAllShapesExpanded;
        this.mxGraphService.formatShapes(true);
        this.loadingScreenService.close();
      });
  }

  openConnectWithDialog() {
    const [selectedCell] = this.mxGraphShapeSelectorService.getSelectedCells();
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
          this.connectElements([selectedCell, result.cell]);
        }
      });
  }

  onFormat() {
    this.loadingScreenService
      .open({
        title: 'Formatting...',
        content: 'Please wait until formatting finishes',
      })
      .afterOpened()
      .subscribe(() => {
        this.editorService.formatAspect();
        this.loadingScreenService.close();
      });
  }

  onConnect() {
    const selectedCells = [...this.mxGraphAttributeService.graph.selectionModel.cells];

    if (selectedCells.length !== 2) {
      this.notificationsService.error({title: 'Please select only two elements to connect them'});
      return;
    }

    this.connectElements(selectedCells);
  }

  connectElements(selectedCells: mxgraph.mxCell[]) {
    const firstElement = selectedCells[0].style.split(';')[0];
    const secondElement = selectedCells[1].style.split(';')[0];
    const modelElements = selectedCells.map(e => MxGraphHelper.getModelElement(e));

    if (
      secondElement !== firstElement &&
      cellRelations[secondElement].includes(firstElement) &&
      !this.isConnectionException(modelElements[0], modelElements[1])
    ) {
      modelElements.reverse();
      selectedCells.reverse();
    }

    if (modelElements[0]?.isExternalReference()) {
      this.notificationsService.error({title: 'Cannot connect external reference'});
      return;
    }

    const newConnection = this.shapeConnectorService.connectShapes(modelElements[0], modelElements[1], selectedCells[0], selectedCells[1]);

    if (newConnection) {
      this.mxGraphShapeOverlayService.removeOverlaysByConnection(modelElements[0], selectedCells[0]);
      this.mxGraphAttributeService.graph.clearSelection();
    }
  }

  onToggleEditorNavigation() {
    this.settings.showEditorNav = !this.settings.showEditorNav;
    this.configurationService.setSettings(this.settings);
  }

  getTitleEditorNavigation() {
    return this.settings.showEditorNav ? 'Hide navigation' : 'Show navigation';
  }

  onToggleEditorMap() {
    this.settings.showEditorMap = !this.settings.showEditorMap;
    this.configurationService.setSettings(this.settings);
  }

  getTitleEditorMap() {
    return this.settings.showEditorMap ? 'Hide map' : 'Show map';
  }

  hasAspectElement(): boolean {
    return !!this.modelService.getLoadedAspectModel().aspect;
  }

  private isConnectionException(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return ShapeConnectorUtil.isStructuredValuePropertyConnection(parentModel, childModel);
  }
}
