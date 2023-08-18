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

import {Component, ViewChild, inject} from '@angular/core';
import {DefaultEntityValue, SearchResult} from '@ame/meta-model';
import {ModelStyleResolver, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {mxCellSearchOption, SearchService} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {FILTER_ATTRIBUTES, FilterAttributesService, ModelFilter} from '@ame/loader-filters';
import mxCell = mxgraph.mxCell;
import {FormControl} from '@angular/forms';

@Component({
  selector: 'ame-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @ViewChild('searchInputField') searchInputField;

  public readonly DEFAULT = ModelFilter.DEFAULT;
  public searchControl = new FormControl('');
  public searchResults: SearchResult[];
  public filterAttributes: FilterAttributesService = inject(FILTER_ATTRIBUTES);

  constructor(private mxGraphService: MxGraphService, private searchService: SearchService) {
    this.searchControl.valueChanges.subscribe(value => {
      if (!value) this.searchResults = [];
      else this.searchResults = this.searchForCell();
    });
  }

  searchForCell(): SearchResult[] {
    const graphCells = this.mxGraphService.getAllCells();
    return this.searchService
      .search<mxgraph.mxCell>(this.searchControl.value, graphCells, mxCellSearchOption)
      ?.map((cell: mxgraph.mxCell) => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (modelElement.isExternalReference()) {
          const namespacePrefix = MxGraphHelper.getModelElement(cell)?.aspectModelUrn?.split('#')[0];
          return {cell, namespacePrefix};
        }
        return {cell};
      });
  }

  goToSearchResult(event) {
    if (event?.option?.value?.cell) {
      this.goToCell(event.option.value.cell);
    }
  }

  goToCell(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    this.mxGraphService.navigateToCellByUrn(modelElement.aspectModelUrn);
    this.searchInputField.nativeElement.blur();
    this.searchResults = [];
  }

  displayCellId(option) {
    return option?.id;
  }

  focusOnSearchInputField() {
    this.searchInputField.nativeElement.focus();

    if (this.searchInputField.nativeElement.value) {
      this.searchControl.patchValue('');
    }
  }

  getCellType(cell: mxCell): string {
    const modelElement = MxGraphHelper.getModelElement(cell);
    return ModelStyleResolver.resolve(modelElement);
  }

  getFirstLetterOfType(cell: mxCell) {
    if (MxGraphHelper.getModelElement(cell) instanceof DefaultEntityValue) {
      return 'Ev';
    }
    return this.getCellType(cell)[0];
  }
}
