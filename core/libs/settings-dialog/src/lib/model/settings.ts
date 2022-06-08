/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
export interface Settings {
  showEditorMap: boolean;
  showEditorNav: boolean;
  autoSaveEnabled: boolean;
  autoValidationEnabled: boolean;
  autoFormatEnabled: boolean;
  showValidationPopupNotifications: boolean;
  enableHierarchicalLayout: boolean;
  validationTimerSeconds: number;
  saveTimerSeconds: number;
  showEntityValueEntityEdge: boolean;
  showConnectionLabels: boolean;
  useSaturatedColors: boolean;
}
