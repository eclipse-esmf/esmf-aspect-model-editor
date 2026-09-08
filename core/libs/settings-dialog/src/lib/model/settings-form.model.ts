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

import {Langcode} from './langcode';

export interface AutomatedWorkflowFormData {
  autoSaveEnabled: boolean;
  saveTimerSeconds: number;
  autoValidationEnabled: boolean;
  validationTimerSeconds: number;
  autoFormatEnabled: boolean;
}

export interface EditorConfigurationFormData {
  enableHierarchicalLayout: boolean;
  showConnectionLabels: boolean;
  darkMode: boolean;
}

export interface AspectModelLanguageEntry {
  language: Langcode | string | null;
}

export interface LanguageConfigurationFormData {
  userInterface: string;
  aspectModel: AspectModelLanguageEntry[];
}

export interface NamespaceConfigurationFormData {
  aspectUri: string;
  aspectName: string;
  aspectVersion: string;
  sammVersion: string;
}

export interface CopyrightHeaderConfigurationFormData {
  copyright: string;
}

export interface SettingsFormData {
  automatedWorkflow: AutomatedWorkflowFormData;
  editorConfiguration: EditorConfigurationFormData;
  languageConfiguration: LanguageConfigurationFormData;
  namespaceConfiguration: NamespaceConfigurationFormData;
  copyrightHeaderConfiguration: CopyrightHeaderConfigurationFormData;
}
