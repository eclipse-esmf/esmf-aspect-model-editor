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

import {ConfigurationService, EditorTabItem, TabsStore} from '@ame/domain';
import {BrowserService, SessionModelInfo, TauriSignals, TauriSignalsService, WindowSession} from '@ame/shared';
import {computed, DestroyRef, inject, Injectable, Injector} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, map} from 'rxjs';

export const SESSION_PUBLISH_DEBOUNCE_MS = 300;

/** Only saved workspace models can be reopened; new and uploaded models are not part of the session. */
export function isRestorableTab(tab: EditorTabItem): boolean {
  return Boolean(tab.fromWorkspace && tab.aspectModelUrn && tab.namespace && tab.file && !tab.file.includes('new-model'));
}

export function toWindowSession(tabs: EditorTabItem[], activeTabId: string | null): WindowSession {
  const restorable = tabs.filter(isRestorableTab);
  const models: SessionModelInfo[] = restorable.map(tab => ({
    namespace: tab.namespace,
    file: tab.file,
    aspectModelUrn: tab.aspectModelUrn as string,
  }));
  const activeIndex = Math.max(
    0,
    restorable.findIndex(tab => tab.id === activeTabId),
  );
  return {models, activeIndex};
}

/**
 * Keeps the session of this window up to date: the open workspace models (tabs) are sent to the desktop shell,
 * which persists them together with the window geometry.
 */
@Injectable({providedIn: 'root'})
export class SessionTrackerService {
  private readonly tabsStore = inject(TabsStore);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly browserService = inject(BrowserService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private started = false;

  readonly windowSession = computed(() => toWindowSession(this.tabsStore.entities(), this.tabsStore.activeTabId()));

  /**
   * Starts tracking. Called once the startup model(s) are loaded, so a restore in progress never overwrites
   * the stored session with an incomplete state.
   */
  start(): void {
    if (this.started || !this.browserService.isStartedAsTauriApp()) return;
    this.started = true;

    toObservable(this.windowSession, {injector: this.injector})
      .pipe(
        debounceTime(SESSION_PUBLISH_DEBOUNCE_MS),
        map(session => JSON.stringify(session)),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(session => this.tauriSignalsService.call('updateSession', JSON.parse(session)));

    this.configurationService.settings$
      .pipe(
        map(settings => settings?.restoreSession !== false),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(enabled => this.tauriSignalsService.call('setSessionRestoreEnabled', enabled));
  }
}
