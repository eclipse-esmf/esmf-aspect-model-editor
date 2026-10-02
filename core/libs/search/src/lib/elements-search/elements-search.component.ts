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

import {GraphNavigatorPort, ModelOpenerPort, ModelSessionFacade, ShapeSettingsPort} from '@ame/domain';
import {ElementIconComponent, ElementInfo, ElementType, sammElements} from '@ame/shared';
import {AfterViewInit, Component, computed, ElementRef, inject, signal, viewChild} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {SearchesStateService} from '../search-state.service';

@Component({
  selector: 'ame-elements-search',
  templateUrl: './elements-search.component.html',
  styleUrls: ['./elements-search.component.scss'],
  imports: [MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, ElementIconComponent, TranslocoDirective],
})
export class ElementsSearchComponent implements AfterViewInit {
  private readonly graphNavigator = inject(GraphNavigatorPort);
  private readonly shapeSettingsService = inject(ShapeSettingsPort);
  private readonly searchesStateService = inject(SearchesStateService);
  private readonly modelOpener = inject(ModelOpenerPort);

  public readonly loadedFiles = inject(ModelSessionFacade);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  public readonly searchQuery = signal('');
  public readonly elements = signal<NamedElement[]>([]);

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
      this.elements.set(this.graphNavigator.searchElements(value));
    });
  }

  ngAfterViewInit() {
    // Focus the input as soon as the search overlay is opened so the user can start typing immediately.
    this.searchInput()?.nativeElement.focus();
  }

  openElement(element: NamedElement) {
    if (this.loadedFiles.isElementExtern(element) && !element.isPredefined) {
      const file = this.loadedFiles.getFileFromElement(element) || 'aspect.ttl';
      const namespace = element.aspectModelUrn.replace('urn:samm:', '').replace('urn:bamm:', '').split('#')[0];

      this.modelOpener
        .promptAndOpen({
          file,
          namespace,
          aspectModelUrn: element.aspectModelUrn,
          editElementUrn: element.aspectModelUrn,
        })
        .subscribe();
    } else {
      this.shapeSettingsService.editModel(element);
      requestAnimationFrame(() => {
        this.graphNavigator.navigateToElement(element.aspectModelUrn);
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
