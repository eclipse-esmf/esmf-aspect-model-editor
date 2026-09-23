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

import {ModelElementNamingService} from '@ame/domain';
import {
  MaxGraphDomainBridgeService,
  MaxGraphFilterRendererService,
  MaxGraphService,
  MaxGraphSettingsBridgeService,
  ShapeConnectorService,
  ThemeService,
} from '@ame/graph';
import {LoadedFilesService} from '@ame/infrastructure';
import {
  APP_CONFIG,
  config,
  CONFIGURATION_SERVICE,
  CONFIRM_DIALOG_SERVICE,
  DRAGGABLE_SERVICE,
  EDITOR_THEME_SERVICE,
  EDITOR_VALIDATION_SERVICE,
  ENTITY_INSTANCE_SERVICE,
  FILE_HANDLING_SERVICE,
  GRAPH_ADAPTER,
  GRAPH_FILTER_RENDERER,
  GRAPH_VALIDATION_ERROR_HIGHLIGHTER,
  INFORMATION_HANDLING_SERVICE,
  LOADED_FILES_SERVICE,
  MAX_GRAPH_SETTINGS_SERVICE,
  MODEL_CHECKER_SERVICE,
  MODEL_ELEMENT_NAMING_SERVICE,
  MODEL_LOADER_SERVICE,
  MODEL_OPENER_SERVICE,
  MODEL_SAVER_TOKEN_SERVICE,
  MODEL_SAVING_TRACKER_SERVICE,
  RENAME_MODEL_DIALOG_SERVICE,
  SAMM_LANGUAGE_SETTINGS_SERVICE,
  SHAPE_CONNECTOR_SERVICE,
  SHAPE_SETTINGS_SERVICE,
  SHAPE_SETTINGS_STATE_SERVICE,
  SIDEBAR_STATE_SERVICE,
  TAURI_TUNNEL_SERVICE,
} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {
  ConfirmDialogService,
  EditorService,
  EntityInstanceService,
  FileHandlingService,
  InformationHandlingService,
  ModelCheckerService,
  ModelLoaderService,
  ModelOpenerService,
  ModelSaverService,
  ModelSavingTrackerService,
  RenameModelDialogService,
  ShapeSettingsService,
  ShapeSettingsStateService,
} from '../editor';
import {ConfigurationService, SammLanguageSettingsService} from '../settings-dialog';
import {SidebarStateService} from '../sidebar';
import {TauriTunnelService} from './tauri-tunnel.service';

/**
 * Returns environment providers for all Aspect Model Editor feature services.
 * This encapsulates feature DI bindings so the shell application does not need
 * direct imports to graph, domain, samm, or infrastructure layers.
 */
export function provideAmeFeatures(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_CONFIG, useValue: config},
    {provide: CONFIRM_DIALOG_SERVICE, useExisting: ConfirmDialogService},
    {provide: RENAME_MODEL_DIALOG_SERVICE, useExisting: RenameModelDialogService},
    {provide: ENTITY_INSTANCE_SERVICE, useExisting: EntityInstanceService},
    {provide: MODEL_OPENER_SERVICE, useExisting: ModelOpenerService},
    {provide: MODEL_LOADER_SERVICE, useExisting: ModelLoaderService},
    {provide: MODEL_CHECKER_SERVICE, useExisting: ModelCheckerService},
    {provide: DRAGGABLE_SERVICE, useExisting: EditorService},
    {provide: INFORMATION_HANDLING_SERVICE, useExisting: InformationHandlingService},
    {provide: TAURI_TUNNEL_SERVICE, useExisting: TauriTunnelService},
    {provide: SHAPE_SETTINGS_SERVICE, useExisting: ShapeSettingsService},
    {provide: SHAPE_SETTINGS_STATE_SERVICE, useExisting: ShapeSettingsStateService},
    {provide: EDITOR_VALIDATION_SERVICE, useExisting: EditorService},
    {provide: MODEL_SAVER_TOKEN_SERVICE, useExisting: ModelSaverService},
    {provide: MODEL_SAVING_TRACKER_SERVICE, useExisting: ModelSavingTrackerService},
    {provide: FILE_HANDLING_SERVICE, useExisting: FileHandlingService},
    {provide: MODEL_ELEMENT_NAMING_SERVICE, useExisting: ModelElementNamingService},
    {provide: SIDEBAR_STATE_SERVICE, useExisting: SidebarStateService},
    {provide: GRAPH_FILTER_RENDERER, useExisting: MaxGraphFilterRendererService},
    {provide: GRAPH_ADAPTER, useExisting: MaxGraphDomainBridgeService},
    {provide: SHAPE_CONNECTOR_SERVICE, useExisting: ShapeConnectorService},
    {provide: CONFIGURATION_SERVICE, useExisting: ConfigurationService},
    {provide: SAMM_LANGUAGE_SETTINGS_SERVICE, useExisting: SammLanguageSettingsService},
    {provide: EDITOR_THEME_SERVICE, useExisting: ThemeService},
    {provide: MAX_GRAPH_SETTINGS_SERVICE, useExisting: MaxGraphSettingsBridgeService},
    {provide: GRAPH_VALIDATION_ERROR_HIGHLIGHTER, useExisting: MaxGraphService},
    {provide: LOADED_FILES_SERVICE, useExisting: LoadedFilesService},
  ]);
}
