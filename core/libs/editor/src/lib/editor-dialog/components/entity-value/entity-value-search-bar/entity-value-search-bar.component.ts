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

import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ame-entity-value-search-bar',
  templateUrl: './entity-value-search-bar.component.html',
  styleUrls: ['./entity-value-search-bar.component.scss'],
})
export class EntityValueSearchBarComponent {
  @Input() count: number;
  @Input() disableAddNewEntityValue = false;
  @Output() newSearch = new EventEmitter<string>();
  @Output() add = new EventEmitter();

  sendNewSearchValue(newString: Event & {target: EventTarget & {value?: string}}): void {
    this.newSearch.emit(newString.target.value);
  }
}
