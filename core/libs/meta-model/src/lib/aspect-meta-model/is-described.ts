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

export interface IsDescribed {
  getPreferredName(locale: string): string;

  addPreferredName(locale: string, preferredName: string): void;

  removePreferredName(locale: string): string;

  getDescription(locale: string): string;

  addDescription(locale: string, description: string): void;

  removeDescription(locale: string): string;

  getAllLocalesPreferredNames(): Array<string>;

  getAllLocalesDescriptions(): Array<string>;

  getSeeReferences(): Array<string>;

  addSeeReference(reference: string);

  setSeeReferences(references: Array<string>);
}
