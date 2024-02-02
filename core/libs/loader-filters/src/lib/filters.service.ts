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

import {Inject, Injectable, Injector} from '@angular/core';
import {DefaultFilter} from './filters/default-filter';
import {PropertiesFilterLoader} from './filters/properties-filter';
import {FilterLoader, ModelFilter, ModelTree, ModelTreeOptions} from './models';
import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphAttributeService, MxGraphHelper, MxGraphRenderer, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {NamespacesCacheService} from '@ame/cache';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService} from '@ame/shared';
import {FILTER_ATTRIBUTES, FilterAttributesService} from './active-filter.session';
import {switchMap} from 'rxjs';
import {EditorService} from '@ame/editor';
import {LanguageTranslationService} from '@ame/translation';

export type Filters = {
  default: FilterLoader;
  properties: FilterLoader;
};

export type FilteredTrees = {
  default: ModelTree<BaseMetaModelElement>[];
  properties: ModelTree<BaseMetaModelElement>[];
};

@Injectable({providedIn: 'root'})
export class FiltersService {
  private filtersMethods = {
    [ModelFilter.DEFAULT]: () => this.selectDefaultFilter(),
    [ModelFilter.PROPERTIES]: () => this.selectPropertiesFilter(),
  };
  public filteredTree: Partial<FilteredTrees> = {};
  // TODO: To check why is behaving weirdly with BaseMetaModel instead of any
  public currentFilter: FilterLoader<any>;

  constructor(
    private injector: Injector,
    private loadingScreen: LoadingScreenService,
    private translate: LanguageTranslationService,
    @Inject(FILTER_ATTRIBUTES) private filterAttributesService: FilterAttributesService
  ) {
    window['_filter'] = this;
    this.selectDefaultFilter();
  }

  selectDefaultFilter() {
    this.currentFilter = new DefaultFilter();
    this.filterAttributesService.activeFilter = ModelFilter.DEFAULT;
  }

  selectPropertiesFilter() {
    this.currentFilter = new PropertiesFilterLoader(this.injector);
    this.filterAttributesService.activeFilter = ModelFilter.PROPERTIES;
  }

  filter(elements: BaseMetaModelElement[]): ModelTree<BaseMetaModelElement>[] {
    this.filteredTree[this.filterAttributesService.activeFilter] = this.currentFilter.filter(elements);
    this.currentFilter.cache = {};
    return this.filteredTree[this.filterAttributesService.activeFilter];
  }

  createNode<T extends BaseMetaModelElement = BaseMetaModelElement>(element: T, options?: ModelTreeOptions): ModelTree<T> {
    const node = this.updateNodeInfo<T>({element, filterType: this.currentFilter.filterType}, options);
    return this.updateNodeTree<T>(node, options);
  }

  updateNodeInfo<T extends BaseMetaModelElement = BaseMetaModelElement>(node: ModelTree<T>, options?: ModelTreeOptions): ModelTree<T> {
    node.fromParentArrow = options?.parent ? this.currentFilter.getArrowStyle(node.element, options.parent) : null;
    node.shape = {...this.currentFilter.getShapeGeometry(node.element), mxGraphStyle: this.currentFilter.getMxGraphStyle(node.element)};
    node.filterType = this.currentFilter.filterType;
    return node;
  }

  updateNodeTree<T extends BaseMetaModelElement = BaseMetaModelElement>(node: ModelTree<T>, options?: ModelTreeOptions): ModelTree<T> {
    return this.currentFilter.generateTree(node.element, options);
  }

  renderByFilter(filter: ModelFilter) {
    const mxGraphService = this.injector.get(MxGraphService);
    const editorService = this.injector.get(EditorService);
    let selectedCell = mxGraphService.graph.selectionModel.cells?.[0];
    const selectedModelElement = selectedCell && MxGraphHelper.getModelElement(selectedCell);

    this.loadingScreen
      .open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.FILTER_CHANGE,
        content: this.translate.language.LOADING_SCREEN_DIALOG.FILTER_WAIT,
      })
      .afterOpened()
      .pipe(
        switchMap(() => {
          MxGraphHelper.filterMode = filter;
          this.filterAttributesService.isFiltering = true;
          this.filtersMethods[filter]?.();
          const namespaceCacheService = this.injector.get(NamespacesCacheService);
          const mxGraphSetupVisitor = new MxGraphRenderer(
            mxGraphService,
            this.injector.get(MxGraphShapeOverlayService),
            namespaceCacheService,
            this.injector.get(SammLanguageSettingsService),
            this.injector.get(ModelService).getLoadedAspectModel().rdfModel
          );

          const currentFile = namespaceCacheService.currentCachedFile;
          const rootElements = currentFile.getAllElements().filter(e => e.parents.length <= 0);
          const filteredElements = this.filter(rootElements);

          mxGraphService.deleteAllShapes();

          return mxGraphService.updateGraph(() => {
            for (const elementTree of filteredElements) {
              mxGraphSetupVisitor.render(elementTree, null);
            }
            this.injector.get(MxGraphAttributeService).inCollapsedMode && mxGraphService.foldCells();
          });
        }),
        switchMap(() => {
          mxGraphService.formatShapes(true);
          this.filterAttributesService.isFiltering = false;
          selectedCell = selectedModelElement && mxGraphService.resolveCellByModelElement(selectedModelElement);
          if (selectedCell) mxGraphService.navigateToCellByUrn(selectedModelElement.aspectModelUrn);

          return editorService.validate();
        })
      )
      .subscribe(() => {
        localStorage.removeItem('validating');
        this.loadingScreen.close();
      });
  }
}
