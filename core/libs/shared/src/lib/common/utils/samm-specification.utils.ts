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

const SAMM_SPECIFICATION_BASE_URL = 'https://eclipse-esmf.github.io/samm-specification';

export function sammSpecificationUrl(sammVersion: string, page = 'index.html'): string {
  return `${SAMM_SPECIFICATION_BASE_URL}/${encodeURIComponent(sammVersion)}/${page}`;
}
