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

/** A saved workspace model which is open in a window (one per tab). */
export interface SessionModelInfo {
  namespace: string;
  file: string;
  aspectModelUrn: string;
}

/** The workspace models which are open in a window, as reported by the desktop shell for all windows. */
export interface OpenWindowModels {
  label: string;
  models: SessionModelInfo[];
}

/** The open models of all windows together with the label of the window which asked. */
export interface OpenModelsSnapshot {
  windowLabel: string;
  windows: OpenWindowModels[];
}

/** The models of one window as stored in the session and handed back to a restored window. */
export interface WindowSession {
  models: SessionModelInfo[];
  activeIndex: number;
}

export interface StartupPayload {
  namespace: string;
  file: string;
  editElement?: string;
  fromWorkspace?: boolean;
  aspectModelUrn?: string;
  /** Set when the window is reopened from the last session. */
  session?: WindowSession;
}

export interface StartupData {
  id: string;
  options: StartupPayload;
}
