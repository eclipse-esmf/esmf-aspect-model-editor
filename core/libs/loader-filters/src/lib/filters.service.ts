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

import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphRenderer, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LoadingScreenService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable, Injector} from '@angular/core';
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
  private readonly injector = inject(Injector);
  private readonly loadingScreen = inject(LoadingScreenService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly filterAttributesService = inject(FILTER_ATTRIBUTES);

  private readonly filtersMethods: Record<ModelFilter, () => void> = {
    [ModelFilter.DEFAULT]: () => this.selectDefaultFilter(),
    [ModelFilter.PROPERTIES]: () => this.selectPropertiesFilter(),
  };
  public filteredTree: Partial<FilteredTrees> = {};
  public currentFilter: FilterLoader<NamedElement>;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>)['_filter'] = this;
    }
    this.selectDefaultFilter();
  }

  selectDefaultFilter(): void {
    this.currentFilter = new DefaultFilter(this.injector.get(LoadedFilesService));
    this.filterAttributesService.activeFilter = ModelFilter.DEFAULT;
  }

  selectPropertiesFilter(): void {
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
    node.shape = {
      ...this.currentFilter.getShapeGeometry(node.element),
      maxgraphStyle: {baseStyleNames: [this.currentFilter.getMaxgraphStyle(node.element)]},
    };
    node.filterType = this.currentFilter.filterType;
    return node;
  }

  updateNodeTree<T extends NamedElement = NamedElement>(node: ModelTree<T>, options?: ModelTreeOptions): ModelTree<T> {
    const generatedNode = this.currentFilter.generateTree(node.element, options);
    this.currentFilter.cache = {};
    return generatedNode as ModelTree<T>;
  }

  renderByFilter(filter: ModelFilter): void {
    const maxgraphService = this.injector.get(MaxGraphService);
    const editorService = this.injector.get(EditorService);
    let selectedCell = maxgraphService.graph.selectionModel.cells?.[0];
    const selectedModelElement = selectedCell && MaxGraphHelper.getModelElement(selectedCell);

    this.loadingScreen
      .open({
        title: this.translate.language.loadingScreenDialog.filterChange,
        content: this.translate.language.loadingScreenDialog.filterWait,
      })
      .afterOpened()
      .pipe(
        switchMap(() => {
          MaxGraphHelper.filterMode = filter;
          this.filterAttributesService.isFiltering = true;
          this.filtersMethods[filter]?.();
          const loadedFilesService = this.injector.get(LoadedFilesService);
          const maxgraphRenderer = new MaxGraphRenderer(
            maxgraphService,
            this.injector.get(MaxGraphShapeOverlayService),
            this.injector.get(SammLanguageSettingsService),
            loadedFilesService?.currentLoadedFile?.rdfModel,
          );

          const cachedFile = loadedFilesService.currentLoadedFile.cachedFile;
          const rootElements = cachedFile.getKeys().reduce<NamedElement[]>((acc, e) => {
            const cachedElement = cachedFile.get<NamedElement>(e);
            if (cachedElement && cachedElement.parents.length <= 0) {
              acc.push(cachedElement);
            }
            return acc;
          }, []);
          const filteredElements = this.filter(rootElements);

          maxgraphService.deleteAllShapes();

          return maxgraphService.updateGraph(() => {
            for (const elementTree of filteredElements) {
              maxgraphRenderer.render(elementTree, null);
            }

            if (this.injector.get(MaxGraphAttributeService).inCollapsedMode) {
              maxgraphService.foldCells();
            }
          });
        }),
        switchMap(() => {
          maxgraphService.formatShapes(true);
          this.filterAttributesService.isFiltering = false;
          selectedCell = selectedModelElement && maxgraphService.resolveCellByModelElement(selectedModelElement);
          if (selectedCell) maxgraphService.navigateToCellByUrn(selectedModelElement.aspectModelUrn);

          return editorService.validate();
        }),
      )
      .subscribe(() => {
        localStorage.removeItem('validating');
        this.loadingScreen.close();
      });
  }
}
