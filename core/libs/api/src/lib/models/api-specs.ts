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

export interface OpenApi {
  language: string;
  output: string;
  baseUrl: string;
  includeQueryApi: boolean;
  useSemanticVersion: boolean;
  paging: string;
  resourcePath: string;
  ymlProperties: string;
  jsonProperties: string;
  includePost: boolean;
  includePut: boolean;
  includePatch: boolean;
}

export interface OpenApiModel {
  baseUrl: string;
  language: string;
  includeQueryApi: boolean;
  useSemanticVersion: boolean;
  activateResourcePath: boolean;
  output: string;
  paging: string;
  resourcePath: string;
  file: File | null;
  ymlProperties: string | null;
  jsonProperties: string | null;
  includePost: boolean;
  includePut: boolean;
  includePatch: boolean;
}

export interface AsyncApi {
  language: string;
  output: string;
  applicationId: string;
  channelAddress: string;
  useSemanticVersion: boolean;
  writeSeparateFiles: boolean;
}
