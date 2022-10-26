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

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ElementModel} from '@ame/shared';

@Component({
  selector: 'ame-namespace-element-list',
  styleUrls: ['./namespace-element-list.component.scss'],
  templateUrl: './namespace-element-list.component.html',
})
export class NamespaceElementListComponent implements OnChanges {
  @Input() public type: string;
  @Input() public title: string;
  @Input() public elements: ElementModel[];

  public isExpanded = false;
  public filteredElements: ElementModel[];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements') && this.type) {
      this.initList();
    }
  }

  public resetExpanded() {
    this.initList();
  }

  public expandList() {
    this.filteredElements = this.filterElements();
    this.isExpanded = true;
  }

  private initList() {
    this.filteredElements = this.filterElements();
    this.isExpanded = true;

    if (this.filteredElements.length > 3) {
      this.isExpanded = false;
      this.filteredElements.splice(3, this.filteredElements.length - 3);
    }
  }

  private filterElements(): ElementModel[] {
    return [...(this.elements || [])].filter(element => !element.aspectModelUrn.startsWith('n3-') || !element.name.startsWith('['));
  }
}
