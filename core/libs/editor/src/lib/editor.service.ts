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

import {ElementRef, Injectable} from '@angular/core';
import {
  AlertService,
  FileContentModel,
  LogService,
  NotificationsService,
  SaveValidateErrorsCodes,
  SidebarService,
  ValidateStatus,
} from '@ame/shared';
import {environment} from 'environments/environment';
import {mxgraph} from 'mxgraph-factory';
import {
  BehaviorSubject,
  catchError,
  delayWhen,
  first,
  forkJoin,
  mergeMap,
  Observable,
  of,
  retryWhen,
  Subscription,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {ILastSavedModel} from './editor.types';
import {
  mxConstants,
  mxEvent,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphSetupService,
  MxGraphSetupVisitor,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
  MxGraphVisitorHelper,
  mxUtils,
} from '@ame/mx-graph';
import {
  Aspect,
  Base,
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  ElementModelService,
  ModelElementNamingService,
} from '@ame/meta-model';
import {InstantiatorService} from '@ame/instantiator';
import {ConfigurationService, LanguageSettingsService} from '@ame/settings-dialog';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {ModelApiService} from '@ame/api';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Title} from '@angular/platform-browser';
import {OpenApi, ViolationError} from './editor-toolbar';
import mxCell = mxgraph.mxCell;
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private get settings() {
    return this.configurationService.getSettings();
  }

  private validateModel$ = new BehaviorSubject(this.settings.autoValidationEnabled);
  private validateModelSubscription$: Subscription;
  private saveModel$ = new BehaviorSubject(this.settings.autoSaveEnabled);
  private saveLatestModelSubscription$: Subscription;
  private lastSavedRDF$ = new BehaviorSubject<Partial<ILastSavedModel>>({});
  public loadModel$ = new BehaviorSubject(null);
  public delayedBindings: Array<any> = [];

  public get savedRdf$() {
    return this.lastSavedRDF$.asObservable();
  }

  public get currentCachedFile(): CachedFile {
    return this.namespaceCacheService.getCurrentCachedFile();
  }

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphSetupService: MxGraphSetupService,
    private notificationsService: NotificationsService,
    private modelApiService: ModelApiService,
    private logService: LogService,
    private modelService: ModelService,
    private alertService: AlertService,
    private rdfService: RdfService,
    private instantiatorService: InstantiatorService,
    private namespaceCacheService: NamespacesCacheService,
    private configurationService: ConfigurationService,
    private languageSettingsService: LanguageSettingsService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private confirmDialogService: ConfirmDialogService,
    private elementModelService: ElementModelService,
    private titleService: Title,
    private sidebarService: SidebarService
  ) {
    if (!environment.production) {
      window['angular.editorService'] = this;
    }
  }

  removeLastSavedRdf() {
    this.lastSavedRDF$.next({rdf: null, changed: true, date: null});
  }

  showLastSavedRdf(lastSavedModel: Partial<ILastSavedModel>) {
    const lastSavedDate: string = localStorage.getItem('lastSavedDate');
    this.lastSavedRDF$.next({
      ...this.lastSavedRDF$.value,
      ...lastSavedModel,
      date: lastSavedDate ? new Date(+lastSavedDate) : null,
    });
  }

  updateLastSavedRdf(changed: boolean, model: string, saveDate: Date) {
    this.lastSavedRDF$.next({
      changed: changed,
      rdf: model,
      date: saveDate,
    });
  }

  initCanvas(): void {
    this.mxGraphService.initGraph();

    this.startSaveLatestModel();
    this.startValidateModel();

    mxEvent.addMouseWheelListener(
      mxUtils.bind(this, (evt, up) => {
        if (!mxEvent.isConsumed(evt) && evt.altKey) {
          if (up) {
            this.zoomIn();
          } else {
            this.zoomOut();
          }
          mxEvent.consume(evt);
        }
      }),
      null
    );

    // TODO: Check this when refactoring editor service
    // enforce parent domain object will be updated if an cell e.g. unit will be deleted
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.CELLS_REMOVED,
      mxUtils.bind(this, (_source: mxgraph.mxGraph, event: mxgraph.mxEventObject) => {
        const changedCells: Array<mxgraph.mxCell> = event.getProperty('cells');
        changedCells.forEach(cell => {
          if (!MxGraphHelper.getModelElement(cell)) {
            return;
          }

          const edgeParent = changedCells.find(edge => edge.isEdge() && edge.target && edge.target.id === cell.id);
          if (!edgeParent) {
            return;
          }

          const sourceElement = MxGraphHelper.getModelElement(edgeParent.source) as Base;
          if (!sourceElement.isExternalReference()) {
            sourceElement.delete(MxGraphHelper.getModelElement(cell));
          }
        });
      })
    );

    this.delayedBindings.forEach(binding => this.bindAction(binding.actionname, binding.funct));
    this.delayedBindings = [];
    this.mxGraphAttributeService.graph.view.setTranslate(0, 0);
  }

  bindAction(actionName: string, callback: Function) {
    if (!this.mxGraphAttributeService.graph) {
      this.delayedBindings.push({
        actionname: actionName,
        funct: callback,
      });
      return;
    }
    this.mxGraphAttributeService.editor.addAction(actionName, callback);
  }

  removeEntityValueToEntityValueEdge(parentEntityValue: DefaultEntityValue, childEntityValue: DefaultEntityValue): void {
    const parentEntityValueCell = this.mxGraphService.resolveCellByModelElement(parentEntityValue);
    const childEntityValueCell = this.mxGraphService.resolveCellByModelElement(childEntityValue);
    const edgeToRemove = parentEntityValueCell.edges.find(edge => edge.target === childEntityValueCell);

    this.mxGraphService.removeCells([edgeToRemove]);
  }

  handleFileVersionConflicts(fileName: string, fileContent: string): Observable<RdfModel> {
    const currentModel = this.rdfService.currentRdfModel;

    if (!currentModel.loadedFromWorkspace || !currentModel.isSameFile(fileName)) return of(this.rdfService.currentRdfModel);

    return this.rdfService.isSameModelContent(fileName, fileContent, currentModel).pipe(
      switchMap(isSameModelContent =>
        !isSameModelContent ? this.openReloadConfirmationDialog(currentModel.absoluteAspectModelFileName) : of(false)
      ),
      switchMap(isApprove => (isApprove ? this.loadNewAspectModel(fileContent) : of(null))),
      map(() => this.rdfService.currentRdfModel)
    );
  }

  openReloadConfirmationDialog(fileName: string): Observable<boolean> {
    return this.confirmDialogService.open({
      phrases: [
        `A different version of ${fileName} has been loaded to a workspace.`,
        'Reloading will replace current Aspect Model with the version from a workspace, all unsaved changes will be lost. Reload?',
      ],
      title: 'Current Aspect Model changed',
      closeButtonText: 'Keep current',
      okButtonText: 'Reload',
    });
  }

  loadNewAspectModel(rdfAspectModel: string, namespaceFileName?: string, isDefault?: boolean) {
    this.sidebarService.refreshSidebar();
    this.removeLastSavedRdf();
    this.notificationsService.info({title: 'Loading model', timeout: 2000});

    return this.rdfService.loadModel(rdfAspectModel, namespaceFileName).pipe(
      switchMap(loadedRdfModel =>
        this.loadExternalModels(loadedRdfModel).pipe(
          switchMap(() =>
            this.loadCurrentModel(loadedRdfModel, rdfAspectModel, namespaceFileName || loadedRdfModel.absoluteAspectModelFileName)
          )
        )
      ),
      tap(() => {
        if (!isDefault) {
          this.notificationsService.info({title: 'Aspect Model loaded', timeout: 3000});
        }
      })
    );
  }

  loadExternalAspectModel(extRefAbsoluteAspectModelFileName: string): CachedFile {
    const extRdfModel = this.rdfService.externalRdfModels.find(
      extRef => extRef.absoluteAspectModelFileName === extRefAbsoluteAspectModelFileName
    );
    const fileName = extRdfModel.aspectModelFileName;
    let findCacheFile = this.namespaceCacheService.getFile([extRdfModel.getAspectModelUrn(), extRdfModel.aspectModelFileName]);
    if (!findCacheFile) {
      findCacheFile = this.namespaceCacheService.addFile(extRdfModel.getAspectModelUrn(), fileName);
    }
    return this.instantiatorService.instantiateFile(extRdfModel, findCacheFile, fileName);
  }

  public loadExternalModels(loadedRdfModel?: RdfModel) {
    this.rdfService.externalRdfModels = [];
    return this.modelApiService.getAllNamespacesFilesContent(loadedRdfModel).pipe(
      mergeMap((fileContentModels: Array<FileContentModel>) => {
        if (fileContentModels.length) {
          return forkJoin(fileContentModels.map(fileContent => this.rdfService.loadExternalReferenceModelIntoStore(fileContent)));
        }
        return of([]);
      })
    );
  }

  public addAspectModelFileIntoStore(aspectModelFileName: string): Observable<string> {
    return this.modelApiService
      .getAspectMetaModel(aspectModelFileName)
      .pipe(
        tap(aspectModel => this.rdfService.loadExternalReferenceModelIntoStore(new FileContentModel(aspectModelFileName, aspectModel)))
      );
  }

  public removeAspectModelFileFromStore(aspectModelFileName: string) {
    const index = this.rdfService.externalRdfModels.findIndex(
      extRdfModel => extRdfModel.absoluteAspectModelFileName === aspectModelFileName
    );
    this.rdfService.externalRdfModels.splice(index, 1);
  }

  public generateJsonSample(rdfModel: RdfModel) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSample(serializedModel);
  }

  public generateJsonSchema(rdfModel: RdfModel, language: string) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSchema(serializedModel, language);
  }

  public generateOpenApiSpec(rdfModel: RdfModel, openApi: OpenApi) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateOpenApiSpec(serializedModel, openApi);
  }

  private loadCurrentModel(loadedRdfModel: RdfModel, rdfAspectModel: string, namespaceFileName: string) {
    return this.modelService.loadRdfModel(loadedRdfModel, rdfAspectModel, namespaceFileName).pipe(
      first(),
      tap((aspect: Aspect) => {
        this.removeOldGraph();
        this.initializeNewGraph(aspect);
        this.titleService.setTitle(
          `${aspect ? '[Aspect' : '[Shared'} Model] ${namespaceFileName || aspect?.aspectModelUrn} - Aspect Model Editor`
        );
      }),
      catchError(error => {
        this.logService.logError('Error on loading aspect model', error);
        this.notificationsService.error({title: 'Error on loading the aspect model', message: error});
        return of({});
      })
    );
  }

  private removeOldGraph() {
    this.mxGraphService.deleteAllShapes();
  }

  private initializeNewGraph(aspect: Aspect) {
    try {
      const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
      const mxGraphSetupVisitor = new MxGraphSetupVisitor(
        this.mxGraphService,
        this.mxGraphShapeOverlayService,
        this.namespaceCacheService,
        this.languageSettingsService,
        rdfModel
      );

      this.mxGraphService
        .updateGraph(() => {
          this.mxGraphService.firstTimeFold = true;
          if (aspect) {
            mxGraphSetupVisitor.visit(<DefaultAspect>aspect, null);
          }

          const isolatedElements = this.namespaceCacheService.getCurrentCachedFile().getIsolatedElements();
          if (isolatedElements.size) {
            Array.from(isolatedElements.values()).forEach(isoElement => mxGraphSetupVisitor.visit(isoElement, null));
          }
        })
        .pipe(
          tap(() => {
            this.mxGraphService.formatShapes(true);
            this.mxGraphSetupService.centerGraph();
          }),
          switchMap(() => this.validate())
        )
        .subscribe(() => localStorage.removeItem(ValidateStatus.validating));
    } catch (error) {
      console.groupCollapsed('editor.service', error);
      console.groupEnd();

      throwError(() => error);
    }
  }

  makeDraggable(element: ElementRef, dragElement: ElementRef) {
    const ds = mxUtils.makeDraggable(
      element,
      this.mxGraphAttributeService.graph,
      (_graph, _evt, _cell, x, y) => {
        const elementType: string = (<any>element).attributes['element-type'];
        const urn: string = (<any>element).attributes['urn'];
        this.createElement(x, y, elementType, urn);
      },
      dragElement
    );
    ds.setGuidesEnabled(true);
  }

  createElement(x: number, y: number, elementType: string, aspectModelUrn?: string) {
    // in case of new element (no urn passed)
    if (!aspectModelUrn) {
      let newInstance = null;
      switch (elementType) {
        case 'aspect':
          if (this.modelService.getLoadedAspectModel().aspect) {
            this.notificationsService.warning({title: 'An AspectModel can contain only one Aspect element.'});
            return;
          }
          newInstance = DefaultAspect.createInstance();
          break;
        case 'property':
          newInstance = DefaultProperty.createInstance();
          break;
        case 'characteristic':
          newInstance = DefaultCharacteristic.createInstance();
          break;
        case 'constraint':
          newInstance = DefaultConstraint.createInstance();
          break;
        case 'entity':
          newInstance = DefaultEntity.createInstance();
          break;
        case 'trait':
          newInstance = DefaultTrait.createInstance();
          break;
        case 'operation':
          newInstance = DefaultOperation.createInstance();
          break;
        case 'unit':
          newInstance = DefaultUnit.createInstance();
          break;
        case 'event':
          newInstance = DefaultEvent.createInstance();
          break;
        case 'abstractentity':
          newInstance = DefaultAbstractEntity.createInstance();
          break;
        case 'abstractproperty':
          newInstance = DefaultAbstractProperty.createInstance();
          break;
        default:
          return;
      }

      if (newInstance instanceof DefaultAspect) {
        this.confirmDialogService
          .open({
            phrases: [
              'You are about to create an Aspect which will transform this Shared Model into an Aspect Model.',
              'The current name of the Model will be replaced by the name of the Aspect.',
            ],
            title: 'Create new Aspect',
            closeButtonText: 'Cancel',
            okButtonText: 'Create Aspect',
          })
          .subscribe(confirmed => {
            if (!confirmed) {
              return;
            }
            const rdfModel = this.rdfService.currentRdfModel;
            if (!rdfModel.originalAbsoluteFileName) {
              rdfModel.originalAbsoluteFileName = rdfModel.absoluteAspectModelFileName;
            }
            this.modelService.addAspect(newInstance);
            const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(newInstance);
            rdfModel.aspectModelFileName = metaModelElement.name + '.ttl';
            metaModelElement ? this.mxGraphService.renderModelElement(metaModelElement, [], x, y) : this.openAlertBox();
            this.titleService.setTitle(`[Aspect Model] ${rdfModel.absoluteAspectModelFileName} - Aspect Model Editor`);
          });
        return;
      }

      const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(newInstance);
      metaModelElement ? this.mxGraphService.renderModelElement(metaModelElement, [], x, y) : this.openAlertBox();
    } else {
      const element: BaseMetaModelElement = this.namespaceCacheService.findElementOnExtReference(aspectModelUrn);
      if (!this.mxGraphService.resolveCellByModelElement(element)) {
        this.mxGraphService.renderModelElement(
          element,
          MxGraphVisitorHelper.getElementProperties(element, this.languageSettingsService),
          x,
          y
        );
        this.renderImportedChildElements(element);
        this.mxGraphService.formatCell(this.mxGraphService.resolveCellByModelElement(element));
        this.mxGraphService.formatShapes();
      } else {
        this.notificationsService.warning({
          title: 'Element is already used',
          link: `editor/select/${aspectModelUrn}`,
          timeout: 2000,
        });
      }
    }
  }

  renderImportedChildElements(modelElement: BaseMetaModelElement) {
    if (modelElement instanceof DefaultUnit) {
      return;
    }

    const context: mxgraph.mxCell = this.mxGraphService.resolveCellByModelElement(modelElement);

    Object.values(modelElement).forEach((value: any) => {
      if (value instanceof Base) {
        const elementCell = this.mxGraphService.resolveCellByModelElement(value);

        if (elementCell) {
          this.mxGraphService.assignToParent(elementCell, context);
          return;
        }

        this.assignToContext(value, context);
        this.renderImportedChildElements(value);
        return;
      }

      if (Array.isArray(value)) {
        this.renderMetaModelElementsArray(value, context);
      }
    });
  }

  private renderMetaModelElementsArray(elements: any[], context: mxgraph.mxCell) {
    for (const entry of elements) {
      let element = entry instanceof Base ? entry : null;

      if (entry.property && entry.keys) {
        element = entry.property;
      } else if (entry.key && entry.value instanceof DefaultEntityValue) {
        element = entry.value;
      }

      if (!element) {
        continue;
      }

      const elementCell = this.mxGraphService.resolveCellByModelElement(element);
      if (elementCell) {
        this.mxGraphService.assignToParent(elementCell, context);
        continue;
      }

      this.assignToContext(element, context);
      this.renderImportedChildElements(element);
    }
  }

  private assignToContext(element: BaseMetaModelElement, context: mxCell) {
    const childCell = this.mxGraphService.renderModelElement(
      element,
      MxGraphVisitorHelper.getElementProperties(element, this.languageSettingsService)
    );
    this.mxGraphService.assignToParent(childCell, context);
  }

  deleteSelectedElements() {
    const result = [];
    const selectedCells = this.mxGraphShapeSelectorService.getSelectedCells();

    result.push(...selectedCells);

    // if the target is an ext. references it will show a display a confirmation dialog
    if (result.some((cell: mxgraph.mxCell) => MxGraphHelper.getModelElement(cell)?.isExternalReference())) {
      this.confirmDialogService
        .open({
          title: 'Delete external references',
          phrases: ['Deleting an external reference will also delete other external references that depend on it'],
        })
        .subscribe(confirmed => {
          if (confirmed) {
            this.deleteElements(result);
          }
        });
    } else {
      this.deleteElements(result);
    }
  }

  private deleteElements(cells: mxgraph.mxCell[]): void {
    cells.forEach((cell: mxgraph.mxCell) => {
      this.mxGraphAttributeService.graph.setCellStyles(
        mxConstants.STYLE_STROKECOLOR,
        'black',
        this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target)
      );
      this.elementModelService.deleteElement(cell);
    });
  }

  zoomIn() {
    this.mxGraphAttributeService.graph.zoomIn();
  }

  zoomOut() {
    this.mxGraphAttributeService.graph.zoomOut();
  }

  fit() {
    this.mxGraphAttributeService.graph.fit();
  }

  actualSize() {
    this.mxGraphAttributeService.graph.zoomActual();
  }

  foldAll() {
    this.mxGraphService.foldCells();
  }

  expandAll() {
    this.mxGraphService.expandCells();
  }

  formatAspect() {
    this.mxGraphService.formatShapes(true);
  }

  refreshValidateModel() {
    this.validateModel$.next(this.settings.autoValidationEnabled);
  }

  startValidateModel() {
    this.stopValidateModel();
    localStorage.removeItem(ValidateStatus.validating);
    if (this.settings.autoValidationEnabled) {
      this.validateModelSubscription$ = this.validateModel().subscribe();
    }
  }

  stopValidateModel() {
    localStorage.removeItem(ValidateStatus.validating);
    if (this.validateModelSubscription$) {
      this.validateModelSubscription$.unsubscribe();
    }
  }

  validateModel() {
    return this.validateModel$.asObservable().pipe(
      delayWhen(() => timer(this.settings.validationTimerSeconds * 1000)),
      switchMap(() => this.validate().pipe(first())),
      tap(() => {
        localStorage.removeItem(ValidateStatus.validating);
        this.refreshValidateModel();
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(error => {
            if (!Object.values(SaveValidateErrorsCodes).includes(error?.type)) {
              this.logService.logError(`Error occurred while validating the current model (${error})`);
              this.notificationsService.error({
                title: 'Validation completed with errors',
                message: 'Unfortunately the validation could not be completed. Please retry or contact support',
                timeout: 5000,
              });
            }
            localStorage.removeItem(ValidateStatus.validating);
          }),
          delayWhen(() => timer(this.settings.validationTimerSeconds * 1000))
        )
      )
    );
  }

  validate(): Observable<Array<ViolationError>> {
    this.mxGraphService.resetValidationErrorOnAllShapes();

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(value =>
        localStorage.getItem(ValidateStatus.validating)
          ? throwError(() => ({type: SaveValidateErrorsCodes.validationInProgress}))
          : of(value)
      ),
      switchMap(() => {
        localStorage.setItem(ValidateStatus.validating, 'yes');
        const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
        return rdfModel
          ? this.modelApiService.validate(this.rdfService.serializeModel(rdfModel))
          : throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
      })
    );
  }

  refreshSaveModel() {
    this.saveModel$.next(this.settings.autoSaveEnabled);
  }

  startSaveLatestModel() {
    this.stopValidateModel();
    if (this.settings.autoSaveEnabled) {
      this.saveLatestModelSubscription$ = this.saveLatestModel().subscribe();
    }
  }

  stopSaveLatestModel() {
    if (this.saveLatestModelSubscription$) {
      this.saveLatestModelSubscription$.unsubscribe();
    }
  }

  saveLatestModel() {
    return this.saveModel$.asObservable().pipe(
      delayWhen(() => timer(this.settings.saveTimerSeconds * 1000)),
      switchMap(() => this.modelService.saveLatestModel()),
      tap(model => {
        this.updateLastSavedRdf(false, model.serializedModel, model.savedDate);

        const namespaces = this.sidebarService.namespaces;
        const aspectModelFileName = this.rdfService.currentRdfModel.absoluteAspectModelFileName.split(':')[2];
        const aspectModelNamespace = this.rdfService.currentRdfModel.getAspectModelUrn().replace('urn:samm:', '').replace('#', '');

        const isNamespaceInWorkspace = namespaces.find(
          namespace => namespace.name === aspectModelNamespace && namespace.files.includes(aspectModelFileName)
        );

        localStorage.setItem('lastSavedDate', model.savedDate.getTime().toString());

        if (isNamespaceInWorkspace) {
          this.saveModel().subscribe();
          this.notificationsService.info({title: 'Aspect model was saved in workspace'});
          this.logService.logInfo('Aspect model was saved in workspace');
        } else {
          this.notificationsService.info({title: 'Aspect model was saved in localStorage'});
          this.logService.logInfo('Aspect model was saved in localStorage');
        }

        this.refreshSaveModel();
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(error => {
            if (!Object.values(SaveValidateErrorsCodes).includes(error?.type)) {
              this.saveCompleteError(error);
            }
          }),
          delayWhen(() => timer(this.settings.saveTimerSeconds * 1000))
        )
      )
    );
  }

  saveModel() {
    return this.modelService.saveModel().pipe(
      tap(() => {
        this.notificationsService.info({title: 'Aspect model was saved to the local folder'});
        this.logService.logInfo('Aspect model was saved to the local folder');
        this.refreshSaveModel();
        this.sidebarService.refreshSidebarNamespaces();
      }),
      catchError(error => {
        // TODO Should be refined
        console.groupCollapsed('editor-service -> saveModel', error);
        console.groupEnd();

        this.logService.logError('Error on saving aspect model', error);
        this.notificationsService.error({title: 'Error on saving the aspect model'});
        return of({});
      })
    );
  }

  getSerializedModel() {
    return this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel);
  }

  openAlertBox() {
    this.alertService.open({
      data: {
        title: 'Aspect Model is missing',
        content: 'To start modelling, please create a new or load an existing model first. After that you can add new node types',
      },
    });
  }

  private saveCompleteError(error) {
    this.logService.logError(`Error occurred while saving the current model (${error})`);
    this.notificationsService.error({title: 'Saving completed with errors'});
  }
}
