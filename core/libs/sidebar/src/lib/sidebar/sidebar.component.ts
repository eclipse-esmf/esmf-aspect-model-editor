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
import {ChangeDetectorRef, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ame-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public sidebarService = inject(SidebarStateService);
  private changeDetector = inject(ChangeDetectorRef);

  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.selection.selection$.subscribe(() => {
        requestAnimationFrame(() => {
          this.changeDetector.detectChanges();
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
