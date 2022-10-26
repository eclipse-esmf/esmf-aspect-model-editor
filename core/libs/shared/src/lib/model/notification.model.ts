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

import {NotificationType} from '../enums';

export class NotificationModel {
  public expanded = false;
  public date: Date = new Date();

  constructor(public title?: string, public description?: string, public link?: string, public type?: NotificationType) {}

  get formattedTime(): string {
    return this.date.toLocaleTimeString();
  }

  get formattedDate(): string {
    const d = this.date.getDate();
    const m = this.date.getMonth() + 1;
    const y = this.date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }
}
