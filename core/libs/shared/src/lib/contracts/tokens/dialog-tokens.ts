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

import {InjectionToken} from '@angular/core';
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

export interface IConfirmDialogService {
  open(options: DialogOptions): Observable<ConfirmDialogEnum>;
}

export const CONFIRM_DIALOG_SERVICE = new InjectionToken<IConfirmDialogService>('CONFIRM_DIALOG_SERVICE');

export interface IRenameModelDialogService {
  open(): Observable<any>;
}

export const RENAME_MODEL_DIALOG_SERVICE = new InjectionToken<IRenameModelDialogService>('RENAME_MODEL_DIALOG_SERVICE');
