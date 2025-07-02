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
import {mxgraph} from 'mxgraph-factory';
import {BehaviorSubject} from 'rxjs';
import {EditorModelService} from '../editor-model.service';

@Injectable({providedIn: 'root'})
export class ShapeSettingsStateService {
  public selectedShapeForUpdate: mxgraph.mxCell | null;
  public isShapeSettingOpened = false;

  onSettingsOpened$ = new BehaviorSubject(this.isShapeSettingOpened);

  constructor(private editorModelService: EditorModelService) {}

  openShapeSettings() {
    this.isShapeSettingOpened = true;
    this.onSettingsOpened$.next(this.isShapeSettingOpened);
  }

  closeShapeSettings() {
    this.isShapeSettingOpened = false;
    this.onSettingsOpened$.next(this.isShapeSettingOpened);
    this.editorModelService.updateMetaModelElement(null);
  }
}
