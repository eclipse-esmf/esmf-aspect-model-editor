/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {EventEmitter, Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NotificationType} from './enums/notification-type.enum';
import {NotificationModel} from './model/notification.model';

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

  warning(title: string, message?: string, link?: string, timeout?: number, hidePopup?: boolean) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Warning);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.warning(message, title, {timeOut: timeout});
    }
  }

  error(title: string, message?: string, link?: string, timeout?: number, hidePopup?: boolean) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Error);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.error(message, title, {timeOut: timeout});
    }
  }

  validationError(title: string, message?: string, link?: string, timeout?: number, hidePopup?: boolean) {
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

  info(title: string, message?: string, link?: string, timeout?: number, hidePopup?: boolean) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Info);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.info(message, title, {timeOut: timeout});
    }
  }

  success(title: string, message?: string, link?: string, timeout?: number, hidePopup?: boolean) {
    timeout = timeout !== null && timeout !== undefined ? timeout : 2000;
    const notification = new NotificationModel(title, message, link, NotificationType.Success);
    this.notifications.unshift(notification);
    this.badgeText.emit(`${this.notifications.length}`);
    if (!hidePopup) {
      this.toastr.success(message, title, {timeOut: timeout});
    }
  }
}
