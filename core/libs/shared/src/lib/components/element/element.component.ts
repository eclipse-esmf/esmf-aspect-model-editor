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

import {CommonModule} from '@angular/common';
import {Component, Input, OnChanges} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'ame-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
  imports: [CommonModule, MatTooltipModule],
})
export class ElementIconComponent implements OnChanges {
  @Input() type!: any;
  @Input() size: 'small' | 'medium' | 'large' = 'large';
  @Input() name = '';
  @Input() description = '';
  @Input() disabledTooltipNameLength = 30;
  @Input() disabledTooltipDescriptionLength = 40;

  public className = '';

  ngOnChanges(): void {
    if (this.type) {
      this.className = `${this.type.name.toLowerCase()} ame-${this.size}`;
    }
  }
}
