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

import {ElementRef, Injectable} from '@angular/core';
import {
  AlertService,
  FileContentModel,
  LogService,
  NotificationsService,
  ProcessingError,
  SaveValidateErrorsCodes,
  SemanticError,
  SidebarService,
  SyntacticError,
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
  map,
  mergeMap,
  Observable,
  of,
  retryWhen,
  Subject,
  Subscription,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {ILastSavedModel} from './editor.types';
import {
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
import {ModelApiService, ModelValidatorService} from '@ame/api';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Title} from '@angular/platform-browser';
import mxCell = mxgraph.mxCell;

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

  public onRefreshNamespaces: Subject<void> = new Subject();
  public onRefreshSideBar$: Subject<void> = new Subject();

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
    private modelValidatorService: ModelValidatorService,
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
          if (MxGraphHelper.getModelElement(cell)) {
            const edgeParent = changedCells.find(edge => edge.isEdge() && edge.target && edge.target.id === cell.id);
            if (edgeParent) {
              const sourceElement = MxGraphHelper.getModelElement(edgeParent.source) as Base;
              if (!sourceElement.isExternalReference()) {
                sourceElement.delete(MxGraphHelper.getModelElement(cell));
              }
            }
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

  loadNewAspectModel(rdfAspectModel: string, isDefault?: boolean) {
    this.refreshSidebar();
    this.removeLastSavedRdf();
    this.notificationsService.info('Loading model', null, null, 5000);
    return this.rdfService.loadModel(rdfAspectModel).pipe(
      switchMap(rdfModel =>
        this.validateCurrentModel(rdfModel).pipe(
          tap(() => {
            this.loadModel$.next(null);
            localStorage.removeItem(ValidateStatus.validating);
            if (!isDefault) {
              this.notificationsService.info('Aspect Model loaded', null, null, 5000);
            }
          }),
          switchMap(validationResOfLoadedRdfModel => this.loadExternalModels(rdfModel).pipe(map(() => validationResOfLoadedRdfModel))),
          switchMap(validationResOfLoadedRdfModel => this.loadCurrentModel(rdfModel, rdfAspectModel, validationResOfLoadedRdfModel))
        )
      )
    );
  }

  loadExternalAspectModel(extRefAbsoluteAspectModelFileName: string): CachedFile {
    const extRdfModel = this.rdfService.externalRdfModels.find(
      extRef => extRef.getAbsoluteAspectModelFileName() === extRefAbsoluteAspectModelFileName
    );
    const fileName = extRdfModel.aspectModelFileName;
    let findCacheFile = this.namespaceCacheService.getFile([extRdfModel.getAspectModelUrn(), extRdfModel.aspectModelFileName]);
    if (!findCacheFile) {
      findCacheFile = this.namespaceCacheService.addFile(extRdfModel.getAspectModelUrn(), fileName);
    }
    return this.instantiatorService.instantiateFile(extRdfModel, findCacheFile, fileName);
  }

  private validateCurrentModel(rdfModel: RdfModel) {
    return this.getIdentifiedModelValidator(rdfModel).pipe(
      tap((validationResults: Array<any>) => {
        if (this.modelValidatorService.checkForCriticalErrors(validationResults, rdfModel)) {
          throwError(() => null);
        }
      }),
      catchError(error => {
        if (error.status === 0) {
          return of(this.notificationsService.error('Aspect Model Editor Service is Down', null, null, 10000));
        }
        return of(
          this.notificationsService.error(
            'The model is invalid. Reverting to previous Aspect Model',
            'The introduced BAMM model is invalid'
          )
        );
      })
    );
  }

  public loadExternalModels(rdfModel: RdfModel) {
    this.rdfService.externalRdfModels = [];
    return this.modelApiService.getAllNamespacesFilesContent(rdfModel).pipe(
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
      extRdfModel => extRdfModel.getAbsoluteAspectModelFileName() === aspectModelFileName
    );
    this.rdfService.externalRdfModels.splice(index, 1);
  }

  public downloadJsonSample(rdfModel: RdfModel) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.getJsonSample(serializedModel);
  }

  public downloadJsonSchema(rdfModel: RdfModel) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.getJsonSchema(serializedModel);
  }

  private loadCurrentModel(rdfModel: RdfModel, rdfAspectModel: string, validationResOfLoadedRdfModel: any) {
    return this.modelService.loadRdfModel(rdfModel, rdfAspectModel, validationResOfLoadedRdfModel).pipe(
      first(),
      tap((aspect: Aspect) => {
        this.removeOldGraph();
        this.initializeNewGraph(aspect);
        this.titleService.setTitle(`${aspect?.aspectModelUrn}.ttl - Aspect Model Editor`);
      }),
      catchError(error => {
        this.logService.logError('Error on loading aspect model', error);
        return of(this.notificationsService.error('Error on loading the aspect model', error));
      })
    );
  }

  // This validation is needed so that old models can be migrated to the new OMP format.
  private getIdentifiedModelValidator(rdfModel: RdfModel) {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.getValidationErrors(serializedModel);
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
          mxGraphSetupVisitor.visit(<DefaultAspect>aspect, null);

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
        this.notificationsService.warning('Element is already used', null, `editor/select/${aspectModelUrn}`, 2000);
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

  filterSelectedElements(selectedElements) {
    return selectedElements.filter(cell => {
      if (cell.style === 'aspect') {
        // Prevent deleting the 'Aspect' element and throw warning message
        this.notificationsService.warning('Cannot delete Aspect');
      }

      return (
        typeof cell.style !== 'number' &&
        cell.style !== 'aspect' &&
        !(cell.style && typeof cell.style === 'string' && cell.style.includes('_property'))
      );
    });
  }

  deleteAll() {
    this.mxGraphService.deleteAllShapes();
  }

  deleteSelectedElements() {
    const result = [];
    const selectedCells = this.mxGraphShapeSelectorService.getSelectedCells();

    selectedCells.forEach(cell => {
      result.push(...this.getObsoleteCells(cell));
    });

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

  // If last constraint of a trait is removed, trait has to be removed also
  private getObsoleteCells(cell: mxgraph.mxCell): mxgraph.mxCell[] {
    if (MxGraphHelper.getModelElement(cell) instanceof DefaultConstraint) {
      const traits = this.getAllSourceTraits(cell);
      // we only need to remove trait if the last trait.constraint is deleted.
      return traits.filter(trait => this.getNumberOfTargetConstraints(trait) === 1);
    }

    return [];
  }

  private getAllSourceTraits(cell: mxgraph.mxCell): mxgraph.mxCell[] {
    return cell.edges?.filter(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultTrait).map(edge => edge.source) || [];
  }

  private getNumberOfTargetConstraints(cell: mxgraph.mxCell): number {
    return cell.edges.map(edge => edge.target).filter(targetCell => MxGraphHelper.getModelElement(targetCell) instanceof DefaultConstraint)
      .length;
  }

  private deleteElements(cells: mxgraph.mxCell[]): void {
    cells.forEach((cell: mxgraph.mxCell) => {
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
              this.notificationsService.error(
                'Validation completed with errors',
                'Unfortunately the validation could not be completed. Please retry or contact support',
                null,
                5000
              );
            }
            localStorage.removeItem(ValidateStatus.validating);
          }),
          delayWhen(() => timer(this.settings.validationTimerSeconds * 1000))
        )
      )
    );
  }

  validate(): Observable<Array<SemanticError | SyntacticError | ProcessingError>> {
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
        const aspectModelFileName = this.rdfService.currentRdfModel.getAbsoluteAspectModelFileName().split(':')[2];
        const aspectModelNamespace = this.rdfService.currentRdfModel.getAspectModelUrn().replace('urn:bamm:', '').replace('#', '');

        const isNamespaceInWorkspace = namespaces.find(
          namespace => namespace.name === aspectModelNamespace && namespace.files.includes(aspectModelFileName)
        );

        localStorage.setItem('lastSavedDate', model.savedDate.getTime().toString());

        if (isNamespaceInWorkspace) {
          this.saveModel().subscribe();
          this.notificationsService.info('Aspect model was saved in workspace');
          this.logService.logInfo('Aspect model was saved in workspace');
        } else {
          this.notificationsService.info('Aspect model was saved in localStorage');
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
        this.notificationsService.info('Aspect model was saved to the local folder');
        this.logService.logInfo('Aspect model was saved to the local folder');
        this.refreshSaveModel();
        this.refreshSidebarNamespaces();
      }),
      catchError(error => {
        // TODO Should be refined
        console.groupCollapsed('editor-service -> saveModel', error);
        console.groupEnd();

        this.logService.logError('Error on saving aspect model', error);
        return of(this.notificationsService.error('Error on saving the aspect model'));
      })
    );
  }

  getSerializedModel() {
    return this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel);
  }

  openDocumentation(rdfModel: RdfModel) {
    if (!rdfModel) {
      this.notificationsService.error('Aspect model could not be found');
      return null;
    }
    const rdfAspectModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService
      .validate(rdfAspectModel)
      .pipe(
        switchMap(errors =>
          errors.length > 0
            ? of(this.notificationsService.error('Could not load Aspect model, please make sure the model is valid'))
            : this.modelApiService.openDocumentation(rdfModel, rdfAspectModel)
        )
      );
  }

  openAlertBox() {
    this.alertService.open({
      data: {
        title: 'Aspect Model is missing',
        content: 'To start modelling, please create a new or load an existing model first. After that you can add new node types',
      },
    });
  }

  refreshSidebarNamespaces() {
    this.onRefreshNamespaces.next();
  }

  refreshSidebar() {
    this.onRefreshSideBar$.next();
  }

  private saveCompleteError(error) {
    this.logService.logError(`Error occurred while saving the current model (${error})`);
    this.notificationsService.error('Saving completed with errors');
  }
}
