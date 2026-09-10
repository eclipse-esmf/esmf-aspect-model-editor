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
import {ConfirmDialogEnum, ConfirmDialogService, ShapeSettingsService} from '@ame/editor';
import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {
  ElectronSignals,
  ElectronSignalsService,
  ElementIconComponent,
  ElementInfo,
  ElementType,
  mxCellSearchOption,
  sammElements,
  SearchService,
} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {AfterViewInit, Component, computed, ElementRef, inject, signal, viewChild} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {SearchesStateService} from '../../search-state.service';

@Component({
  selector: 'ame-elements-search',
  templateUrl: './elements-search.component.html',
  styleUrls: ['./elements-search.component.scss'],
  imports: [MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, ElementIconComponent, TranslocoDirective],
})
export class ElementsSearchComponent implements AfterViewInit {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private maxgraphService = inject(MaxGraphService);
  private shapeSettingsService = inject(ShapeSettingsService);
  private searchesStateService = inject(SearchesStateService);
  private confirmDialogService = inject(ConfirmDialogService);
  private searchService = inject(SearchService);
  private translate = inject(LanguageTranslationService);

  public loadedFiles = inject(LoadedFilesService);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  public searchQuery = signal('');
  public elements = signal<NamedElement[]>([]);

  public readonly transformedElements = computed(() => {
    return this.elements().map(element => {
      const [type, elementData] = this.getElementType(element);
      return {
        element,
        symbol: elementData?.symbol,
        type,
      };
    });
  });

  constructor() {
    toObservable(this.searchQuery).subscribe(value => {
      this.elements.set(
        this.searchService
          .search<Cell>(value, this.maxgraphService.getAllCells(), mxCellSearchOption)
          ?.map(cell => MaxGraphHelper.getModelElement(cell)),
      );
    });
  }

  ngAfterViewInit() {
    // Focus the input as soon as the search overlay is opened so the user can start typing immediately.
    this.searchInput()?.nativeElement.focus();
  }

  openElement(element: NamedElement) {
    if (this.loadedFiles.isElementExtern(element) && !element.isPredefined) {
      this.confirmDialogService
        .open({
          phrases: [this.translate.translateService.translate('confirmDialog.newWindowElement.phrase1', {elementName: element.name})],
          title: this.translate.language.confirmDialog.newWindowElement.title,
          closeButtonText: this.translate.language.confirmDialog.newWindowElement.cancelButton,
          okButtonText: this.translate.language.confirmDialog.newWindowElement.okButton,
        })
        .subscribe(confirm => {
          if (confirm !== ConfirmDialogEnum.cancel) {
            this.electronSignalsService.call('openWindow', {
              file: this.loadedFiles.getFileFromElement(element),
              namespace: element.aspectModelUrn.replace('urn:samm:', '').split('#')[0],
              editElement: element.aspectModelUrn,
              fromWorkspace: true,
              aspectModelUrn: element.aspectModelUrn,
            });
          }
        });
    } else {
      this.shapeSettingsService.editModel(element);
      requestAnimationFrame(() => {
        this.maxgraphService.navigateToCellByUrn(element.aspectModelUrn);
      });
    }

    this.searchQuery.set('');
    this.closeSearch();
  }

  closeSearch() {
    this.searchesStateService.elementsSearch.close();
  }

  private getElementType(element: NamedElement): [ElementType, ElementInfo[ElementType]] {
    return Object.entries(sammElements).find(([, value]) => element instanceof value.class) || (['', null] as any);
  }
}
