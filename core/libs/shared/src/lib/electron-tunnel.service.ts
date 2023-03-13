/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable} from '@angular/core';
import {NotificationsService} from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class ElectronTunnelService {
  private ipcRenderer = window.require?.('electron').ipcRenderer;

  constructor(private notificationsService: NotificationsService) {}

  public subscribeMessages() {
    if (!this.ipcRenderer) {
      return;
    }

    this.onServiceNotStarted();
  }

  private onServiceNotStarted() {
    this.ipcRenderer.on('backend-startup-error', () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }
}
