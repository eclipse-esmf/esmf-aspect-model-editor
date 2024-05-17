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

import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {finalize, Subscription} from 'rxjs';
import {SidebarStateService} from '@ame/sidebar';

@Component({
  selector: 'ame-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  public sidebarService = inject(SidebarStateService);

  public namespaces = this.sidebarService.namespacesState;
  public loading = false;

  public get namespacesKeys(): string[] {
    return this.namespaces.namespacesKeys;
  }

  private subscription = new Subscription();

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    const namespaces$ = this.sidebarService.workspace.refreshSignal$.subscribe(() => {
      this.loading = true;
      this.changeDetector.detectChanges();
      const refreshing$ = this.sidebarService
        .requestGetNamespaces()
        .pipe(
          finalize(() => {
            this.loading = false;
            this.changeDetector.detectChanges();
          })
        )
        .subscribe();
      this.subscription.add(refreshing$);
    });

    this.subscription.add(namespaces$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
