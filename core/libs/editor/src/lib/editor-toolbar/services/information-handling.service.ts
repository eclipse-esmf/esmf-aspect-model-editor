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

import {DocumentComponent} from '@ame/editor';
import {SettingDialogComponent} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotificationsComponent} from '../components/notifications/notifications.component';

@Injectable({
  providedIn: 'root',
})
export class InformationHandlingService {
  constructor(private matDialog: MatDialog) {}

  openSettingsDialog() {
    this.matDialog.open(SettingDialogComponent, {panelClass: 'settings-dialog-container', width: '60%', autoFocus: false});
  }

  openHelpDialog() {
    this.matDialog.open(DocumentComponent);
  }

  openNotificationDialog() {
    const notificationModal = this.matDialog.open(NotificationsComponent, {width: '60%', autoFocus: false});
    this.keyDownEvents(notificationModal);
  }

  private keyDownEvents(matDialogRef: MatDialogRef<any>) {
    matDialogRef.keydownEvents().subscribe(keyBoardEvent => {
      // TODO KeyCode might not be supported by electron.
      if (keyBoardEvent.code === 'Escape') {
        matDialogRef.close();
      }
    });
  }
}
