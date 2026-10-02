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

import {SearchStore, TabsStore, UiShellStore} from '@ame/domain';
import {computed, inject, Injectable, signal} from '@angular/core';
import {ShapeSettingsStateService} from '../editor-dialog/services/shape-settings-state.service';

export type EditorViewMode = 'graph' | 'text';

export interface TextViewRevealRequest {
  urn: string;
  id: number;
}

/** Holds which view (MaxGraph or Turtle text) is shown for each editor tab. */
@Injectable({providedIn: 'root'})
export class EditorViewModeService {
  private readonly tabsStore = inject(TabsStore);
  private readonly shapeSettingsState = inject(ShapeSettingsStateService);
  private readonly searchStore = inject(SearchStore);
  private readonly uiShellStore = inject(UiShellStore);

  private readonly modes = signal<Record<string, EditorViewMode>>({});
  private readonly tabKey = computed(() => this.tabsStore.activeTabId() ?? '');
  private readonly _revealRequest = signal<TextViewRevealRequest | null>(null);
  private readonly _searchRequest = signal(0);
  private requestCounter = 0;

  public readonly mode = computed<EditorViewMode>(() => this.modes()[this.tabKey()] ?? 'graph');
  public readonly isTextView = computed(() => this.mode() === 'text');
  /** Element the text view should scroll to once its content is available. */
  public readonly revealRequest = this._revealRequest.asReadonly();
  /** Incremented whenever the search panel of the text view should be opened. */
  public readonly searchRequest = this._searchRequest.asReadonly();

  setMode(mode: EditorViewMode): void {
    if (mode === this.mode()) {
      return;
    }

    if (mode === 'text') {
      // Graph-only overlays would keep editing a model that is no longer visible.
      this.shapeSettingsState.closeShapeSettings();
      this.shapeSettingsState.setSelectedShapeForUpdate(null);
      this.searchStore.closeElementsSearch();
      // The text view uses the full width of the editor.
      this.uiShellStore.closeSidebar();
    }

    const key = this.tabKey();
    this.modes.update(modes => ({...modes, [key]: mode}));
  }

  toggle(): void {
    this.setMode(this.isTextView() ? 'graph' : 'text');
  }

  revealElement(urn: string): void {
    if (!urn) {
      return;
    }
    this.setMode('text');
    this._revealRequest.set({urn, id: ++this.requestCounter});
  }

  clearRevealRequest(id: number): void {
    if (this._revealRequest()?.id === id) {
      this._revealRequest.set(null);
    }
  }

  requestSearch(): void {
    this._searchRequest.update(value => value + 1);
  }
}
