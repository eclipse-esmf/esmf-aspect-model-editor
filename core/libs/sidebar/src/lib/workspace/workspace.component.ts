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

import {ModelCheckerService} from '@ame/editor';
import {SidebarStateService} from '@ame/sidebar';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Subscription, finalize, map} from 'rxjs';

@Component({
  selector: 'ame-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  public sidebarService = inject(SidebarStateService);
  private modelChecker = inject(ModelCheckerService);

  public namespaces = this.sidebarService.namespacesState;
  public loading = false;
  public error: {code: number; message: string; path: string} = null;

  public get namespacesKeys(): string[] {
    return this.namespaces.namespacesKeys;
  }

  private subscription = new Subscription();

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    let refreshing$: Subscription;
    const namespaces$ = this.sidebarService.workspace.refreshSignal$.subscribe(() => {
      refreshing$?.unsubscribe();
      this.error = null;
      this.loading = true;
      this.changeDetector.detectChanges();

      refreshing$ = this.modelChecker
        .detectWorkspaceErrors()
        .pipe(
          map(files => this.sidebarService.updateWorkspace(files)),
          finalize(() => {
            this.loading = false;
            this.changeDetector.detectChanges();
          }),
        )
        .subscribe({
          error: err => {
            if (err?.error?.error) {
              this.error = err.error.error;
            }
          },
        });
    });

    this.subscription.add(refreshing$);
    this.subscription.add(namespaces$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
