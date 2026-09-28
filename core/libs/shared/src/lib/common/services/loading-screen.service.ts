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

import {inject, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {Observable, Subject} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {LoadingScreenComponent} from '../components';
import {createDebouncedLoading, DebouncedLoading} from '../utils';

export type LoadingScreenOptions = Omit<MatDialogConfig, 'data'> & {
  title?: string;
  content?: string;
  hasCloseButton?: boolean;
  closeButtonAction?: () => void;
  debounceMs?: number;
  minDurationMs?: number;
  immediate?: boolean;
};

export interface LoadingScreenHandle {
  afterOpened(): Observable<void>;
  afterClosed(): Observable<unknown>;
  close(): void;
}

@Injectable({providedIn: 'root'})
export class LoadingScreenService {
  private readonly matDialog = inject(MatDialog);

  public dialog: MatDialogRef<LoadingScreenComponent> | null = null;
  private currentOptions: LoadingScreenOptions | null = null;
  private readonly activeHandles = new Set<LoadingScreenHandle>();
  private readonly dialogOpened$ = new Subject<MatDialogRef<LoadingScreenComponent>>();
  private readonly cancelPending$ = new Subject<void>();

  private readonly debounced: DebouncedLoading = createDebouncedLoading({
    debounceMs: 200,
    minDurationMs: 300,
    onShow: () => this.openDialog(),
    onHide: () => this.closeDialog(),
  });

  public readonly loading = this.debounced.loading;

  open(options: LoadingScreenOptions = {}): LoadingScreenHandle {
    this.currentOptions = options;
    const debounceMs = options.immediate ? 0 : (options.debounceMs ?? 200);
    const minDurationMs = options.minDurationMs ?? 300;

    let isClosed = false;

    const handle: LoadingScreenHandle = {
      afterOpened: () => {
        if (this.dialog) {
          return this.dialog.afterOpened();
        }
        return this.dialogOpened$.pipe(
          switchMap(dialogRef => dialogRef.afterOpened()),
          take(1),
          takeUntil(this.cancelPending$),
        );
      },
      afterClosed: () => {
        if (this.dialog) {
          return this.dialog.afterClosed();
        }
        return this.dialogOpened$.pipe(
          switchMap(dialogRef => dialogRef.afterClosed()),
          take(1),
          takeUntil(this.cancelPending$),
        );
      },
      close: () => {
        if (isClosed) {
          return;
        }
        isClosed = true;
        this.activeHandles.delete(handle);
        if (this.activeHandles.size === 0) {
          this.cancelPending$.next();
          this.debounced.hide();
        }
      },
    };

    this.activeHandles.add(handle);
    this.debounced.show({debounceMs, minDurationMs});

    return handle;
  }

  close(): void {
    this.activeHandles.clear();
    this.cancelPending$.next();
    this.debounced.hide();
  }

  private openDialog(): void {
    if (this.dialog) {
      return;
    }
    const options = this.currentOptions ?? {};
    const matDialogConfig: MatDialogConfig = {...options};
    delete (matDialogConfig as any).title;
    delete (matDialogConfig as any).content;
    delete (matDialogConfig as any).hasCloseButton;
    delete (matDialogConfig as any).closeButtonAction;
    delete (matDialogConfig as any).debounceMs;
    delete (matDialogConfig as any).minDurationMs;
    delete (matDialogConfig as any).immediate;

    const dialogRef = this.matDialog.open(LoadingScreenComponent, {
      ...matDialogConfig,
      data: options,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      if (this.dialog === dialogRef) {
        this.dialog = null;
        this.currentOptions = null;
        this.activeHandles.clear();
      }
    });
    this.dialog = dialogRef;
    this.dialogOpened$.next(dialogRef);
  }

  private closeDialog(): void {
    if (this.dialog) {
      this.dialog.close();
      this.dialog = null;
    }
    this.currentOptions = null;
  }
}
