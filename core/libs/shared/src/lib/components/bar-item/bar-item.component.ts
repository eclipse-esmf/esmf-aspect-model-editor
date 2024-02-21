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

import {Component, HostListener, Input, HostBinding} from '@angular/core';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'ame-bar-item',
  templateUrl: './bar-item.component.html',
  styleUrls: ['./bar-item.component.scss'],
  providers: [MatRipple],
})
export class BarItemComponent {
  @Input()
  @HostBinding('class.disabled')
  disabled = false;

  constructor(private ripple: MatRipple) {}

  @HostListener('mousedown', ['$event']) onmousedown(event) {
    this.ripple.launch(event.x, event.y);
  }
}
