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

import {
  CONFIRM_DIALOG_SERVICE,
  DRAGGABLE_SERVICE,
  EDITOR_VALIDATION_SERVICE,
  ENTITY_INSTANCE_SERVICE,
  FILE_HANDLING_SERVICE,
  INFORMATION_HANDLING_SERVICE,
  MODEL_CHECKER_SERVICE,
  MODEL_LOADER_SERVICE,
  MODEL_OPENER_SERVICE,
  MODEL_SAVER_TOKEN_SERVICE,
  RENAME_MODEL_DIALOG_SERVICE,
  SHAPE_SETTINGS_SERVICE,
  SHAPE_SETTINGS_STATE_SERVICE,
  TAURI_IPC_BRIDGES,
} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service';
import {EntityInstanceService} from './editor-dialog/components/entity-instance/entity-instance-view/entity-instance.service';
import {ShapeSettingsStateService} from './editor-dialog/services/shape-settings-state.service';
import {ShapeSettingsService} from './editor-dialog/services/shape-settings.service';
import {FileHandlingService} from './editor-toolbar/services/file-handling.service';
import {InformationHandlingService} from './editor-toolbar/services/information-handling.service';
import {EditorService} from './editor.service';
import {ModelCheckerService} from './model-checker.service';
import {ModelLoaderService} from './model-loader.service';
import {ModelOpenerService} from './model-opener/model-opener.service';
import {ModelSaverService} from './model-saver.service';
import {RenameModelDialogService} from './rename-model/rename-model.service';
import {EditorTauriBridge} from './tauri/editor-tauri-bridge.service';

/** Binds all editor implementations to their shared contracts. */
export function provideEditor(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: CONFIRM_DIALOG_SERVICE, useExisting: ConfirmDialogService},
    {provide: RENAME_MODEL_DIALOG_SERVICE, useExisting: RenameModelDialogService},
    {provide: ENTITY_INSTANCE_SERVICE, useExisting: EntityInstanceService},
    {provide: MODEL_OPENER_SERVICE, useExisting: ModelOpenerService},
    {provide: MODEL_LOADER_SERVICE, useExisting: ModelLoaderService},
    {provide: MODEL_CHECKER_SERVICE, useExisting: ModelCheckerService},
    {provide: DRAGGABLE_SERVICE, useExisting: EditorService},
    {provide: INFORMATION_HANDLING_SERVICE, useExisting: InformationHandlingService},
    {provide: SHAPE_SETTINGS_SERVICE, useExisting: ShapeSettingsService},
    {provide: SHAPE_SETTINGS_STATE_SERVICE, useExisting: ShapeSettingsStateService},
    {provide: EDITOR_VALIDATION_SERVICE, useExisting: EditorService},
    {provide: MODEL_SAVER_TOKEN_SERVICE, useExisting: ModelSaverService},
    {provide: FILE_HANDLING_SERVICE, useExisting: FileHandlingService},
    {provide: TAURI_IPC_BRIDGES, useExisting: EditorTauriBridge, multi: true},
  ]);
}
