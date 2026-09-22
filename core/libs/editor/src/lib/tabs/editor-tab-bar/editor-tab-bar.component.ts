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

import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, ViewChild} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {TabStateService} from '../tab-state.service';

@Component({
  selector: 'ame-editor-tab-bar',
  templateUrl: './editor-tab-bar.component.html',
  styleUrls: ['./editor-tab-bar.component.scss'],
  imports: [MatIconModule, MatIconButton, MatTooltipModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorTabBarComponent {
  public readonly tabState = inject(TabStateService);

  @ViewChild('scrollContainer', {static: false})
  private scrollContainer?: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      const activeId = this.tabState.activeTabId();
      if (activeId && this.scrollContainer?.nativeElement) {
        setTimeout(() => {
          const tabEl = this.scrollContainer?.nativeElement.querySelector(`[data-tab-id="${activeId}"]`);
          if (tabEl) {
            tabEl.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
          }
        }, 0);
      }
    });
  }

  public selectTab(tabId: string): void {
    this.tabState.switchToTab(tabId).subscribe();
  }

  public closeTab(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.tabState.closeTab(tabId).subscribe();
  }

  public addTab(): void {
    this.tabState.createEmptyTab();
  }

  public scrollLeft(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({left: -150, behavior: 'smooth'});
    }
  }

  public scrollRight(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({left: 150, behavior: 'smooth'});
    }
  }

  public onWheel(event: WheelEvent): void {
    if (this.scrollContainer?.nativeElement) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      this.scrollContainer.nativeElement.scrollLeft += delta;
      event.preventDefault();
    }
  }
}
