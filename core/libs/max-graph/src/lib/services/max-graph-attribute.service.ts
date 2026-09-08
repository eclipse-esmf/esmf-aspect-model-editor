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

import {Injectable, signal} from '@angular/core';
import {Graph} from '@maxgraph/core';
import {environment} from 'environments/environment';

@Injectable({providedIn: 'root'})
export class MaxGraphAttributeService {
  private readonly _inCollapsedMode = signal(false);
  public readonly inCollapsedModeSignal = this._inCollapsedMode.asReadonly();
  private _graph: Graph;

  constructor() {
    if (!environment.production) {
      window['angular.maxgraphAttributeService'] = this;
    }
  }

  public get inCollapsedMode(): boolean {
    return this._inCollapsedMode ? this._inCollapsedMode() : false;
  }

  public set inCollapsedMode(inCollapsedMode: boolean) {
    if (this._inCollapsedMode) {
      this._inCollapsedMode.set(inCollapsedMode);
    }
  }

  public get graph(): Graph {
    return this._graph;
  }

  public set graph(value: Graph) {
    this._graph = value;
  }
}
