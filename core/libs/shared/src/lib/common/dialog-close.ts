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

import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {filter, takeUntil} from 'rxjs/operators';

/**
 * Implemented by dialogs whose (x) button / Escape key must not simply close with `undefined`,
 * e.g. to return a "cancel" result, to ask about unsaved changes or to stay open while a process runs.
 */
export interface DialogCloseRequestHandler {
  requestClose(): void;
}

function hasCloseRequestHandler(instance: unknown): instance is DialogCloseRequestHandler {
  return typeof (instance as DialogCloseRequestHandler | null)?.requestClose === 'function';
}

/** Closes a dialog the way its (x) button does: via the dialog's own handler if it has one. */
export function requestDialogClose(ref: MatDialogRef<unknown>): void {
  const instance = ref.componentInstance;
  if (hasCloseRequestHandler(instance)) {
    instance.requestClose();
  } else {
    ref.close();
  }
}

/**
 * Dialogs are opened with `disableClose` (no closing by clicking outside). Material then also ignores
 * the Escape key, so this handler restores Escape for every dialog and routes it through
 * {@link requestDialogClose}, i.e. Escape behaves exactly like the (x) button.
 */
@Injectable({providedIn: 'root'})
export class DialogEscapeHandler {
  private readonly matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.matDialog.afterOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ref => this.watch(ref));
  }

  private watch(ref: MatDialogRef<unknown>): void {
    // Without disableClose Material handles Escape itself.
    if (!ref.disableClose) return;

    ref
      .keydownEvents()
      .pipe(
        filter(
          event =>
            event.key === 'Escape' && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey,
        ),
        takeUntil(ref.afterClosed()),
      )
      .subscribe(event => {
        event.preventDefault();
        requestDialogClose(ref);
      });
  }
}
