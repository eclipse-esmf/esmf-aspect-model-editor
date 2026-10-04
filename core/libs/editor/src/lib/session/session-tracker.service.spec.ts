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
import {BrowserService, TauriSignalsService} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {SESSION_PUBLISH_DEBOUNCE_MS, SessionTrackerService, isRestorableTab, toWindowSession} from './session-tracker.service';

const tab = (name: string, overrides: Partial<EditorTabItem> = {}): EditorTabItem => ({
  id: `org.example:1.0.0:${name}.ttl`,
  namespace: 'org.example:1.0.0',
  file: `${name}.ttl`,
  aspectModelUrn: `urn:samm:org.example:1.0.0#${name}`,
  fromWorkspace: true,
  ...overrides,
});

describe('session tracking helpers', () => {
  it('should only persist saved workspace models', () => {
    expect(isRestorableTab(tab('A'))).toBe(true);
    expect(isRestorableTab(tab('B', {fromWorkspace: false}))).toBe(false);
    expect(isRestorableTab(tab('C', {aspectModelUrn: undefined}))).toBe(false);
    expect(isRestorableTab(tab('new-model'))).toBe(false);
  });

  it('should map the tabs of a window to its session with the active tab', () => {
    const tabs = [tab('A'), tab('new-model', {fromWorkspace: false}), tab('B')];

    expect(toWindowSession(tabs, tabs[2].id)).toEqual({
      models: [
        {namespace: 'org.example:1.0.0', file: 'A.ttl', aspectModelUrn: 'urn:samm:org.example:1.0.0#A'},
        {namespace: 'org.example:1.0.0', file: 'B.ttl', aspectModelUrn: 'urn:samm:org.example:1.0.0#B'},
      ],
      activeIndex: 1,
    });
    expect(toWindowSession(tabs, tabs[1].id).activeIndex).toBe(0);
    expect(toWindowSession([], null)).toEqual({models: [], activeIndex: 0});
  });
});

describe('SessionTrackerService', () => {
  let tabsStore: InstanceType<typeof TabsStore>;
  let call: ReturnType<typeof vi.fn>;
  let isTauri: boolean;
  let settings$: BehaviorSubject<any>;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: TauriSignalsService, useValue: {call}},
        {provide: BrowserService, useValue: {isStartedAsTauriApp: () => isTauri}},
        {provide: ConfigurationService, useValue: {settings$}},
      ],
    });
    tabsStore = TestBed.inject(TabsStore);
    return TestBed.inject(SessionTrackerService);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    call = vi.fn();
    isTauri = true;
    settings$ = new BehaviorSubject<any>({restoreSession: true});
  });

  afterEach(() => vi.useRealTimers());

  const flush = async () => {
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(SESSION_PUBLISH_DEBOUNCE_MS + 10);
  };

  const sessionCalls = () => call.mock.calls.filter(([name]) => name === 'updateSession').map(([, payload]) => payload);
  const lastSession = () => sessionCalls()[sessionCalls().length - 1];

  it('should publish nothing before it is started', async () => {
    setup();
    tabsStore.addOrUpdateTab(tab('A'));
    await flush();

    expect(call).not.toHaveBeenCalled();
  });

  it('should publish the open models and changes like closing a tab', async () => {
    const tracker = setup();
    tabsStore.addOrUpdateTab(tab('A'));
    tabsStore.addOrUpdateTab(tab('B'));
    tabsStore.setActiveTabId(tab('B').id);
    tracker.start();
    await flush();

    expect(lastSession()).toEqual(expect.objectContaining({activeIndex: 1}));
    expect(lastSession().models).toHaveLength(2);

    tabsStore.removeTab(tab('B').id);
    tabsStore.setActiveTabId(tab('A').id);
    await flush();

    expect(lastSession().models.map((m: any) => m.file)).toEqual(['A.ttl']);
  });

  it('should not publish unchanged sessions twice', async () => {
    const tracker = setup();
    tabsStore.addOrUpdateTab(tab('A'));
    tracker.start();
    await flush();
    tabsStore.setTabDirty(tab('A').id, true);
    await flush();

    expect(sessionCalls()).toHaveLength(1);
  });

  it('should forward the restore setting', async () => {
    const tracker = setup();
    tracker.start();
    settings$.next({restoreSession: false});
    settings$.next({restoreSession: false});

    const restoreCalls = call.mock.calls.filter(([name]) => name === 'setSessionRestoreEnabled');
    expect(restoreCalls.map(([, enabled]) => enabled)).toEqual([true, false]);
  });

  it('should do nothing outside of the desktop app', async () => {
    isTauri = false;
    const tracker = setup();
    tabsStore.addOrUpdateTab(tab('A'));
    tracker.start();
    await flush();

    expect(call).not.toHaveBeenCalled();
  });
});
