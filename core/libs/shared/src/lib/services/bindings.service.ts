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

import {Injectable} from '@angular/core';

/**
 * This class is used to register actions within the application, like context menu actions
 */
@Injectable({providedIn: 'root'})
export class BindingsService {
  private bindings: {[key: string]: (...args: any[]) => void} = {};

  registerAction(actionName: string, callback: (...args: any[]) => void) {
    this.bindings[actionName] = callback;
  }

  fireAction(actionName: string, ...args: any[]) {
    this.bindings[actionName](...args);
  }
}
