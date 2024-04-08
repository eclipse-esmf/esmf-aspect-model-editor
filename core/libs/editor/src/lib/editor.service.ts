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

import {inject, Injectable, Injector, NgZone} from '@angular/core';
import {
  AlertService,
  BrowserService,
  ElectronSignalsService,
  FileContentModel,
  LoadingScreenService,
  LogService,
  ModelSavingTrackerService,
  NotificationsService,
  sammElements,
  SaveValidateErrorsCodes,
  TitleService,
  ValidateStatus,
} from '@ame/shared';
import {environment} from 'environments/environment';
import {mxgraph} from 'mxgraph-factory';
import {
  BehaviorSubject,
  catchError,
  delay,
  delayWhen,
  filter,
  first,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  retry,
  Subscription,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {
  mxConstants,
  mxEvent,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphSetupService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
  mxUtils,
  ShapeConfiguration,
} from '@ame/mx-graph';
import {Aspect, Base, BaseMetaModelElement, DefaultAspect, ElementModelService, ModelElementNamingService} from '@ame/meta-model';
import {InstantiatorService} from '@ame/instantiator';
import {ConfigurationService, SammLanguageSettingsService} from '@ame/settings-dialog';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {ModelApiService} from '@ame/api';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {OpenApi, ViolationError} from './editor-toolbar';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService} from '@ame/loader-filters';
import {ShapeSettingsService, ShapeSettingsStateService} from './editor-dialog';
import {LargeFileWarningService} from './large-file-warning-dialog/large-file-warning-dialog.service';
import {LoadModelPayload} from './models/load-model-payload.interface';
import {LanguageTranslationService} from '@ame/translation';
import {SidebarStateService} from '@ame/sidebar';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private filtersService: FiltersService = inject(FiltersService);
  private filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);
  private configurationService: ConfigurationService = inject(ConfigurationService);

  private validateModelSubscription$: Subscription;
  private saveModelSubscription$: Subscription;

  private isAllShapesExpandedSubject = new BehaviorSubject<boolean>(true);

  public isAllShapesExpanded$ = this.isAllShapesExpandedSubject.asObservable();
  public delayedBindings: Array<any> = [];

  private get settings() {
    return this.configurationService.getSettings();
  }

  get shapeSettingsService(): ShapeSettingsService {
    return this.injector.get(ShapeSettingsService);
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
    private sammLangService: SammLanguageSettingsService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private confirmDialogService: ConfirmDialogService,
    private elementModelService: ElementModelService,
    private titleService: TitleService,
    private sidebarService: SidebarStateService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private modelSavingTracker: ModelSavingTrackerService,
    private electronSignalsService: ElectronSignalsService,
    private largeFileWarningService: LargeFileWarningService,
    private loadingScreenService: LoadingScreenService,
    private translate: LanguageTranslationService,
    private browserService: BrowserService,
    private injector: Injector,
    private ngZone: NgZone,
  ) {
    if (!environment.production) {
      window['angular.editorService'] = this;
    }
  }

  initCanvas(): void {
    this.mxGraphService.initGraph();

    this.enableAutoValidation();
    this.enableAutoSave();

    mxEvent.addMouseWheelListener(
      mxUtils.bind(this, (evt, up) => {
        this.ngZone.run(() => {
          if (!mxEvent.isConsumed(evt) && evt.altKey) {
            if (up) {
              this.mxGraphAttributeService.graph.zoomIn();
            } else {
              this.mxGraphAttributeService.graph.zoomOut();
            }
            mxEvent.consume(evt);
          }
        });
      }),
      null,
    );

    // TODO: Check this when refactoring editor service
    // enforce parent domain object will be updated if an cell e.g. unit will be deleted
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.CELLS_REMOVED,
      mxUtils.bind(this, (_source: mxgraph.mxGraph, event: mxgraph.mxEventObject) => {
        this.ngZone.run(() => {
          if (this.filterAttributes.isFiltering) {
            return;
          }

          const changedCells: Array<mxgraph.mxCell> = event.getProperty('cells');
          changedCells.forEach(cell => {
            if (!MxGraphHelper.getModelElement(cell)) {
              return;
            }

            const edgeParent = changedCells.find(edge => edge.isEdge() && edge.target && edge.target.id === cell.id);
            if (!edgeParent) {
              return;
            }

            const sourceElement = MxGraphHelper.getModelElement<Base>(edgeParent.source);
            if (sourceElement && !sourceElement?.isExternalReference()) {
              sourceElement.delete(MxGraphHelper.getModelElement(cell));
            }
          });
        });
      }),
    );

    // increase performance by not passing the event to the parent(s)
    this.mxGraphAttributeService.graph.getModel().addListener(mxEvent.CHANGE, function (sender, evt) {
      evt.consume();
    });

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

  handleFileVersionConflicts(fileName: string, fileContent: string): Observable<RdfModel> {
    const currentModel = this.rdfService.currentRdfModel;

    if (!currentModel.loadedFromWorkspace || !currentModel.isSameFile(fileName)) return of(this.rdfService.currentRdfModel);

    return this.rdfService.isSameModelContent(fileName, fileContent, currentModel).pipe(
      switchMap(isSameModelContent =>
        !isSameModelContent ? this.openReloadConfirmationDialog(currentModel.absoluteAspectModelFileName) : of(false),
      ),
      switchMap(isApprove => (isApprove ? this.loadNewAspectModel({rdfAspectModel: fileContent}) : of(null))),
      map(() => this.rdfService.currentRdfModel),
    );
  }

  openReloadConfirmationDialog(fileName: string): Observable<boolean> {
    return this.confirmDialogService.open({
      phrases: [
        `${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.VERSION_CHANGE_NOTICE} ${fileName} ${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.WORKSPACE_LOAD_NOTICE}`,
        this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.RELOAD_WARNING,
      ],
      title: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.TITLE,
      closeButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.CLOSE_BUTTON,
      okButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.OK_BUTTON,
    });
  }

  loadNewAspectModel(payload: LoadModelPayload): Observable<Array<RdfModel>> {
    this.sidebarService.workspace.refresh();
    this.notificationsService.info({title: 'Loading model', timeout: 2000});

    let rdfModel: RdfModel = null;
    return this.rdfService.loadModel(payload.rdfAspectModel, payload.namespaceFileName || '').pipe(
      tap(() => this.namespaceCacheService.removeAll()),
      tap(loadedRdfModel => (rdfModel = loadedRdfModel)),
      switchMap(() => this.loadExternalModels()),
      tap(() =>
        this.loadCurrentModel(
          rdfModel,
          payload.rdfAspectModel,
          payload.namespaceFileName || rdfModel.absoluteAspectModelFileName,
          payload.editElementUrn,
        ),
      ),
      tap(() => {
        this.modelSavingTracker.updateSavedModel();
        const [namespace, version, file] = (payload.namespaceFileName || this.rdfService.currentRdfModel.absoluteAspectModelFileName).split(
          ':',
        );

        if (this.browserService.isStartedAsElectronApp() || window.require) {
          this.electronSignalsService.call('updateWindowInfo', {
            namespace: `${namespace}:${version}`,
            fromWorkspace: payload.fromWorkspace,
            file,
          });
        }
        if (!payload.isDefault) {
          this.notificationsService.info({title: 'Aspect Model loaded', timeout: 3000});
        }
      }),
    );
  }

  loadExternalAspectModel(extRefAbsoluteAspectModelFileName: string): CachedFile {
    const extRdfModel = this.rdfService.externalRdfModels.find(
      extRef => extRef.absoluteAspectModelFileName === extRefAbsoluteAspectModelFileName,
    );
    const fileName = extRdfModel.aspectModelFileName;
    let foundCachedFile = this.namespaceCacheService.getFile([extRdfModel.getAspectModelUrn(), fileName]);
    if (!foundCachedFile) {
      foundCachedFile = this.namespaceCacheService.addFile(extRdfModel.getAspectModelUrn(), fileName);
      foundCachedFile = this.instantiatorService.instantiateFile(extRdfModel, foundCachedFile, fileName);
    }

    return foundCachedFile;
  }

  loadExternalModels(): Observable<Array<RdfModel>> {
    this.rdfService.externalRdfModels = [];
    return this.modelApiService.getAllNamespacesFilesContent().pipe(
      first(),
      mergeMap((fileContentModels: Array<FileContentModel>) =>
        fileContentModels.length
          ? forkJoin(fileContentModels.map(fileContent => this.rdfService.loadExternalReferenceModelIntoStore(fileContent)))
          : of([] as Array<RdfModel>),
      ),
      tap(extRdfModel => {
        extRdfModel.forEach(extRdfModel => this.loadExternalAspectModel(extRdfModel.absoluteAspectModelFileName));
      }),
    );
  }

  loadModels(): Observable<RdfModel[]> {
    return this.modelApiService
      .getAllNamespacesFilesContent()
      .pipe(
        mergeMap((fileContentModels: FileContentModel[]) =>
          fileContentModels.length ? this.rdfService.parseModels(fileContentModels) : of([]),
        ),
      );
  }

  removeAspectModelFileFromStore(aspectModelFileName: string) {
    const index = this.rdfService.externalRdfModels.findIndex(
      extRdfModel => extRdfModel.absoluteAspectModelFileName === aspectModelFileName,
    );
    this.rdfService.externalRdfModels.splice(index, 1);
  }

  generateJsonSample(rdfModel: RdfModel): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSample(serializedModel);
  }

  generateJsonSchema(rdfModel: RdfModel, language: string): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSchema(serializedModel, language);
  }

  generateOpenApiSpec(rdfModel: RdfModel, openApi: OpenApi): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateOpenApiSpec(serializedModel, openApi);
  }

  private loadCurrentModel(loadedRdfModel: RdfModel, rdfAspectModel: string, namespaceFileName: string, editElementUrn?: string): void {
    const [namespace, version, fileName] = namespaceFileName.split(':');
    this.namespaceCacheService.removeFile(`urn:samm:${namespace}:${version}#`, fileName);

    this.modelService
      .loadRdfModel(loadedRdfModel, rdfAspectModel, namespaceFileName)
      .pipe(
        first(),
        tap((aspect: Aspect) => {
          this.removeOldGraph();
          this.initializeNewGraph(editElementUrn);
          this.titleService.updateTitle(namespaceFileName || aspect?.aspectModelUrn, aspect ? 'Aspect' : 'Shared');
        }),
        catchError(error => {
          this.logService.logError('Error on loading aspect model', error);
          this.notificationsService.error({title: 'Error on loading the aspect model', message: error});
          // TODO: Use 'null' instead of empty object (requires thorough testing)
          return of({} as null);
        }),
      )
      .subscribe();
  }

  private removeOldGraph() {
    this.mxGraphService.deleteAllShapes();
  }

  private initializeNewGraph(editElementUrn?: string): void {
    try {
      const rdfModel = this.modelService.currentRdfModel;
      const mxGraphRenderer = new MxGraphRenderer(
        this.mxGraphService,
        this.mxGraphShapeOverlayService,
        this.namespaceCacheService,
        this.sammLangService,
        rdfModel,
      );

      const elements = this.namespaceCacheService.currentCachedFile.getAllElements();
      this.prepareGraphUpdate(mxGraphRenderer, elements, editElementUrn);
    } catch (error) {
      console.groupCollapsed('editor.service', error);
      console.groupEnd();
      throwError(() => error);
    }
  }

  private prepareGraphUpdate(mxGraphRenderer: MxGraphRenderer, elements: BaseMetaModelElement[], editElementUrn?: string): void {
    this.largeFileWarningService
      .openDialog(elements.length)
      .pipe(
        first(),
        filter(response => response !== 'cancel'),
        tap(() => this.toggleLoadingScreen()),
        delay(500), // Wait for modal animation
        switchMap(() => this.graphUpdateWorkflow(mxGraphRenderer, elements)),
      )
      .subscribe({
        next: () => this.finalizeGraphUpdate(editElementUrn),
        error: () => this.loadingScreenService.close(),
      });
  }

  private toggleLoadingScreen(): void {
    this.loadingScreenService.close();
    requestAnimationFrame(() => {
      this.loadingScreenService.open({title: this.translate.language.LOADING_SCREEN_DIALOG.MODEL_GENERATION});
    });
  }

  private graphUpdateWorkflow(mxGraphRenderer: MxGraphRenderer, elements: BaseMetaModelElement[]): Observable<boolean> {
    return this.mxGraphService.updateGraph(() => {
      this.mxGraphService.firstTimeFold = true;
      MxGraphHelper.filterMode = this.filtersService.currentFilter.filterType;
      const rootElements = elements.filter(e => !e.parents.length);
      const filtered = this.filtersService.filter(rootElements);

      for (const elementTree of filtered) {
        mxGraphRenderer.render(elementTree, null);
      }

      if (this.mxGraphAttributeService.inCollapsedMode) {
        this.mxGraphService.foldCells();
      }
    });
  }

  private finalizeGraphUpdate(editElementUrn?: string): void {
    this.mxGraphService.formatShapes(true);
    this.handleEditOrCenterView(editElementUrn);
    localStorage.removeItem(ValidateStatus.validating);
    this.loadingScreenService.close();
  }

  private handleEditOrCenterView(editElementUrn: string | null): void {
    if (editElementUrn) {
      this.shapeSettingsService.editModelByUrn(editElementUrn);
      this.mxGraphService.navigateToCellByUrn(editElementUrn);
    } else {
      this.mxGraphSetupService.centerGraph();
    }
  }

  makeDraggable(element: HTMLDivElement, dragElement: HTMLDivElement) {
    const ds = mxUtils.makeDraggable(
      element,
      this.mxGraphAttributeService.graph,
      (_graph, _evt, _cell, x, y) => {
        const elementType: string = element.dataset.type;
        const urn: string = element.dataset.urn;
        this.ngZone.run(() => this.createElement(x, y, elementType, urn));
      },
      dragElement,
    );
    ds.setGuidesEnabled(true);
  }

  createElement(x: number, y: number, elementType: string, aspectModelUrn?: string) {
    // in case of new element (no urn passed)
    if (!aspectModelUrn) {
      let newInstance = null;
      switch (elementType) {
        case 'aspect':
          if (this.modelService.loadedAspect) {
            this.notificationsService.warning({title: 'An AspectModel can contain only one Aspect element.'});
            return;
          }
          newInstance = DefaultAspect.createInstance();
          break;
        default:
          newInstance = sammElements[elementType].class.createInstance();
      }

      if (newInstance instanceof DefaultAspect) {
        this.createAspect(newInstance, {x, y});
        return;
      }

      const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(newInstance);
      metaModelElement
        ? this.mxGraphService.renderModelElement(this.filtersService.createNode(metaModelElement), {
            shapeAttributes: [],
            geometry: {x, y},
          })
        : this.openAlertBox();

      if (metaModelElement instanceof Base) {
        this.namespaceCacheService.currentCachedFile.resolveElement(metaModelElement);
      }
    } else {
      const element: BaseMetaModelElement = this.namespaceCacheService.findElementOnExtReference(aspectModelUrn);
      if (!this.mxGraphService.resolveCellByModelElement(element)) {
        const renderer = new MxGraphRenderer(
          this.mxGraphService,
          this.mxGraphShapeOverlayService,
          this.namespaceCacheService,
          this.sammLangService,
          null,
        );

        this.mxGraphService.setCoordinatesForNextCellRender(x, y);

        const filteredElements = this.filtersService.filter([element]);
        const cell = renderer.render(filteredElements[0], null);

        this.mxGraphService.formatCell(cell);
      } else {
        this.notificationsService.warning({
          title: 'Element is already used',
          link: `editor/select/${aspectModelUrn}`,
          timeout: 2000,
        });
      }
    }
  }

  private createAspect(aspectInstance: DefaultAspect, geometry: ShapeConfiguration['geometry']) {
    this.confirmDialogService
      .open({
        phrases: [
          this.translate.language.CONFIRM_DIALOG.CREATE_ASPECT.ASPECT_CREATION_WARNING,
          this.translate.language.CONFIRM_DIALOG.CREATE_ASPECT.NAME_REPLACEMENT_NOTICE,
        ],
        title: this.translate.language.CONFIRM_DIALOG.CREATE_ASPECT.TITLE,
        closeButtonText: this.translate.language.CONFIRM_DIALOG.CREATE_ASPECT.CLOSE_BUTTON,
        okButtonText: this.translate.language.CONFIRM_DIALOG.CREATE_ASPECT.OK_BUTTON,
      })
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }
        const rdfModel = this.rdfService.currentRdfModel;
        this.modelService.addAspect(aspectInstance);
        rdfModel.setAspect(aspectInstance.aspectModelUrn);
        const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(aspectInstance);
        rdfModel.absoluteAspectModelFileName = `${rdfModel.getAspectModelUrn()}${metaModelElement.name}.ttl`;

        if (!rdfModel.originalAbsoluteFileName) {
          rdfModel.originalAbsoluteFileName = `${rdfModel
            .getAspectModelUrn()
            .replace('urn:samm:', '')
            .replace('#', ':')}${metaModelElement.name}.ttl`;
        }

        metaModelElement
          ? this.mxGraphService.renderModelElement(this.filtersService.createNode(aspectInstance), {
              shapeAttributes: [],
              geometry,
            })
          : this.openAlertBox();
        this.titleService.updateTitle(rdfModel.absoluteAspectModelFileName, 'Aspect');
      });
  }

  deleteSelectedElements() {
    const result = [];
    const selectedCells = this.mxGraphShapeSelectorService.getSelectedCells();

    result.push(...selectedCells);

    this.deleteElements(result);

    if (result.some((cell: mxgraph.mxCell) => MxGraphHelper.getModelElement(cell)?.isExternalReference())) {
      result.forEach((element: any) => {
        this.deletePrefixForExternalNamespaceReference(element);
      });
    }
  }

  private deletePrefixForExternalNamespaceReference(element: any) {
    const rdfModel = this.modelService.currentRdfModel;

    const aspectModelUrnToBeRemoved = MxGraphHelper.getModelElement(element).aspectModelUrn;
    const urnToBeChecked = aspectModelUrnToBeRemoved.substring(0, aspectModelUrnToBeRemoved.indexOf('#'));

    const nodeNames = rdfModel.store.getObjects(null, null, null).map((el: any) => el.id);
    const nodesWithoutDeletedElement = nodeNames.filter(el => el !== aspectModelUrnToBeRemoved);

    // it is checked if other elements from the external namespace are in the model
    if (!nodesWithoutDeletedElement.some(el => el.includes(urnToBeChecked))) {
      const prefixes = rdfModel.getPrefixes();
      const prefixesArray = this.convertArraysToArray(Object.entries(prefixes));

      const externalPrefixToBeDeleted = prefixesArray.filter(el => el.value === `${urnToBeChecked}#`);
      if (externalPrefixToBeDeleted && externalPrefixToBeDeleted.length > 0) {
        rdfModel.removePrefix(externalPrefixToBeDeleted[0].name);
      }
    }
  }

  private convertArraysToArray(inputArray: any) {
    const resultArray = [];

    for (const pair of inputArray) {
      if (Array.isArray(pair) && pair.length === 2) {
        const [name, value] = pair;
        resultArray.push({name, value});
      }
    }
    return resultArray;
  }

  private deleteElements(cells: mxgraph.mxCell[]): void {
    if (this.shapeSettingsStateService.isShapeSettingOpened && cells.includes(this.shapeSettingsStateService.selectedShapeForUpdate)) {
      this.shapeSettingsStateService.closeShapeSettings();
    }

    cells.forEach((cell: mxgraph.mxCell) => {
      this.mxGraphAttributeService.graph.setCellStyles(
        mxConstants.STYLE_STROKECOLOR,
        'black',
        this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target),
      );
      this.elementModelService.deleteElement(cell);
    });
  }

  zoomIn() {
    this.loadingScreenService
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.ZOOM_IN_PROGRESS,
        content: this.translate.language.LOADING_SCREEN_DIALOG.ZOOM_IN_WAIT,
      })
      .afterOpened()
      .subscribe(() => {
        this.mxGraphAttributeService.graph.zoomIn();
        this.loadingScreenService.close();
      });
  }

  zoomOut() {
    this.loadingScreenService
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.ZOOM_OUT_PROGRESS,
        content: this.translate.language.LOADING_SCREEN_DIALOG.ZOOM_IN_WAIT,
      })
      .afterOpened()
      .subscribe(() => {
        this.mxGraphAttributeService.graph.zoomOut();
        this.loadingScreenService.close();
      });
  }

  fit() {
    this.loadingScreenService
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.FITTING_PROGRESS,
        content: this.translate.language.LOADING_SCREEN_DIALOG.FITTING_WAIT,
      })
      .afterOpened()
      .subscribe(() => {
        this.mxGraphAttributeService.graph.fit();
        this.loadingScreenService.close();
      });
  }

  actualSize() {
    this.loadingScreenService
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.FIT_TO_VIEW_PROGRESS,
        content: this.translate.language.LOADING_SCREEN_DIALOG.FITTING_WAIT,
      })
      .afterOpened()
      .subscribe(() => {
        this.mxGraphAttributeService.graph.zoomActual();
        this.loadingScreenService.close();
      });
  }

  toggleExpand() {
    const isExpanded = this.isAllShapesExpandedSubject.getValue();
    this.loadingScreenService
      .open({
        title: isExpanded ? this.translate.language.LOADING_SCREEN_DIALOG.FOLDING : this.translate.language.LOADING_SCREEN_DIALOG.EXPANDING,
        content: this.translate.language.LOADING_SCREEN_DIALOG.ACTION_WAIT,
      })
      .afterOpened()
      .pipe(switchMap(() => (isExpanded ? this.mxGraphService.foldCells() : this.mxGraphService.expandCells())))
      .subscribe(() => {
        this.isAllShapesExpandedSubject.next(!isExpanded);
        this.mxGraphService.formatShapes(true);
        this.loadingScreenService.close();
      });
  }

  formatModel() {
    this.loadingScreenService
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.FORMATTING,
        content: this.translate.language.LOADING_SCREEN_DIALOG.WAIT_FORMAT,
      })
      .afterOpened()
      .subscribe(() => {
        this.mxGraphService.formatShapes(true, true);
        this.loadingScreenService.close();
      });
  }

  enableAutoValidation() {
    this.settings.autoValidationEnabled ? this.startValidateModel() : this.stopValidateModel();
  }

  startValidateModel() {
    this.stopValidateModel();
    localStorage.removeItem(ValidateStatus.validating);
    this.validateModelSubscription$ = this.autoValidateModel().subscribe();
  }

  stopValidateModel() {
    localStorage.removeItem(ValidateStatus.validating);
    if (this.validateModelSubscription$) {
      this.validateModelSubscription$.unsubscribe();
    }
  }

  autoValidateModel(): Observable<ViolationError[]> {
    return of({}).pipe(
      delayWhen(() => timer(this.settings.validationTimerSeconds * 1000)),
      switchMap(() => (this.namespaceCacheService.currentCachedFile.hasCachedElements() ? this.validate().pipe(first()) : of([]))),
      tap(() => localStorage.removeItem(ValidateStatus.validating)),
      tap(() => this.enableAutoValidation()),
      retry({
        delay: error => {
          if (!Object.values(SaveValidateErrorsCodes).includes(error?.type)) {
            this.logService.logError(`Error occurred while validating the current model (${error})`);
            this.notificationsService.error({
              title: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_TITLE,
              message: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_MESSAGE,
              timeout: 5000,
            });
          }
          localStorage.removeItem(ValidateStatus.validating);

          return timer(this.settings.validationTimerSeconds * 1000);
        },
      }),
    );
  }

  validate(): Observable<Array<ViolationError>> {
    this.mxGraphService.resetValidationErrorOnAllShapes();

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(value =>
        localStorage.getItem(ValidateStatus.validating)
          ? throwError(() => ({type: SaveValidateErrorsCodes.validationInProgress}))
          : of(value),
      ),
      switchMap(() => {
        localStorage.setItem(ValidateStatus.validating, 'yes');
        const rdfModel = this.modelService.currentRdfModel;
        return rdfModel
          ? this.modelApiService.validate(this.rdfService.serializeModel(rdfModel))
          : throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
      }),
    );
  }

  enableAutoSave(): void {
    this.settings.autoSaveEnabled ? this.startSaveModel() : this.stopSaveModel();
  }

  startSaveModel(): void {
    this.stopSaveModel();
    this.saveModelSubscription$ = this.autoSaveModel().subscribe();
  }

  stopSaveModel() {
    if (this.saveModelSubscription$) {
      this.saveModelSubscription$.unsubscribe();
    }
  }

  autoSaveModel(): Observable<RdfModel | object> {
    return of({}).pipe(
      delayWhen(() => timer(this.settings.saveTimerSeconds * 1000)),
      switchMap(() =>
        this.namespaceCacheService.currentCachedFile.hasCachedElements() &&
        !this.rdfService.currentRdfModel.aspectModelFileName.includes('empty.ttl')
          ? this.saveModel().pipe(first())
          : of([]),
      ),
      tap(() => this.enableAutoSave()),
      retry({
        delay: () => timer(this.settings.saveTimerSeconds * 1000),
      }),
    );
  }

  saveModel(): Observable<RdfModel | object> {
    return this.modelService.saveModel().pipe(
      tap(() => {
        this.modelSavingTracker.updateSavedModel();
        this.notificationsService.info({title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_SUCCESS});
        this.logService.logInfo('Aspect model was saved to the local folder');
        this.sidebarService.workspace.refresh();
      }),
      catchError(error => {
        // TODO Should be refined
        console.groupCollapsed('editor-service -> saveModel', error);
        console.groupEnd();

        this.logService.logError('Error on saving aspect model', error);
        this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_ERROR});
        return of({});
      }),
    );
  }

  getSerializedModel(): string {
    return this.rdfService.serializeModel(this.modelService.currentRdfModel);
  }

  openAlertBox() {
    this.alertService.open({
      data: {
        title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_MISSING_TITLE,
        content: this.translate.language.NOTIFICATION_SERVICE.ASPECT_MISSING_CONTENT,
      },
    });
  }
}
