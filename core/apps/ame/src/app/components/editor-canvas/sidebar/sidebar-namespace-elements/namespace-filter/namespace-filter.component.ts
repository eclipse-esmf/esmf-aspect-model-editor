/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ElementModel} from '@ame/shared';

@Component({
  selector: 'ame-namespace-filter',
  styleUrls: ['./namespace-filter.component.scss'],
  templateUrl: './namespace-filter.component.html',
})
export class NamespaceFilterComponent implements OnChanges {
  @Input()
  fileName: string;

  @Input()
  public elements: ElementModel[] = [];

  @Output()
  public searchElements = new EventEmitter<ElementModel[]>();

  public types = [
    'property',
    'abstract-property',
    'operation',
    'characteristic',
    'entity',
    'abstract-entity',
    'constraint',
    'trait',
    'event',
  ];
  public selectedTypes = [];
  public searchedString: string = null;
  public filteredElements: ElementModel[];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements')) {
      this.filteredElements = this.elements;
      this.searchedString = '';
      this.selectedTypes = [];
    }
  }

  public getClassesForType(type: string): string[] {
    return this.selectedTypes.includes(type) ? [type, 'selected'] : [type];
  }

  public getName(type: string) {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.substring(1, word.length))
      .join(' ');
  }

  public getInitials(type: string) {
    const words = type.split('-');
    return words
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  public toggleSelect(type: string) {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes.splice(this.selectedTypes.indexOf(type), 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.filterElements();
  }

  public filterElements() {
    this.filteredElements = this.elements.filter(element => {
      if (this.searchedString) {
        return element.name.toUpperCase().includes(this.searchedString.toUpperCase());
      } else {
        return true;
      }
    });
    if (this.selectedTypes?.length > 0) {
      this.filteredElements = this.filteredElements.filter(element => this.selectedTypes.includes(element.type));
    }
    this.searchElements.emit(this.filteredElements);
  }
}
