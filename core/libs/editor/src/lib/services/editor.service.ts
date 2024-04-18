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

import {inject, Injectable, NgZone} from '@angular/core';
import {AlertService, LoadingScreenService, NotificationsService, sammElements, TitleService} from '@ame/shared';
import {environment} from 'environments/environment';
import {mxgraph} from 'mxgraph-factory';
import {BehaviorSubject, switchMap} from 'rxjs';
import {
  mxConstants,
  mxEvent,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
  mxUtils,
  ShapeConfiguration,
} from '@ame/mx-graph';
import {Base, BaseMetaModelElement, DefaultAspect, ElementModelService, ModelElementNamingService} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NamespacesCacheService} from '@ame/cache';
import {ModelService, RdfService} from '@ame/rdf/services';
import {FILTER_ATTRIBUTES, FilterAttributesService, FiltersService} from '@ame/loader-filters';
import {LanguageTranslationService} from '@ame/translation';
import {ShapeSettingsStateService} from '../editor-dialog';
import {ConfirmDialogService} from '../confirm-dialog';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';
import {EditorUtils} from './editor-utils';
import {SaveService} from './save.service';
import {ValidateService} from './validate.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private filtersService: FiltersService = inject(FiltersService);
  private filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);

  private isAllShapesExpandedSubject = new BehaviorSubject<boolean>(true);

  public isAllShapesExpanded$ = this.isAllShapesExpandedSubject.asObservable();
  public delayedBindings: Array<any> = [];

  constructor(
    private mxGraphService: MxGraphService,
    private notificationsService: NotificationsService,
    private modelService: ModelService,
    private alertService: AlertService,
    private rdfService: RdfService,
    private saveService: SaveService,
    private validateService: ValidateService,
    private namespaceCacheService: NamespacesCacheService,
    private sammLangService: SammLanguageSettingsService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private confirmDialogService: ConfirmDialogService,
    private elementModelService: ElementModelService,
    private titleService: TitleService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private loadingScreenService: LoadingScreenService,
    private translate: LanguageTranslationService,
    private ngZone: NgZone,
  ) {
    if (!environment.production) {
      window['angular.editorService'] = this;
    }
  }

  initCanvas(): void {
    this.mxGraphService.initGraph();

    this.validateService.enableAutoValidation();
    this.saveService.enableAutoSave();

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

  removeAspectModelFileFromStore(aspectModelFileName: string) {
    const index = this.rdfService.externalRdfModels.findIndex(
      extRdfModel => extRdfModel.absoluteAspectModelFileName === aspectModelFileName,
    );
    this.rdfService.externalRdfModels.splice(index, 1);
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
      .subscribe(confirm => {
        if (confirm === ConfirmDialogEnum.cancel) {
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
      const prefixesArray = EditorUtils.convertArraysToArray(Object.entries(prefixes));

      const externalPrefixToBeDeleted = prefixesArray.filter(el => el.value === `${urnToBeChecked}#`);
      if (externalPrefixToBeDeleted && externalPrefixToBeDeleted.length > 0) {
        rdfModel.removePrefix(externalPrefixToBeDeleted[0].name);
      }
    }
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
