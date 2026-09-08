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

import {inject, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {Cell} from '@maxgraph/core';
import {EditorModelService} from '../editor-model.service';

@Injectable({providedIn: 'root'})
export class ShapeSettingsStateService {
  private editorModelService = inject(EditorModelService);

  private readonly _selectedShapeForUpdate = signal<Cell | null>(null);
  public readonly selectedShapeForUpdate = this._selectedShapeForUpdate.asReadonly();

  private readonly _isShapeSettingOpened = signal<boolean>(false);
  public readonly isShapeSettingOpened = this._isShapeSettingOpened.asReadonly();

  public readonly onSettingsOpened$ = toObservable(this._isShapeSettingOpened);

  setSelectedShapeForUpdate(cell: Cell | null): void {
    this._selectedShapeForUpdate.set(cell);
  }

  openShapeSettings(): void {
    this._isShapeSettingOpened.set(true);
  }

  closeShapeSettings(): void {
    this._isShapeSettingOpened.set(false);
    this.editorModelService.updateMetaModelElement(null);
  }
}
