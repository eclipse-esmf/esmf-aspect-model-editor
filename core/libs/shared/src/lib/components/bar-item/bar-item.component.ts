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

import {Component, inject, input, output} from '@angular/core';
import {MatRipple} from '@angular/material/core';

@Component({
  host: {
    '[class.disabled]': 'disabled()',
    '(mousedown)': 'onmousedown($event)',
    '(click)': 'onClick($event)',
  },
  selector: 'ame-bar-item',
  templateUrl: './bar-item.component.html',
  styleUrls: ['./bar-item.component.scss'],
  providers: [MatRipple],
})
export class BarItemComponent {
  readonly disabled = input(false);

  readonly itemClick = output<MouseEvent>();

  private ripple = inject(MatRipple);

  onmousedown(event: MouseEvent) {
    if (this.disabled()) {
      return;
    }
    this.ripple.launch(event.x, event.y);
  }

  onClick(event: MouseEvent) {
    if (this.disabled()) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    this.itemClick.emit(event);
  }
}
