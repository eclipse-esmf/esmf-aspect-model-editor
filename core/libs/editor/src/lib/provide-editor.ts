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
  ConfirmDialogPort,
  DraggablePort,
  EditorValidationPort,
  InformationHandlingPort,
  ModelLoaderPort,
  ModelOpenerPort,
  ModelSaverPort,
  RenameModelDialogPort,
  ShapeSettingsPort,
  ShapeSettingsStatePort,
} from '@ame/domain';
import {EntityInstancePort} from '@ame/graph';
import {FileHandlingPort, ModelCheckerPort, TAURI_IPC_BRIDGES} from '@ame/shared';
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
    {provide: ConfirmDialogPort, useExisting: ConfirmDialogService},
    {provide: RenameModelDialogPort, useExisting: RenameModelDialogService},
    {provide: EntityInstancePort, useExisting: EntityInstanceService},
    {provide: ModelOpenerPort, useExisting: ModelOpenerService},
    {provide: ModelLoaderPort, useExisting: ModelLoaderService},
    {provide: ModelCheckerPort, useExisting: ModelCheckerService},
    {provide: DraggablePort, useExisting: EditorService},
    {provide: InformationHandlingPort, useExisting: InformationHandlingService},
    {provide: ShapeSettingsPort, useExisting: ShapeSettingsService},
    {provide: ShapeSettingsStatePort, useExisting: ShapeSettingsStateService},
    {provide: EditorValidationPort, useExisting: EditorService},
    {provide: ModelSaverPort, useExisting: ModelSaverService},
    {provide: FileHandlingPort, useExisting: FileHandlingService},
    {provide: TAURI_IPC_BRIDGES, useExisting: EditorTauriBridge, multi: true},
  ]);
}
