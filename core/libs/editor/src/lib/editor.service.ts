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

import {AsyncApi, ModelApiService, OpenApi, ViolationError} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService} from '@ame/loader-filters';
import {
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphRenderer,
  MaxGraphService,
  MaxGraphShapeOverlayService,
  MaxGraphShapeSelectorService,
  ShapeConfiguration,
  ThemeService,
} from '@ame/max-graph';
import {ElementModelService} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ConfigurationService, SammLanguageSettingsService} from '@ame/settings-dialog';
import {
  AlertService,
  ElementCreatorService,
  LoadingScreenService,
  NotificationsService,
  sammElements,
  SaveValidateErrorsCodes,
  TitleService,
  ValidateStatus,
} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {useUpdater} from '@ame/utils';
import {inject, Injectable, Injector, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {DefaultAspect, NamedElement, RdfModel} from '@esmf/aspect-model-loader';
import {Cell, EventObject, FitPlugin, gestureUtils, Graph, GraphDataModel, InternalEvent} from '@maxgraph/core';
import {environment} from 'environments/environment';
import {catchError, delayWhen, first, Observable, of, retry, Subscription, switchMap, tap, throwError, timer} from 'rxjs';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {ShapeSettingsService, ShapeSettingsStateService} from './editor-dialog';
import {ModelSaverService} from './model-saver.service';
import {ConfirmDialogEnum} from './models/confirm-dialog.enum';

@Injectable({providedIn: 'root'})
export class EditorService {
  private filtersService: FiltersService = inject(FiltersService);
  private filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);
  private configurationService: ConfigurationService = inject(ConfigurationService);
  private modelSaverService: ModelSaverService = inject(ModelSaverService);
  private maxgraphService = inject(MaxGraphService);
  private maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private notificationsService = inject(NotificationsService);
  private modelApiService = inject(ModelApiService);
  private modelService = inject(ModelService);
  private alertService = inject(AlertService);
  private rdfService = inject(RdfService);
  private sammLangService = inject(SammLanguageSettingsService);
  private confirmDialogService = inject(ConfirmDialogService);
  private elementModelService = inject(ElementModelService);
  private titleService = inject(TitleService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private loadingScreenService = inject(LoadingScreenService);
  private translate = inject(LanguageTranslationService);
  private injector = inject(Injector);
  private loadedFilesService = inject(LoadedFilesService);
  private elementCreator = inject(ElementCreatorService);
  private themeService = inject(ThemeService);

  private validateModelSubscription$: Subscription;
  public readonly isAllShapesExpanded = signal<boolean>(true);
  public readonly isAllShapesExpanded$ = toObservable(this.isAllShapesExpanded);

  private get settings() {
    return this.configurationService.getSettings();
  }

  get shapeSettingsService(): ShapeSettingsService {
    return this.injector.get(ShapeSettingsService);
  }

  get currentLoadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor() {
    if (!environment.production) {
      window['angular.editorService'] = this;
    }
  }

  initCanvas(): void {
    this.maxgraphService.initGraph();

    this.enableAutoValidation();
    this.modelSaverService.enableAutoSave();

    const container = this.maxgraphAttributeService.graph.getContainer();
    const onWheel = (evt: WheelEvent) => {
      if (!evt.defaultPrevented && evt.altKey) {
        evt.preventDefault();
        if (evt.deltaY < 0) {
          this.maxgraphAttributeService.graph.zoomIn();
        } else {
          this.maxgraphAttributeService.graph.zoomOut();
        }
      }
    };

    container.addEventListener('wheel', onWheel, {passive: false});

    // Enforce parent domain object will be updated if a cell e.g. unit will be deleted
    this.maxgraphAttributeService.graph.addListener(InternalEvent.CELLS_REMOVED, (_source: Graph, event: EventObject) => {
      if (this.filterAttributes.isFiltering) {
        return;
      }

      const changedCells: Array<Cell> = event.getProperty('cells');
      changedCells.forEach(cell => {
        if (!MaxGraphHelper.getModelElement(cell)) {
          return;
        }

        const edgeParent = changedCells.find(edge => edge.isEdge() && edge.target && edge.target.id === cell.id);
        if (!edgeParent) {
          return;
        }

        const sourceElement = MaxGraphHelper.getModelElement<NamedElement>(edgeParent.source);
        if (sourceElement && this.loadedFilesService.isElementInCurrentFile(sourceElement)) {
          useUpdater(sourceElement).delete(MaxGraphHelper.getModelElement(cell));
        }
      });
    });

    // Increase performance by not passing the event to the parent(s)
    this.maxgraphAttributeService.graph.getDataModel().addListener(InternalEvent.CHANGE, (_sender: GraphDataModel, evt: EventObject) => {
      evt.consume();
    });

    this.maxgraphAttributeService.graph.view.setTranslate(0, 0);
  }

  generateJsonSample(rdfModel: RdfModel): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSample(serializedModel, rdfModel.getSourceLocation());
  }

  generateJsonSchema(rdfModel: RdfModel, language: string): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateJsonSchema(serializedModel, language, rdfModel.getSourceLocation());
  }

  generateOpenApiSpec(rdfModel: RdfModel, openApi: OpenApi): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateOpenApiSpec(serializedModel, openApi, rdfModel.getSourceLocation()).pipe(
      catchError(err => {
        this.notificationsService.error({
          title: this.translate.language.generateOpenapiSpecDialog.resourcePathError,
          message: err.error.message,
          timeout: 5000,
        });
        return throwError(() => err.error);
      }),
    );
  }

  generateAsyncApiSpec(rdfModel: RdfModel, asyncApi: AsyncApi): Observable<string> {
    const serializedModel = this.rdfService.serializeModel(rdfModel);
    return this.modelApiService.generateAsyncApiSpec(serializedModel, asyncApi, rdfModel.getSourceLocation());
  }

  makeDraggable(element: HTMLDivElement, dragElement: HTMLDivElement) {
    const ds = gestureUtils.makeDraggable(
      element,
      this.maxgraphAttributeService.graph,
      (_graph, _evt, _cell, x, y) => {
        const elementType: string = element.dataset.type;
        const urn: string = element.dataset.urn;
        this.createElement(x, y, elementType, urn);
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
      const maxgraphRenderer = new MaxGraphRenderer(this.maxgraphService, this.maxgraphShapeOverlayService, this.sammLangService, null);

      const node = this.filtersService.createNode(newInstance);
      this.maxgraphService.setCoordinatesForNextCellRender(x, y);
      const cell = maxgraphRenderer.render(node, null);
      this.maxgraphService.formatCell(cell, true);
      if (cell) {
        this.maxgraphService.navigateToCell(cell, true);
      }
    } else {
      const element: NamedElement = this.loadedFilesService.findElementOnExtReferences(aspectModelUrn);
      if (!this.maxgraphService.resolveCellByModelElement(element)) {
        const maxgraphRenderer = new MaxGraphRenderer(this.maxgraphService, this.maxgraphShapeOverlayService, this.sammLangService, null);

        this.maxgraphService.setCoordinatesForNextCellRender(x, y);

        const filteredElements = this.filtersService.filter([element]);
        const cell = maxgraphRenderer.render(filteredElements[0], null);

        this.maxgraphService.formatCell(cell);
        if (cell) {
          this.maxgraphService.navigateToCell(cell, true);
        }
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
          this.translate.language.confirmDialog.createAspect.aspectCreationWarning,
          this.translate.language.confirmDialog.createAspect.nameReplacementNotice,
        ],
        title: this.translate.language.confirmDialog.createAspect.title,
        closeButtonText: this.translate.language.confirmDialog.createAspect.closeButton,
        okButtonText: this.translate.language.confirmDialog.createAspect.okButton,
      })
      .subscribe(confirm => {
        if (confirm === ConfirmDialogEnum.cancel) {
          return;
        }

        this.loadedFilesService.updateFileNaming(this.currentLoadedFile, {aspect: aspectInstance, name: `${aspectInstance.name}.ttl`});

        if (aspectInstance) {
          const cell = this.maxgraphService.renderModelElement(this.filtersService.createNode(aspectInstance), {
            shapeAttributes: [],
            geometry,
          });
          if (cell) {
            this.maxgraphService.navigateToCell(cell, true);
          }
        } else {
          this.openAlertBox();
        }
        this.titleService.updateTitle(this.currentLoadedFile.absoluteName);
      });
  }

  deleteSelectedElements() {
    const result: Cell[] = [];
    const selectedCells = this.maxgraphShapeSelectorService.getSelectedCells();

    result.push(...selectedCells);

    const externElements = result.filter((cell: Cell) => {
      const element = MaxGraphHelper.getModelElement(cell);
      if (!element) {
        return false;
      }
      return this.loadedFilesService.isElementExtern(element);
    });

    externElements.forEach(element => this.deletePrefixForExternalNamespaceReference(element));
    this.deleteElements(result);
  }

  private deletePrefixForExternalNamespaceReference(cell: Cell) {
    if (!cell || cell.isVertex()) {
      return;
    }

    const element = MaxGraphHelper.getModelElement(cell);
    if (!element || !element.aspectModelUrn) {
      return;
    }

    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;

    const aspectModelUrnToBeRemoved = MaxGraphHelper.getModelElement(cell).aspectModelUrn;
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

  private deleteElements(cells: Cell[]): void {
    if (this.shapeSettingsStateService.isShapeSettingOpened() && cells.includes(this.shapeSettingsStateService.selectedShapeForUpdate())) {
      this.shapeSettingsStateService.closeShapeSettings();
    }

    const vertexCells = cells.filter(cell => !cell?.isEdge?.());
    const edgeCells = cells.filter(cell => cell?.isEdge?.());

    if (vertexCells.length > 0) {
      vertexCells.forEach((cell: Cell) => {
        this.maxgraphAttributeService.graph.setCellStyles(
          'strokeColor',
          this.themeService.currentColors.border,
          this.maxgraphService.graph.getOutgoingEdges(cell, null).map(edge => edge.target),
        );
        this.elementModelService.deleteElement(cell);
      });
    } else if (edgeCells.length > 0) {
      this.elementModelService.deleteElement(edgeCells[0]);
    }
  }

  zoomIn() {
    this.loadingScreenService
      .open({
        title: this.translate.language.loadingScreenDialog.zoomInProgress,
        content: this.translate.language.loadingScreenDialog.zoomInWait,
      })
      .afterOpened()
      .subscribe(() => {
        this.maxgraphAttributeService.graph.zoomIn();
        this.loadingScreenService.close();
      });
  }

  zoomOut() {
    this.loadingScreenService
      .open({
        title: this.translate.language.loadingScreenDialog.zoomOutProgress,
        content: this.translate.language.loadingScreenDialog.zoomInWait,
      })
      .afterOpened()
      .subscribe(() => {
        this.maxgraphAttributeService.graph.zoomOut();
        this.loadingScreenService.close();
      });
  }

  fit() {
    this.loadingScreenService
      .open({
        title: this.translate.language.loadingScreenDialog.fittingProgress,
        content: this.translate.language.loadingScreenDialog.fittingWait,
      })
      .afterOpened()
      .subscribe(() => {
        this.maxgraphAttributeService.graph.getPlugin<FitPlugin>('FitPlugin').fit();
        this.loadingScreenService.close();
      });
  }

  actualSize() {
    this.loadingScreenService
      .open({
        title: this.translate.language.loadingScreenDialog.fitToViewProgress,
        content: this.translate.language.loadingScreenDialog.fittingWait,
      })
      .afterOpened()
      .subscribe(() => {
        this.maxgraphAttributeService.graph.zoomActual();
        this.loadingScreenService.close();
      });
  }

  toggleExpand() {
    const isExpanded = this.isAllShapesExpanded();
    this.loadingScreenService
      .open({
        title: isExpanded ? this.translate.language.loadingScreenDialog.folding : this.translate.language.loadingScreenDialog.expanding,
        content: this.translate.language.loadingScreenDialog.actionWait,
      })
      .afterOpened()
      .pipe(switchMap(() => (isExpanded ? this.maxgraphService.foldCells() : this.maxgraphService.expandCells())))
      .subscribe(() => {
        this.isAllShapesExpanded.set(!isExpanded);
        this.maxgraphService.formatShapes(true);
        this.loadingScreenService.close();
      });
  }

  formatModel() {
    this.loadingScreenService
      .open({
        title: this.translate.language.loadingScreenDialog.formatting,
        content: this.translate.language.loadingScreenDialog.waitFormat,
      })
      .afterOpened()
      .subscribe(() => {
        this.maxgraphService.formatShapes(true, true);
        this.loadingScreenService.close();
      });
  }

  enableAutoValidation() {
    if (this.settings.autoValidationEnabled) {
      this.startValidateModel();
    } else {
      this.stopValidateModel();
    }
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
              title: this.translate.language.notificationService.validationErrorTitle,
              message: this.translate.language.notificationService.validationErrorMessage,
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
    this.maxgraphService.resetValidationErrorOnAllShapes();

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
          ? this.modelApiService.validate(this.rdfService.serializeModel(rdfModel), rdfModel.getSourceLocation(), true)
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
        title: this.translate.language.notificationService.aspectMissingTitle,
        content: this.translate.language.notificationService.aspectMissingContent,
      },
    });
  }
}
