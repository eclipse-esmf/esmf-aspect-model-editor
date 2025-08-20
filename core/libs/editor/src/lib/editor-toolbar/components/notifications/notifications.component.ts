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

import {NotificationModel, NotificationType, NotificationsService} from '@ame/shared';
import {LanguageTranslateModule} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'ame-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [CommonModule, MatIconModule, LanguageTranslateModule, MatDialogModule, MatButtonModule, MatTableModule, MatMenuModule],
})
export class NotificationsComponent implements OnInit {
  currentItem = null;
  displayedColumns: string[] = ['expand', 'date', 'type', 'message', 'options'];

  constructor(
    private dialogRef: MatDialogRef<NotificationsComponent>,
    public notificationsService: NotificationsService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.notificationsService.getNotifications().forEach(notification => {
      notification.expanded = false;
    });
  }

  goTo(urn: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {urn},
      queryParamsHandling: 'merge',
    });
    this.dialogRef.close();
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
