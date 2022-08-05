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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ElementModel} from '@ame/shared';

@Component({
  selector: 'ame-sidebar-new-element',
  templateUrl: './sidebar-new-element.component.html',
  styleUrls: ['./sidebar-new-element.component.scss'],
})
export class SidebarNewElementComponent implements OnInit {
  @Output()
  public openWorkspaces: EventEmitter<void> = new EventEmitter();

  public elements: ElementModel[];

  public ngOnInit() {
    this.elements = [
      new ElementModel(null, 'Property', 'property', 'Named Value'),
      new ElementModel(null, 'Operation', 'operation', 'Represents triggerable actions'),
      new ElementModel(null, 'Characteristic', 'characteristic', 'Characterizes a Property'),
      // TODO reactivate for feature usage
      // new ElementModel(null, 'AbstractEntity', 'abstractEntity', 'The abstraction of a logical encapsulation'),
      new ElementModel(null, 'Entity', 'entity', 'The logical encapsulation of multiple values'),
      new ElementModel(null, 'Constraint', 'constraint', 'A limitation applied to a Characteristic'),
      new ElementModel(null, 'Trait', 'trait', 'Bundles Constraints'),
      new ElementModel(null, 'Unit', 'unit', 'A definition of a physical unit'),
      new ElementModel(null, 'Event', 'event', 'Supported events of the Aspect'),
    ];
  }
}
