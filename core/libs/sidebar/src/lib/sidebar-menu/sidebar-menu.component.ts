import {Component, inject} from '@angular/core';
import {InformationHandlingService} from '@ame/editor';
import {NotificationsService} from '@ame/shared';
import {SidebarStateService} from '../sidebar-state.service';
import {MxGraphService} from '@ame/mx-graph';

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
@Component({
  selector: 'ame-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent {
  public notificationService = inject(NotificationsService);
  public sidebarService = inject(SidebarStateService);

  constructor(
    private informationService: InformationHandlingService,
    private mxGraphService: MxGraphService,
  ) {}

  get isModelEmpty(): boolean {
    return !this.mxGraphService.getAllCells()?.length;
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
