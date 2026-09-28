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

import {InjectionToken, Type} from '@angular/core';

export interface IDraggableService {
  makeDraggable(element: HTMLDivElement, dragElement: HTMLDivElement): void;
}

export const DRAGGABLE_SERVICE = new InjectionToken<IDraggableService>('DRAGGABLE_SERVICE');

export interface IInformationHandlingService {
  openSettingsDialog(): void;
  openHelpDialog(): void;
  openNotificationDialog(): void;
}

export const INFORMATION_HANDLING_SERVICE = new InjectionToken<IInformationHandlingService>('INFORMATION_HANDLING_SERVICE');

/** Component class of the settings dialog, provided by the app shell to avoid a feature -> settings dependency. */
export const SETTINGS_DIALOG_COMPONENT = new InjectionToken<Type<unknown>>('SETTINGS_DIALOG_COMPONENT');

export interface IShapeSettingsService {
  editModel(elementModel: any): void;
  editSelectedCell(): void;
}

export const SHAPE_SETTINGS_SERVICE = new InjectionToken<IShapeSettingsService>('SHAPE_SETTINGS_SERVICE');

export interface IShapeSettingsStateService {
  isShapeSettingOpened(): boolean;
  closeShapeSettings(): void;
}

export const SHAPE_SETTINGS_STATE_SERVICE = new InjectionToken<IShapeSettingsStateService>('SHAPE_SETTINGS_STATE_SERVICE');

export interface IEditorThemeService {
  currentTheme?: 'light' | 'dark';
  applyTheme(theme: string): void;
}

export const EDITOR_THEME_SERVICE = new InjectionToken<IEditorThemeService>('EDITOR_THEME_SERVICE');

export interface IMaxGraphSettingsService {
  formatShapes(enableHierarchicalLayout?: boolean): void;
  updateGraph(callback: () => void): void;
  removeUnnecessaryLanguages(languages: string[]): void;
}

export const MAX_GRAPH_SETTINGS_SERVICE = new InjectionToken<IMaxGraphSettingsService>('MAX_GRAPH_SETTINGS_SERVICE');
