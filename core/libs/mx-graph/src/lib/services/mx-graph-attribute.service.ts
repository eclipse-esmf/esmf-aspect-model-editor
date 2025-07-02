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

import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {mxgraph} from 'mxgraph-factory';

@Injectable()
export class MxGraphAttributeService {
  private _inCollapsedMode = false;
  private _graph;
  private _editor: mxgraph.mxEditor;

  constructor() {
    if (!environment.production) {
      window['angular.mxGraphAttributeService'] = this;
    }
  }

  public get inCollapsedMode(): boolean {
    return this._inCollapsedMode;
  }

  public set inCollapsedMode(inCollapsedMode: boolean) {
    this._inCollapsedMode = inCollapsedMode;
  }

  public get graph(): mxgraph.mxGraph {
    return this._graph;
  }

  public set graph(value: mxgraph.mxGraph) {
    this._graph = value;
  }

  get editor(): mxgraph.mxEditor {
    return this._editor;
  }

  set editor(value: mxgraph.mxEditor) {
    this._editor = value;
  }
}
