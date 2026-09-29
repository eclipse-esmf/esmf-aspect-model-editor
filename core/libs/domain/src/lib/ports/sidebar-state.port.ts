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

export abstract class SidebarStatePort {
  abstract namespacesState?: {
    namespaces: () => Record<string, any[]>;
    getFile: (namespace: string, fileName: string) => any;
  };
  abstract updateWorkspace?(fileStatus?: any[]): Record<string, any[]>;
  abstract workspace?: {
    refresh?: () => void;
    [key: string]: any;
  };
  [key: string]: any;
}
