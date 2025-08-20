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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService} from '@ame/loader-filters';
import {ElementModelService, ModelElementNamingService} from '@ame/meta-model';
import {
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
  ShapeConfiguration,
  mxConstants,
  mxEvent,
  mxUtils,
} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ConfigurationService, SammLanguageSettingsService} from '@ame/settings-dialog';
import {
  AlertService,
  ElementCreatorService,
  LoadingScreenService,
  NotificationsService,
  SaveValidateErrorsCodes,
  TitleService,
  ValidateStatus,
  sammElements,
} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {useUpdater} from '@ame/utils';
import {Injectable, Injector, NgZone, inject} from '@angular/core';
import {DefaultAspect, NamedElement, RdfModel} from '@esmf/aspect-model-loader';
import {environment} from 'environments/environment';
import {mxgraph} from 'mxgraph-factory';
import {BehaviorSubject, Observable, Subscription, catchError, delayWhen, first, of, retry, switchMap, tap, throwError, timer} from 'rxjs';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {ShapeSettingsService, ShapeSettingsStateService} from './editor-dialog';
import {AsyncApi, OpenApi, ViolationError} from './editor-toolbar';
import {ModelSaverService} from './model-saver.service';
import {ConfirmDialogEnum} from './models/confirm-dialog.enum';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private filtersService: FiltersService = inject(FiltersService);
  private filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);
  private configurationService: ConfigurationService = inject(ConfigurationService);
  private modelSaverService: ModelSaverService = inject(ModelSaverService);

  private validateModelSubscription$: Subscription;
  private isAllShapesExpandedSubject = new BehaviorSubject<boolean>(true);

  public isAllShapesExpanded$ = this.isAllShapesExpandedSubject.asObservable();
  public delayedBindings: Array<any> = [];

  private get settings() {
    return this.configurationService.getSettings();
  }

  get shapeSettingsService(): ShapeSettingsService {
    return this.injector.get(ShapeSettingsService);
  }

  get currentLoadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private notificationsService: NotificationsService,
    private modelApiService: ModelApiService,
    private modelService: ModelService,
    private alertService: AlertService,
    private rdfService: RdfService,
    private sammLangService: SammLanguageSettingsService,
    private modelElementNamingService: ModelElementNamingService,
    private confirmDialogService: ConfirmDialogService,
    private elementModelService: ElementModelService,
    private titleService: TitleService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private loadingScreenService: LoadingScreenService,
    private translate: LanguageTranslationService,
    private injector: Injector,
    private ngZone: NgZone,
    private loadedFilesService: LoadedFilesService,
    private elementCreator: ElementCreatorService,
  ) {
    if (!environment.production) {
      window['angular.editorService'] = this;
    }
  }

  initCanvas(): void {
    this.mxGraphService.initGraph();

    this.enableAutoValidation();
    this.modelSaverService.enableAutoSave();

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

            const sourceElement = MxGraphHelper.getModelElement<NamedElement>(edgeParent.source);
            if (sourceElement && this.loadedFilesService.isElementInCurrentFile(sourceElement)) {
              useUpdater(sourceElement).delete(MxGraphHelper.getModelElement(cell));
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
    return this.modelApiService.generateOpenApiSpec(serializedModel, openApi).pipe(
      catchError(err => {
        this.notificationsService.error({
          title: this.translate.language.GENERATE_OPENAPI_SPEC_DIALOG.RESOURCE_PATH_ERROR,
          message: err.error.message,
          timeout: 5000,
        });
        return throwError(() => err.error);
      }),
    );
  }

  generateAsyncApiSpec(rdfModel: RdfModel, asyncApi: AsyncApi): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateAsyncApiSpec(serializedModel, asyncApi);
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
          if (this.currentLoadedFile.aspect) {
            this.notificationsService.warning({title: 'An AspectModel can contain only one Aspect element.'});
            return;
          }
          newInstance = this.elementCreator.createEmptyElement(DefaultAspect);
          break;
        default:
          newInstance = this.elementCreator.createEmptyElement(sammElements[elementType].class, {
            isAbstract: elementType.includes('abstract'),
          });
      }

      if (newInstance instanceof DefaultAspect) {
        this.createAspect(newInstance, {x, y});
        return;
      }
      const renderer = new MxGraphRenderer(this.mxGraphService, this.mxGraphShapeOverlayService, this.sammLangService, null);

      const node = this.filtersService.createNode(newInstance);
      this.mxGraphService.setCoordinatesForNextCellRender(x, y);
      const cell = renderer.render(node, null);
      this.mxGraphService.formatCell(cell, true);
    } else {
      const element: NamedElement = this.loadedFilesService.findElementOnExtReferences(aspectModelUrn);
      if (!this.mxGraphService.resolveCellByModelElement(element)) {
        const renderer = new MxGraphRenderer(this.mxGraphService, this.mxGraphShapeOverlayService, this.sammLangService, null);

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
      .subscribe(confirm => {
        if (confirm === ConfirmDialogEnum.cancel) {
          return;
        }

        this.loadedFilesService.updateFileNaming(this.currentLoadedFile, {aspect: aspectInstance, name: `${aspectInstance.name}.ttl`});

        aspectInstance
          ? this.mxGraphService.renderModelElement(this.filtersService.createNode(aspectInstance), {
              shapeAttributes: [],
              geometry,
            })
          : this.openAlertBox();
        this.titleService.updateTitle(this.currentLoadedFile.absoluteName);
      });
  }

  deleteSelectedElements() {
    const result: mxgraph.mxCell[] = [];
    const selectedCells = this.mxGraphShapeSelectorService.getSelectedCells();

    result.push(...selectedCells);

    const externElements = result.filter((cell: mxgraph.mxCell) => {
      const element = MxGraphHelper.getModelElement(cell);
      if (!element) {
        return false;
      }
      return this.loadedFilesService.isElementExtern(element);
    });

    externElements.forEach(element => this.deletePrefixForExternalNamespaceReference(element));
    this.deleteElements(result);
  }

  private deletePrefixForExternalNamespaceReference(cell: mxgraph.mxCell) {
    if (!cell || cell.isVertex()) {
      return;
    }

    const element = MxGraphHelper.getModelElement(cell);
    if (!element || !element.aspectModelUrn) {
      return;
    }

    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;

    const aspectModelUrnToBeRemoved = MxGraphHelper.getModelElement(cell).aspectModelUrn;
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
      switchMap(() => (this.currentLoadedFile.cachedFile.getKeys().length ? this.validate().pipe(first()) : of([]))),
      tap(() => localStorage.removeItem(ValidateStatus.validating)),
      tap(() => this.enableAutoValidation()),
      retry({
        delay: error => {
          if (!Object.values(SaveValidateErrorsCodes).includes(error?.type)) {
            console.error(`Error occurred while validating the current model (${error})`);
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
        const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;
        return rdfModel
          ? this.modelApiService.validate(this.rdfService.serializeModel(rdfModel))
          : throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
      }),
    );
  }

  getSerializedModel(): string {
    return this.rdfService.serializeModel(this.loadedFilesService.currentLoadedFile?.rdfModel);
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
