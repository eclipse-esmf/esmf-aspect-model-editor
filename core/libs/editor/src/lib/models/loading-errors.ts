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
export enum LoadingCodeErrors {
  NAMESPACE_DEPENDENCIES = 'NAMESPACE_DEPENDENCIES',
  PARSING_RDF_MODEL = 'PARSING_RDF_MODEL',
  SEQUENCE_LOADING = 'SEQUENCE_LOADING',
  LOADING_SINGLE_FILE = 'LOADING_SINGLE_FILE',
  LOADING_ASPECT_MODEL = 'LOADING_ASPECT_MODEL',
  LOAD_NEW_MODEL = 'LOAD_NEW_MODEL',
}
