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

import {EventEmitter, Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NotificationType} from './enums';
import {NotificationModel} from './model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notifications: NotificationModel[] = [];
  private lastErrorDate: Date = null;
  private errorTimeout;
  private nbValidationErrors = 0;

  badgeText = new EventEmitter<string>();

  constructor(private toastr: ToastrService) {}

  clearNotifications(notificationsToDelete?: NotificationModel[]) {
    if (!notificationsToDelete) {
      this.notifications = [];
    } else {
      this.notifications = this.notifications.filter(notification => !notificationsToDelete.includes(notification));
    }
    this.badgeText.emit(this.notifications.length == 0 ? null : `${this.notifications.length}`);
  }

  getNotifications() {
    return this.notifications;
  }

  warning({title = '', message = '', link = '', timeout = 2000, hidePopup = false}) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Warning);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.warning(message, title, {timeOut: timeout});
    }
  }

  error({title = '', message = '', link = '', timeout = 2000, hidePopup = false}) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Error);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.error(message, title, {timeOut: timeout});
    }
  }

  validationError({title = '', message = '', link = '', timeout = 2000, hidePopup = false}) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Error);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    this.nbValidationErrors++;

    const timeoutCallback = () => {
      this.errorTimeout = null;
      this.lastErrorDate = null;
      if (this.nbValidationErrors < 2 && !hidePopup) {
        this.toastr.error(message, title, {timeOut: timeout});
      } else if (!hidePopup) {
        this.toastr.error('Validation completed with errors', null, {timeOut: timeout});
      }
      this.nbValidationErrors = 0;
    };
    if (!this.lastErrorDate) {
      // first validation notification in the last 100ms
      this.lastErrorDate = notification.date;
      this.errorTimeout = setTimeout(timeoutCallback, 100);
    } else if (this.lastErrorDate.getTime() + 100 >= notification.date.getTime()) {
      // the next validation error is pushed under 100ms after the last
      this.lastErrorDate = notification.date;
      clearTimeout(this.errorTimeout);
      this.errorTimeout = setTimeout(timeoutCallback, 100);
    }
  }

  info({title = '', message = '', link = '', timeout = 2000, hidePopup = false}) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Info);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.info(message, title, {timeOut: timeout});
    }
  }

  success({title = '', message = '', link = '', timeout = 2000, hidePopup = false}) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Success);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.success(message, title, {timeOut: timeout});
    }
  }
}
