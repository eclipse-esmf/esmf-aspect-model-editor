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
import {MatDialog} from '@angular/material/dialog';
import {finalize, first, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {
  BindingsService,
  LoadingScreenOptions,
  LoadingScreenService,
  LogService,
  NotificationsService,
  relations,
  SaveValidateErrorsCodes,
} from '@ame/shared';
import {EditorService} from '../editor.service';
import {ShapeConnectorService} from '@ame/connection';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ModelApiService} from '@ame/api';
import {PreviewDialogComponent} from '../preview-dialog';
import {InformationService} from './services/information.service';
import {FileHandlingService} from './services/file-handling.service';

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
    private informationService: InformationService,
    private fileHandlingService: FileHandlingService,
    public notificationsService: NotificationsService,
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private matDialog: MatDialog,
    private rdfService: RdfService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private loadingScreenService: LoadingScreenService,
    private logService: LogService,
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
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }
    this.loadingScreenOptions.title = 'Saving Aspect Model';
    this.loadingScreenOptions.hasCloseButton = false;

    this.fileHandlingService.exportAsAspectModelFile(this.loadingScreenOptions).subscribe();
  }

  saveAspectModelToWorkspace() {
    this.fileHandlingService.saveAspectModelToWorkspace().subscribe();
  }

  openExportDialog() {
    this.fileHandlingService.openExportDialog().subscribe();
  }

  addFileToNamespace(event: any) {
    this.fileHandlingService.addFileToNamespace(event.target.files[0]);
  }

  uploadZip(event: any) {
    const file = event?.target?.files[0];

    if (!file) {
      return;
    }

    this.fileHandlingService.uploadZip(file);
    event.target.value = '';
  }

  generateOpenApiSpec() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }
  }

  generateDocumentation() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }

    this.loadingScreenOptions.title = 'Generate HTML Documentation';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreenService.open(this.loadingScreenOptions);
    this.loadingScreen$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(
        switchMap(() => this.editorService.openDocumentation(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
        finalize(() => this.loadingScreen$.unsubscribe())
      )
      .subscribe({next: () => this.loadingScreenService.close(), error: () => this.loadingScreenService.close()});
  }

  generateJsonSample() {
    this.onValidate(this.onGenerateJsonSample.bind(this));
  }

  onGenerateJsonSample() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }
    const subscription$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(
        switchMap(() => this.editorService.downloadJsonSample(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
        finalize(() => subscription$.unsubscribe())
      )
      .subscribe({
        next: data => {
          this.openPreview(
            'Sample JSON Payload preview',
            JSON.stringify(data, null, 2),
            `${this.modelService.getLoadedAspectModel().aspect.name}-sample.json`
          );
        },
        error: () => {
          this.notificationsService.error({title: 'Failed to generate JSON Sample', message: 'Invalid Aspect Model'});
          this.loadingScreenService.close();
        },
      });
  }

  generateJsonSchema() {
    this.onValidate(this.onGenerateJsonSchema);
  }

  onGenerateJsonSchema() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }

    const subscription$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(
        switchMap(() => this.editorService.downloadJsonSchema(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
        finalize(() => subscription$.unsubscribe())
      )
      .subscribe({
        next: data => {
          this.openPreview(
            'JSON Schema preview',
            JSON.stringify(data, null, 2),
            `${this.modelService.getLoadedAspectModel().aspect.name}-schema.json`
          );
        },
        error: () => {
          this.notificationsService.error({title: 'Failed to generate JSON Schema', message: 'Invalid Aspect Model'});
          this.loadingScreenService.close();
        },
      });
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

  onValidate(callback?: Function) {
    this.loadingScreenOptions.title = 'Validating';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreenService.open(this.loadingScreenOptions);
    this.loadingScreen$ = this.editorService
      .validate()
      .pipe(
        finalize(() => {
          this.loadingScreen$.unsubscribe();
          localStorage.removeItem('validating');
        })
      )
      .subscribe({
        next: correctableErrors => {
          this.loadingScreenService.close();
          this.logService.logInfo('Validated successfully');
          if (correctableErrors?.length === 0) {
            this.notificationsService.info({title: 'Validation completed successfully', timeout: 5000});
            callback?.call(this);
          }
        },
        error: error => {
          this.loadingScreenService.close();
          if (error?.type === SaveValidateErrorsCodes.validationInProgress) {
            this.notificationsService.error({title: 'Validation in progress'});
            return;
          }
          this.notificationsService.error({
            title: 'Validation completed with errors',
            message: 'Unfortunately the validation could not be completed. Please retry or contact support',
            timeout: 5000,
          });
          this.logService.logError(`Error occurred while validating the current model (${error})`);
        },
      });
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

  private openPreview(title: string, content: string, fileName: string) {
    const config = {
      data: {
        title: title,
        content: content,
        fileName: fileName,
      },
    };
    this.matDialog.open(PreviewDialogComponent, config);
  }
}
