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

export interface WorkspaceFileItem {
  id: string; // namespace:fileName
  name: string;
  namespace: string;
  aspectModelUrn: string;
  loaded: boolean;
  outdated: boolean;
  errored: boolean;
  isLoadedInWorkspace: boolean;
  sammVersion?: string;
  dependencies?: string[];
  missingDependencies?: string[];
}

export interface WorkspaceSelection {
  namespace: string;
  file: string;
  aspectModelUrn: string;
}
