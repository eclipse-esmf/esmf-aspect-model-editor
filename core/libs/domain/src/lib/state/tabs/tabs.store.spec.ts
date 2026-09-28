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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it, beforeEach} from 'vitest';
import {TabsStore} from './tabs.store';

describe('TabsStore', () => {
  let store: InstanceType<typeof TabsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TabsStore],
    });
    store = TestBed.inject(TabsStore);
  });

  it('should initialize empty', () => {
    expect(store.entities().length).toBe(0);
    expect(store.activeTabId()).toBeNull();
    expect(store.activeTab()).toBeNull();
    expect(store.hasMultipleTabs()).toBe(false);
  });

  it('should add tabs and set active tab', () => {
    store.addOrUpdateTab({
      id: 'ns:Model1.ttl',
      file: 'Model1.ttl',
      namespace: 'ns',
    });
    store.setActiveTabId('ns:Model1.ttl');

    expect(store.entities().length).toBe(1);
    expect(store.activeTab()?.file).toBe('Model1.ttl');
    expect(store.hasMultipleTabs()).toBe(false);

    store.addOrUpdateTab({
      id: 'ns:Model2.ttl',
      file: 'Model2.ttl',
      namespace: 'ns',
    });
    expect(store.entities().length).toBe(2);
    expect(store.hasMultipleTabs()).toBe(true);
  });

  it('should track dirty state', () => {
    store.addOrUpdateTab({
      id: 'ns:Model1.ttl',
      file: 'Model1.ttl',
      namespace: 'ns',
      isDirty: false,
    });

    expect(store.hasDirtyTabs()).toBe(false);

    store.setTabDirty('ns:Model1.ttl', true);
    expect(store.hasDirtyTabs()).toBe(true);
    expect(store.dirtyTabs().length).toBe(1);
  });

  it('should select next tab when active tab is removed', () => {
    store.addOrUpdateTab({id: 'tab1', file: '1.ttl', namespace: 'ns'});
    store.addOrUpdateTab({id: 'tab2', file: '2.ttl', namespace: 'ns'});
    store.setActiveTabId('tab1');

    store.removeTab('tab1');
    expect(store.entities().length).toBe(1);
    expect(store.activeTabId()).toBe('tab2');

    store.removeTab('tab2');
    expect(store.entities().length).toBe(0);
    expect(store.activeTabId()).toBeNull();
  });
});
