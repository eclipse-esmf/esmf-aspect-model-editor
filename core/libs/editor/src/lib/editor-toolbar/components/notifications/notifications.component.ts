/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationModel, NotificationsService, NotificationType} from '@ame/shared';

@Component({
  selector: 'ame-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  currentItem = null;
  displayedColumns: string[] = ['expand', 'date', 'type', 'message', 'options'];

  constructor(
    private dialogRef: MatDialogRef<NotificationsComponent>,
    public notificationsService: NotificationsService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.notificationsService.getNotifications().forEach(notification => {
      notification.expanded = false;
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  goTo(urn: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {urn},
      queryParamsHandling: 'merge',
    });
    this.onClose();
  }

  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.Warning:
        return 'warning_amber';
      case NotificationType.Error:
        return 'error_outline';
      default:
        return 'info_outline';
    }
  }

  clearNotification(notification: NotificationModel) {
    this.notificationsService.clearNotifications([notification]);
  }

  clearAllNotifications() {
    this.notificationsService.clearNotifications();
  }
}
