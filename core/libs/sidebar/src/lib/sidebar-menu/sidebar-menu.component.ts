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

import {InformationHandlingService} from '@ame/editor';
import {ThemeService} from '@ame/max-graph';
import {ConfigurationService} from '@ame/settings-dialog';
import {BarItemComponent, NotificationsService} from '@ame/shared';
import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {SidebarStateService} from '../sidebar-state.service';

@Component({
  selector: 'ame-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  imports: [BarItemComponent, MatTooltip, AsyncPipe, MatIconModule, MatBadge, TranslocoDirective],
})
export class SidebarMenuComponent {
  private informationService = inject(InformationHandlingService);
  private configurationService = inject(ConfigurationService);
  private themeService = inject(ThemeService);

  public notificationService = inject(NotificationsService);
  public sidebarService = inject(SidebarStateService);

  get isDarkMode(): boolean {
    return this.themeService.currentTheme === 'dark';
  }

  toggleDarkMode(): void {
    const settings = this.configurationService.getSettings();
    const newDarkMode = !this.isDarkMode;
    settings.darkMode = newDarkMode;
    this.configurationService.setSettings(settings);
    this.themeService.applyTheme(newDarkMode ? 'dark' : 'light');
  }

  openSettingsDialog() {
    this.informationService.openSettingsDialog();
  }

  openHelpDialog() {
    this.informationService.openHelpDialog();
  }

  openNotificationDialog() {
    this.informationService.openNotificationDialog();
  }
}
