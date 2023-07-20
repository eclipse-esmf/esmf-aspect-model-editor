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

import {Component, Inject, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {ElementModel} from '@ame/shared';
import {FILTER_ATTRIBUTES, FilterAttributesService, ModelFilter} from '@ame/loader-filters';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ame-sidebar-namespace-elements',
  styleUrls: ['./sidebar-namespace-elements.component.scss'],
  templateUrl: './sidebar-namespace-elements.component.html',
})
export class SidebarNamespaceElementsComponent implements OnChanges, OnDestroy {
  @Input() public namespace: string;
  @Input() public elements: ElementModel[];

  private subscription = new Subscription();

  public filteredElements: ElementModel[];
  public elementsTypes = [
    {name: 'Properties', type: 'property', elements: []},
    {name: 'Abstract Properties', type: 'abstract-property', elements: []},
    {name: 'Operations', type: 'operation', elements: []},
    {name: 'Characteristics', type: 'characteristic', elements: []},
    {name: 'Entities', type: 'entity', elements: []},
    {name: 'Abstract Entities', type: 'abstract-entity', elements: []},
    {name: 'Traits', type: 'trait', elements: []},
    {name: 'Constraints', type: 'constraint', elements: []},
    {name: 'Unit', type: 'unit', elements: []},
    {name: 'Event', type: 'event', elements: []},
  ];

  get fileName(): string {
    const namespaceParts = this.namespace.split(':');
    return namespaceParts[namespaceParts.length - 1];
  }

  constructor(@Inject(FILTER_ATTRIBUTES) private filterAttributes: FilterAttributesService) {
    this.subscription = this.filterAttributes.activeFilter$.subscribe(filter => {
      if (!this.elements || !this.elements.length) {
        return;
      }

      if (filter === ModelFilter.PROPERTIES) {
        this.elementsTypes.forEach(type => (type.elements = []));
        this.filterElements(this.elements.filter(e => e.type === 'property'));
      } else {
        this.filterElements(this.elements);
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements')) {
      this.filterElements(this.elements);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public filterElements(elements: ElementModel[]) {
    this.filteredElements = elements;
    for (const type of this.elementsTypes) {
      if (this.filterAttributes.activeFilter === ModelFilter.PROPERTIES && type.type !== 'property') {
        continue;
      }
      type.elements = elements.filter(e => e.type === type.type);
    }
  }
}
