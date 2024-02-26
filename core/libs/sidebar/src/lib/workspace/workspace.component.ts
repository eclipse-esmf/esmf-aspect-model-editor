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

import {ChangeDetectorRef, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Subscription} from 'rxjs';
import {SidebarStateService} from '../sidebar-state.service';

@Component({
  selector: 'ame-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
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
    let refreshing$: Subscription = null;
    const namespaces$ = this.sidebarService.workspace.refreshSignal$.subscribe(() => {
      refreshing$?.unsubscribe();
      refreshing$ = this.refreshWorkspace();
    });
    this.subscription.add(namespaces$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public refreshWorkspace() {
    this.loading = true;
    this.changeDetector.detectChanges();
    return this.sidebarService.requestGetNamespaces().subscribe(() => {
      this.loading = false;
      this.changeDetector.detectChanges();
    });
  }
}
