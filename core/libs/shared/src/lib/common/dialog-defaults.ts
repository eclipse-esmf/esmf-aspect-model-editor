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

import {EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig} from '@angular/material/dialog';
import {DialogEscapeHandler} from './dialog-close';

/**
 * Viewport limits applied to every dialog unless a dialog explicitly overrides them.
 * Together with the global dialog styles (styles.scss) they keep header and actions visible
 * on small screens while the dialog content scrolls.
 */
export const AME_DIALOG_MAX_WIDTH = '95vw';
export const AME_DIALOG_MAX_HEIGHT = '95vh';

/**
 * Turns a fixed dialog size into one that never exceeds the viewport, e.g. `min(550px, 95vw)`.
 * Needed for `minWidth`: CSS lets `min-width` win over `max-width`, so a fixed minimum would
 * otherwise push the dialog out of a small window.
 */
export function viewportSafeWidth(px: number): string {
  return `min(${px}px, ${AME_DIALOG_MAX_WIDTH})`;
}

/**
 * Dialog defaults of the application:
 * - dialogs never exceed the viewport,
 * - clicking outside a dialog does not close it (`disableClose`); a dialog is closed via its buttons,
 *   its (x) button or the Escape key (see {@link DialogEscapeHandler}).
 */
export function provideAmeDialogDefaults(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {...new MatDialogConfig(), maxWidth: AME_DIALOG_MAX_WIDTH, maxHeight: AME_DIALOG_MAX_HEIGHT, disableClose: true},
    },
    provideEnvironmentInitializer(() => inject(DialogEscapeHandler).init()),
  ]);
}
