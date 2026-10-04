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

import {ClipboardService, DialogCloseButtonComponent, NotificationModel, NotificationsService, NotificationType} from '@ame/shared';
import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslocoDirective} from '@jsverse/transloco';

@Component({
  selector: 'ame-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [
    DialogCloseButtonComponent,
    CommonModule,
    MatIconModule,
    TranslocoDirective,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
  ],
})
export class NotificationsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<NotificationsComponent>);
  private activatedRoute = inject(ActivatedRoute);
  private clipboard = inject(ClipboardService);

  public notificationsService = inject(NotificationsService);
  public router = inject(Router);

  currentItem = signal(null);
  copiedElement = signal<any>(null);
  displayedColumns = signal(['expand', 'date', 'type', 'message', 'options']);

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

  copyToClipboard(text: string, element?: any, event?: Event): void {
    event?.stopPropagation();
    if (!text) return;

    this.clipboard.copy(text);

    if (element) {
      this.copiedElement.set(element);
      setTimeout(() => {
        if (this.copiedElement() === element) {
          this.copiedElement.set(null);
        }
      }, 2000);
    }
  }

  clearNotification(notification: NotificationModel) {
    this.notificationsService.clearNotifications([notification]);
  }

  clearAllNotifications() {
    this.notificationsService.clearNotifications();
  }
}
