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
import {saveAs} from 'file-saver';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {catchError, finalize, first, map, switchMap} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {ConfigurationService, SettingDialogComponent, Settings} from '@ame/settings-dialog';
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
import {LoadModelDialogComponent} from '../load-model-dialog';
import {ShapeConnectorService} from '@ame/connection';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ConfirmDialogService} from '../confirm-dialog/confirm-dialog.service';
import {ModelApiService} from '@ame/api';
import {DocumentComponent, ExportWorkspaceComponent, ZipUploaderComponent} from './components';
import {NotificationsComponent} from './components/notifications/notifications.component';
import {PreviewDialogComponent} from '../preview-dialog';

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

  constructor(
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
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private confirmDialogService: ConfirmDialogService
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

  onOpenSettings() {
    this.matDialog.open(SettingDialogComponent).afterClosed();
  }

  onShowHelpDialog() {
    this.matDialog.open(DocumentComponent);
  }

  onLoadNotifications() {
    const notificationModal = this.matDialog.open(NotificationsComponent, {
      width: '60%',
      autoFocus: false,
    });
    this.keyDownEvents(notificationModal);
  }

  private keyDownEvents(matDialogRef: MatDialogRef<any>) {
    matDialogRef.keydownEvents().subscribe(keyBoardEvent => {
      // KeyCode might not be supported by electron.
      if (keyBoardEvent.code === 'Escape') {
        matDialogRef.close();
      }
    });
  }

  getLabelExpandCollapse() {
    return this.isAllShapesExpanded ? 'Collapse all' : 'Expand all';
  }

  onNew() {
    this.loadingScreenOptions.title = 'Loading Aspect Model';
    this.loadingScreenOptions.hasCloseButton = true;

    this.loadingScreen$ = this.matDialog
      .open(LoadModelDialogComponent)
      .afterClosed()
      .pipe(
        first(),
        switchMap(rdfAspectModel => {
          if (!rdfAspectModel) {
            return of(null);
          }
          this.loadingScreenService.open({...this.loadingScreenOptions, closeButtonAction: () => this.loadingScreen$.unsubscribe()});
          this.closeEditDialog.emit();
          return this.editorService.loadNewAspectModel(rdfAspectModel).pipe(
            first(),
            catchError(error => {
              this.notificationsService.error(
                'Error when loading Aspect Model. Reverting to previous Aspect Model',
                `${error}`,
                null,
                5000
              );
              return of(null);
            }),
            finalize(() => {
              this.loadingScreen$.unsubscribe();
              this.loadingScreenService.close();
            })
          );
        })
      )
      .subscribe();
  }

  onDownload() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }

    this.loadingScreenOptions.title = 'Saving Aspect Model';
    this.loadingScreenOptions.hasCloseButton = false;

    this.loadingScreenService.open(this.loadingScreenOptions);
    try {
      this.modelService.synchronizeModelToRdf().subscribe(() => {
        saveAs(
          new Blob([this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel)], {
            type: 'text/turtle;charset=utf-8',
          }),
          `${this.modelService.getLoadedAspectModel().aspect.name}.ttl`
        );
      });
    } catch (error) {
      this.logService.logError(`Error while saving the model. ${JSON.stringify(error)}.`);
    } finally {
      this.loadingScreenService.close();
    }
  }

  onSave() {
    this.modelService
      .synchronizeModelToRdf()
      .pipe(
        switchMap(() =>
          this.modelApiService.getAllNamespaces().pipe(
            first(),
            map((namespaces: string[]) => {
              const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
              if (namespaces.some(namespace => namespace === rdfModel.getAbsoluteAspectModelFileName())) {
                this.confirmDialogService
                  .open({
                    phrases: [
                      `The Aspect model "${rdfModel.getAbsoluteAspectModelFileName()}" is already defined in your file structure.`,
                      'Are you sure you want to overwrite it?',
                    ],
                    title: 'Update Aspect model',
                  })
                  .subscribe(confirmed => {
                    if (confirmed) {
                      this.editorService.saveModel().subscribe();
                    }
                  });
              } else {
                this.editorService.saveModel().subscribe();
              }
            })
          )
        )
      )
      .subscribe();
  }

  openExportModal() {
    this.matDialog.open(ExportWorkspaceComponent, {disableClose: true}).afterClosed().pipe(first()).subscribe();
  }

  onAddFileToNamespace(event: any) {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = () => {
      this.modelApiService
        .saveModel(reader.result.toString())
        .pipe(first())
        .subscribe({
          error: () => this.notificationsService.error('Error adding file to namespaces'),
          complete: () => {
            this.notificationsService.success('Successfully added file to namespaces');
            this.editorService.refreshSidebarNamespaces();
          },
        });
    };
  }

  uploadZip(event: any) {
    const file = event?.target?.files[0];
    const fileName = event?.target?.files[0]?.name;

    if (!file) {
      return;
    }

    this.matDialog.open(ZipUploaderComponent, {data: {file, name: fileName}, disableClose: true});
    event.target.value = '';
  }

  onPrint() {
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
          this.notificationsService.error('Failed to generate JSON Sample', 'Invalid Aspect Model');
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
          this.notificationsService.error('Failed to generate JSON Schema', 'Invalid Aspect Model');
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
      this.notificationsService.error('Please select only two elements to connect them');
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
      this.notificationsService.error('Cannot connect external reference');
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
            this.notificationsService.info('Validation completed successfully', null, null, 5000);
            callback?.call(this);
          }
        },
        error: error => {
          this.loadingScreenService.close();
          if (error?.type === SaveValidateErrorsCodes.validationInProgress) {
            this.notificationsService.error('Validation in progress');
            return;
          }
          this.notificationsService.error(
            'Validation completed with errors',
            'Unfortunately the validation could not be completed. Please retry or contact support',
            null,
            5000
          );
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
