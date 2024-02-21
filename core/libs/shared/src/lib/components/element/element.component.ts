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

import {Component, Input, OnChanges} from '@angular/core';
import {ElementType, ElementInfo, sammElements} from '../../model';

@Component({
  selector: 'ame-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
})
export class ElementIconComponent implements OnChanges {
  @Input() type: ElementType = 'aspect';
  @Input() size: 'small' | 'medium' | 'large' = 'large';
  @Input() name = '';
  @Input() description = '';
  @Input() disabledTooltipNameLength = 30;
  @Input() disabledTooltipDescriptionLength = 40;

  public className = '';

  ngOnChanges() {
    this.className = `${this.type} ame-${this.size}`;
  }

  public elements: ElementInfo = sammElements;
}
