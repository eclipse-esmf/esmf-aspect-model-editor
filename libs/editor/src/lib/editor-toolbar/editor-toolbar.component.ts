/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {saveAs} from 'file-saver';
import {BciSidebarService, LoadingScreenOptions, LoadingScreenService, ModalWindowService} from '@bci-web-core/core';
import {MatDialog} from '@angular/material/dialog';
import {catchError, filter, finalize, first, map, switchMap} from 'rxjs/operators';
import {Observable, of, Subscription} from 'rxjs';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@bame/mx-graph';
import {ConfigurationService, Settings} from '@bame/settings-dialog';
import {BindingsService, LogService, NotificationsService, relations, SaveValidateErrorsCodes} from '@bame/shared';
import {EditorService} from '../editor.service';
import {LoadModelDialogComponent} from '../load-model-dialog';
import {ShapeConnectorService} from '@bame/connection';
import {ModelService, RdfService} from '@bame/rdf/services';
import {ConfirmDialogService} from '../confirm-dialog/confirm-dialog.service';
import {ModelApiService} from '@bame/api';
import {ExportWorkspaceComponent, ZipUploaderComponent} from './components';

@Component({
  selector: 'bci-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
})
export class EditorToolbarComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() public isSidebarOpened = false;

  @Output() toggleHideSidebar = new EventEmitter<any>();
  @Output() editSelectedCell = new EventEmitter<any>();
  @Output() closeEditDialog = new EventEmitter<any>();

  public isAllShapesExpanded = true;
  public settings: Settings;
  public serializedModel: string;
  public savedModel$ = this.editorService.savedRdf$;

  private checkChangesInterval: NodeJS.Timeout;

  private loadingScreen$: Subscription;
  private loadingScreenClosed: Observable<boolean>;
  private loadingScreenOptions: LoadingScreenOptions;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private matDialog: MatDialog,
    private rdfService: RdfService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private loadingScreenService: LoadingScreenService,
    private logService: LogService,
    private modalWindowService: ModalWindowService,
    private shapeConnectorService: ShapeConnectorService,
    private notificationsService: NotificationsService,
    private configurationService: ConfigurationService,
    private bindingsService: BindingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private sidebarService: BciSidebarService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.settings = this.configurationService.getSettings();
    this.loadingScreenOptions = {} as LoadingScreenOptions;
    this.loadingScreenOptions.initialStatus =
      'Please wait. Be aware that after 60 seconds a timeout will automatically cancel this operation ';
    this.loadingScreenClosed = this.loadingScreenService.closed.pipe(
      filter(isClosed => !!isClosed),
      first()
    );
  }

  ngAfterViewInit(): void {
    this.bindingsService.registerAction('connectElements', () => this.onConnect());
    this.bindingsService.registerAction('format', () => this.onFormat());
  }

  ngOnDestroy() {
    clearInterval(this.checkChangesInterval);
  }

  onToggleHideSidebar() {
    this.sidebarService.setSidebarState(this.isSidebarOpened);
    this.toggleHideSidebar.emit();
  }

  getLabelExpandCollapse() {
    return this.isAllShapesExpanded ? 'Collapse all' : 'Expand all';
  }

  onNew() {
    this.loadingScreenOptions.title = 'Loading Aspect Model';
    this.loadingScreenOptions.closeable = true;

    this.loadingScreenClosed.subscribe(() => this.loadingScreen$.unsubscribe());

    this.loadingScreen$ = this.modalWindowService
      .openDialogWithComponent(LoadModelDialogComponent, {width: '55%', height: '86%'}, this.matDialog)
      .afterClosed()
      .pipe(
        first(),
        switchMap(rdfAspectModel => {
          if (!rdfAspectModel) {
            return of(null);
          }
          this.loadingScreenService.show(this.loadingScreenOptions);
          this.closeEditDialog.emit();
          return this.editorService.loadNewAspectModel(rdfAspectModel).pipe(
            first(),
            catchError(error =>
              of(
                this.notificationsService.error(
                  'Error when loading Aspect Model. Reverting to previous Aspect Model',
                  `${error}`,
                  null,
                  5000
                )
              )
            ),
            finalize(() => this.loadingScreenService.close())
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
    this.loadingScreenOptions.closeable = false;

    this.loadingScreenService.show(this.loadingScreenOptions);
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
    this.modalWindowService.openDialogWithComponent(ExportWorkspaceComponent, {disableClose: true}).afterClosed().pipe(first()).subscribe();
  }

  onAddFileToNamespace(event: any) {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = () => {
      console.log(reader.result.toString());
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
    const filePath = event?.target?.files[0]?.path;
    const fileName = event?.target?.files[0]?.name;

    if (!filePath) {
      return;
    }

    this.modalWindowService.openDialogWithComponent(ZipUploaderComponent, {data: {path: filePath, name: fileName}, disableClose: true});
    event.target.value = '';
  }

  onPrint() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return;
    }

    this.loadingScreenOptions.title = 'Generate HTML Documentation';
    this.loadingScreenOptions.closeable = true;

    this.loadingScreenClosed.subscribe(() => this.loadingScreen$.unsubscribe());

    this.loadingScreenService.show(this.loadingScreenOptions);
    this.loadingScreen$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(switchMap(() => this.editorService.openDocumentation(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())))
      .subscribe({next: () => this.loadingScreenService.close(), error: () => this.loadingScreenService.close()});
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
    this.mxGraphService.formatShapes();
  }

  onFormat() {
    this.editorService.formatAspect();
  }

  onConnect() {
    const selectedCells = Object.assign([], this.mxGraphAttributeService.graph.selectionModel.cells);

    if (selectedCells.length !== 2) {
      this.notificationsService.error('Please select only two elements to connect them');
      return;
    }

    const firstElement = selectedCells[0].style.split(';')[0];
    const secondElement = selectedCells[1].style.split(';')[0];
    const modelElements = selectedCells.map(e => MxGraphHelper.getModelElement(e));

    if (relations[secondElement].includes(firstElement)) {
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

  onValidate() {
    this.loadingScreenOptions.title = 'Validating';
    this.loadingScreenOptions.closeable = true;

    this.loadingScreenClosed.subscribe(() => {
      this.loadingScreen$.unsubscribe();
      localStorage.removeItem('validating');
    });

    this.loadingScreenService.show(this.loadingScreenOptions);
    this.loadingScreen$ = this.editorService.validate().subscribe(
      correctableErrors => {
        this.loadingScreenService.close();
        this.logService.logInfo('Validated successfully');
        if (correctableErrors?.length === 0) {
          this.notificationsService.info('Validation completed successfully', null, null, 5000);
        }
      },
      error => {
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
      }
    );
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
