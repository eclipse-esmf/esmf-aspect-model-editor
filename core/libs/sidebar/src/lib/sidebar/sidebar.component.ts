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

import {SidebarStateService} from '@ame/sidebar';
import {AsyncPipe} from '@angular/common';
import {ChangeDetectorRef, Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SidebarMenuComponent} from '../sidebar-menu/sidebar-menu.component';
import {SidebarSAMMElementsComponent} from '../sidebar-samm-elements/sidebar-samm-elements.component';
import {WorkspaceComponent} from '../workspace/workspace.component';

@Component({
  selector: 'ame-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [SidebarMenuComponent, AsyncPipe, SidebarSAMMElementsComponent, WorkspaceComponent],
})
export class SidebarComponent implements OnInit {
  public destroyRef = inject(DestroyRef);
  public sidebarService = inject(SidebarStateService);
  private changeDetector = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.sidebarService.selection.selection$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      requestAnimationFrame(() => {
        this.changeDetector.detectChanges();
      });
    });
  }
}
