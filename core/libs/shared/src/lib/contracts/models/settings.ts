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

export class ToggleSettings {
  autoValidation = false;
  validationTimer = 0;
  map = false;
  nav = false;
  notification = false;
}

/**
 * How the elements of an Aspect Model are ordered when the model is written:
 * - keepOrderAfterParent: existing elements keep their position, new elements follow the element which references them
 * - keepOrderAppend: existing elements keep their position, new elements are appended at the end
 * - formatterDefault: the order is defined by the formatter of the ESMF SDK
 */
export type ElementOrderStrategy = 'keepOrderAfterParent' | 'keepOrderAppend' | 'formatterDefault';

export const DEFAULT_ELEMENT_ORDER_STRATEGY: ElementOrderStrategy = 'formatterDefault';

export interface Settings {
  namespace: string;
  version: string;
  showEditorMap: boolean;
  showEditorNav: boolean;
  autoSaveEnabled: boolean;
  autoValidationEnabled: boolean;
  autoFormatEnabled: boolean;
  enableHierarchicalLayout: boolean;
  darkMode?: boolean;
  validationTimerSeconds: number;
  saveTimerSeconds: number;
  showConnectionLabels: boolean;
  useSaturatedColors: boolean;
  copyrightHeader: Array<string>;
  aspectModelLanguages: Array<string>;
  toolbarVisibility: boolean;
  elementOrderStrategy?: ElementOrderStrategy;
  /** Reopen the models and windows of the last session on start (desktop app only). */
  restoreSession?: boolean;
}
