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

import {ThemeService} from '@ame/mx-graph';
import {CommonModule} from '@angular/common';
import {Component, HostListener} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'ame-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  imports: [MatIconModule, CommonModule],
})
export class ThemeSwitcherComponent {
  public selectedTheme = 'light';

  constructor(private themeService: ThemeService) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.selectedTheme = this.selectedTheme === 'light' ? 'dark' : 'light';
    this.themeService.applyTheme(this.selectedTheme);
  }
}
