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
import {BarItemComponent, NotificationsService} from '@ame/shared';
import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {SidebarStateService} from '../sidebar-state.service';

@Component({
  selector: 'ame-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  imports: [BarItemComponent, MatTooltip, AsyncPipe, MatIconModule, MatBadge, TranslatePipe],
})
export class SidebarMenuComponent {
  private informationService = inject(InformationHandlingService);

  public notificationService = inject(NotificationsService);
  public sidebarService = inject(SidebarStateService);

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
