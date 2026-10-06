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

import {Observable} from 'rxjs';

export enum ConfirmDialogEnum {
  ok = 'ok',
  action = 'action',
  cancel = 'cancel',
}

export interface DialogOptions {
  phrases: string[];
  title: string;
  closeButtonText?: string;
  okButtonText?: string;
  actionButtonText?: string;
}

export abstract class ConfirmDialogPort {
  abstract open(options: DialogOptions): Observable<ConfirmDialogEnum>;
}

export abstract class RenameModelDialogPort {
  abstract open(): Observable<any>;
}
