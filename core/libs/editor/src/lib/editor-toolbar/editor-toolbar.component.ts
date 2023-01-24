/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {BindingsService, LoadingScreenOptions, NotificationsService, relations} from '@ame/shared';
import {EditorService} from '../editor.service';
import {ShapeConnectorService} from '@ame/connection';
import {FileHandlingService, GenerateHandlingService, InformationHandlingService} from './services';

@Component({
  selector: 'ame-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
})
export class EditorToolbarComponent implements AfterViewInit, OnInit, OnDestroy {
  @Output() editSelectedCell = new EventEmitter<any>();
  @Output() closeEditDialog = new EventEmitter<any>();

  public isAllShapesExpanded = true;
  public settings: Settings;
  public serializedModel: string;

  private checkChangesInterval: NodeJS.Timeout;

  private loadingScreen$: Subscription;
  private loadingScreenOptions: LoadingScreenOptions;

  get labelExpandCollapse() {
    return this.isAllShapesExpanded ? 'Collapse all' : 'Expand all';
  }

  constructor(
    private informationService: InformationHandlingService,
    private fileHandlingService: FileHandlingService,
    private generateHandlingService: GenerateHandlingService,
    public notificationsService: NotificationsService,
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private shapeConnectorService: ShapeConnectorService,
    private configurationService: ConfigurationService,
    private bindingsService: BindingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService
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
    this.fileHandlingService.openExportDialog().subscribe();
  }

  addFileToNamespace(event: any) {
    this.validateFile(this.onAddFileToNamespace.bind(this, event.target.files[0]));
  }

  onAddFileToNamespace(file: File) {
    this.loadingScreenOptions.title = 'Add file to workspace';
    this.loadingScreenOptions.hasCloseButton = true;

    this.fileHandlingService.addFileToNamespace(file);
  }

  uploadZip(event: any) {
    const file = event?.target?.files[0];

    if (!file) {
      return;
    }

    this.fileHandlingService.uploadZip(file);
    event.target.value = '';
  }

  validateFile(callback?: Function) {
    this.loadingScreenOptions.title = 'Validating';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreen$ = this.fileHandlingService
      .validateFile(this.loadingScreenOptions, callback)
      .pipe(
        finalize(() => {
          this.loadingScreen$.unsubscribe();
        })
      )
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
    if (this.isAllShapesExpanded) {
      this.mxGraphService.foldCells();
    } else {
      this.mxGraphService.expandCells();
    }
    this.isAllShapesExpanded = !this.isAllShapesExpanded;
    this.mxGraphService.formatShapes(true);
  }

  onFormat() {
    this.editorService.formatAspect();
  }

  onConnect() {
    const selectedCells = [...this.mxGraphAttributeService.graph.selectionModel.cells];

    if (selectedCells.length !== 2) {
      this.notificationsService.error({title: 'Please select only two elements to connect them'});
      return;
    }

    const firstElement = selectedCells[0].style.split(';')[0];
    const secondElement = selectedCells[1].style.split(';')[0];
    const modelElements = selectedCells.map(e => MxGraphHelper.getModelElement(e));

    if (secondElement !== firstElement && relations[secondElement].includes(firstElement)) {
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
}
