/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

export interface FileInformation {
  absoluteName: string;
  fileName: string;
  aspectModelUrn: string;
  modelVersion: string;
  aspectModel: string;
}

export type FileEntry = Omit<FileInformation, 'aspectModel'>;
