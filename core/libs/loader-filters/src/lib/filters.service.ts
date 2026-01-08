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

import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MxGraphAttributeService, MxGraphHelper, MxGraphRenderer, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {switchMap} from 'rxjs';
import {FILTER_ATTRIBUTES} from './active-filter.session';
import {DefaultFilter} from './filters/default-filter';
import {PropertiesFilterLoader} from './filters/properties-filter';
import {FilterLoader, ModelFilter, ModelTree, ModelTreeOptions} from './models';

export type Filters = {
  default: FilterLoader;
  properties: FilterLoader;
};

export type FilteredTrees = {
  default: ModelTree<NamedElement>[];
  properties: ModelTree<NamedElement>[];
};

@Injectable({providedIn: 'root'})
export class FiltersService {
  private injector = inject(Injector);
  private loadingScreen = inject(LoadingScreenService);
  private translate = inject(LanguageTranslationService);
  private filterAttributesService = inject(FILTER_ATTRIBUTES);

  private filtersMethods = {
    [ModelFilter.DEFAULT]: () => this.selectDefaultFilter(),
    [ModelFilter.PROPERTIES]: () => this.selectPropertiesFilter(),
  };
  public filteredTree: Partial<FilteredTrees> = {};
  public currentFilter: FilterLoader<any>;

  constructor() {
    window['_filter'] = this;
    this.selectDefaultFilter();
  }

  selectDefaultFilter() {
    this.currentFilter = new DefaultFilter(runInInjectionContext(this.injector, () => inject(LoadedFilesService)));
    this.filterAttributesService.activeFilter = ModelFilter.DEFAULT;
  }

  selectPropertiesFilter() {
    this.currentFilter = new PropertiesFilterLoader(this.injector);
    this.filterAttributesService.activeFilter = ModelFilter.PROPERTIES;
  }

  filter(elements: NamedElement[]): ModelTree<NamedElement>[] {
    this.filteredTree[this.filterAttributesService.activeFilter] = this.currentFilter.filter(elements);
    this.currentFilter.cache = {};
    return this.filteredTree[this.filterAttributesService.activeFilter];
  }

  createNode<T extends NamedElement = NamedElement>(element: T, options?: ModelTreeOptions): ModelTree<T> {
    const node = this.updateNodeInfo<T>({element, filterType: this.currentFilter.filterType}, options);
    return this.updateNodeTree<T>(node, options);
  }

  updateNodeInfo<T extends NamedElement = NamedElement>(node: ModelTree<T>, options?: ModelTreeOptions): ModelTree<T> {
    node.fromParentArrow = options?.parent ? this.currentFilter.getArrowStyle(node.element, options.parent) : null;
    node.shape = {...this.currentFilter.getShapeGeometry(node.element), mxGraphStyle: this.currentFilter.getMxGraphStyle(node.element)};
    node.filterType = this.currentFilter.filterType;
    return node;
  }

  updateNodeTree<T extends NamedElement = NamedElement>(node: ModelTree<T>, options?: ModelTreeOptions): ModelTree<T> {
    const generatedNode = this.currentFilter.generateTree(node.element, options);
    this.currentFilter.cache = {};
    return generatedNode;
  }

  renderByFilter(filter: ModelFilter) {
    const mxGraphService = runInInjectionContext(this.injector, () => inject(MxGraphService));
    const editorService = runInInjectionContext(this.injector, () => inject(EditorService));
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
          const loadedFilesService = runInInjectionContext(this.injector, () => inject(LoadedFilesService));
          const mxGraphRenderer = new MxGraphRenderer(
            mxGraphService,
            runInInjectionContext(this.injector, () => inject(MxGraphShapeOverlayService)),
            runInInjectionContext(this.injector, () => inject(SammLanguageSettingsService)),
            runInInjectionContext(this.injector, () => inject(LoadedFilesService))?.currentLoadedFile?.rdfModel,
          );

          const cachedFile = loadedFilesService.currentLoadedFile.cachedFile;
          const rootElements = cachedFile.getKeys().reduce((acc, e) => {
            if (cachedFile.get<NamedElement>(e).parents.length <= 0) {
              acc.push(cachedFile.get<NamedElement>(e));
            }
            return acc;
          }, []);
          const filteredElements = this.filter(rootElements);

          mxGraphService.deleteAllShapes();

          return mxGraphService.updateGraph(() => {
            for (const elementTree of filteredElements) {
              mxGraphRenderer.render(elementTree, null);
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
        }),
      )
      .subscribe(() => {
        localStorage.removeItem('validating');
        this.loadingScreen.close();
      });
  }
}
