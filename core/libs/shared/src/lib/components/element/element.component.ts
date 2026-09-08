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

import {CommonModule} from '@angular/common';
import {Component, effect, inject, input, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {ElementSymbols, ElementType} from '../../model';

interface ElementInfo {
  type: ElementType | 'text';
  symbol?: ElementSymbols | 'T';
}

@Component({
  selector: 'ame-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
  host: {
    '[class.new-value]': 'isNewValue()',
  },
  hostDirectives: [MatTooltip],
  imports: [CommonModule, MatTooltipModule, MatIconModule],
})
export class ElementIconComponent {
  readonly type = input.required<ElementInfo>();
  readonly size = input<'small' | 'medium' | 'large'>('large');
  readonly name = input('');
  readonly description = input('');
  readonly disabledTooltipNameLength = input(30);
  readonly disabledTooltipDescriptionLength = input(40);

  private matTooltip = inject(MatTooltip);

  public isNewValue = input(false);
  public className = signal('');

  constructor() {
    effect(() => {
      const type = this.type();

      if (type) {
        this.className.set(`${type.type.toLowerCase()} ame-${this.size()}`);
      }

      if (this.isNewValue()) {
        this.matTooltip.message = 'New';
        this.matTooltip.position = 'before';
      } else if (type?.type === 'text') {
        this.matTooltip.message = 'Simple value';
        this.matTooltip.position = 'before';
      }
    });
  }
}
