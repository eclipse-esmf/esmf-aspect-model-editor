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

/**
 * The URNs of the referenced elements that no workspace file defines, if the backend rejected a model only because of
 * them (409 with `unresolvedElements`). Works for the raw error body (`{error: {unresolvedElements}}`) and for
 * bodies the API layer already unwrapped (`{unresolvedElements}`).
 */
export function unresolvedElementsOf(httpError: unknown): string[] {
  const body = (httpError as {error?: any})?.error;
  const elements = body?.error?.unresolvedElements ?? body?.unresolvedElements;
  return Array.isArray(elements) ? elements : [];
}
