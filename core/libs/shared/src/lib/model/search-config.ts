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

export const unitSearchOption = {
  useExtendedSearch: true, // enable special search ex: *value = items that include value
  includeScore: true, // add score for each list entry
  keys: ['name'], // object attribute to consider for search
  threshold: 0.0, // score needed by list entries in order to be returned by search (0.0 =  perfect match, 1.0 = match anything).
};

export const mxCellSearchOption = {
  useExtendedSearch: true,
  includeScore: true,
  keys: ['id'],
  threshold: 0.1,
};

export const filesSearchOption = {
  useExtendedSearch: true,
  includeScore: true,
  keys: ['file', 'namespace'],
  findAllMatches: true,
};

export const entityValueSearchOption = {
  useExtendedSearch: true,
  includeScore: true,
  keys: ['name'],
  threshold: 0.0,
};
